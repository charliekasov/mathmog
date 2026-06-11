// @peakprep/mathmog/core/learn — the Learn session state machine (Phase 2A.3).
//
// Composes the 2A.1 per-item helpers into a full session: round assembly,
// miss re-queue, round summaries, completion detection, and the
// JSON-serializable session aggregate. Canonical pattern:
// DESIGN-mog-learn-mode.md §2 (portal repo); the 2A.1 HANDOFF §4 carries the
// design-lock rails this file encodes.
//
// Contracts this file owns:
//
// - **The session aggregate (`LearnSessionState`) is the 2B.1 Firestore wire
//   shape** (resume is a settled v1 requirement). It is plain-JSON-
//   serializable by construction: strings, numbers, and arrays only — no
//   Dates, no functions, no class instances, no undefined-holding fields.
//   `JSON.parse(JSON.stringify(s))` must deep-equal `s`; a test pins it.
//
// - **`LearnModuleDef.items` order is the canonical FIRST-CONTACT order;
//   review rounds shuffle within the chunk.** The 2A.2 curations sequenced
//   items deliberately (singleton times-table rows run 7×2 … 7×12), so a
//   chunk whose items are all still `new` presents in that order — gentle
//   first contact. Once a chunk has been attempted, subsequent rounds
//   shuffle it (Fisher–Yates, injectable rng like
//   `assembleRecognizeOptions`): identical ascending order at the recall
//   tier invites serial-position cueing (skip-counting 7×8 from the
//   previous answer instead of retrieving it), and recall has no option
//   layout to vary — un-shuffled review rounds would let the two
//   completion-defining recalls be sequence rides, the hollow-solid the
//   §3.0 Goodhart line exists to prevent (2A.3 reviewer revision).
//
// - **Round composition (this slice's policy call, pending plan-lock
//   ratification):** a round is a balanced chunk of the not-yet-solid items
//   in canonical order, at most `maxRoundSize` per round. Chunking keeps the
//   §3.1 pacing beat real for large modules (tt_full is 66 facts — one
//   summary per full pass would be no pacing at all) and degenerates to
//   "round 1 = all items" (design §2's expected shape) for any module of
//   `maxRoundSize` or fewer items, which is every singleton times-table row,
//   every squares/cubes scope, and every fractions scope. Balancing (divide
//   the remainder into equal-as-possible rounds) avoids orphan tails: 13
//   remaining items make rounds of 7 + 6, never 12 + 1. Because not-yet-solid
//   items are taken in canonical order, unfinished items from the front of
//   the module recur next round until they solidify — focused chunk-mastery —
//   and new items flow in as earlier ones go solid.
//
// - **Rounds contain not-yet-solid items only — no "warmth tail" of already-
//   solid items.** Two reasons beyond session-length respect: Drill owns
//   retention (§2.6), and under cumulative `correctRecalls` counting a solid
//   item that got re-quizzed and MISSED would stay solid (the counter never
//   resets), which is exactly the hollow-solid semantics the completion
//   condition exists to avoid.
//
// - **Miss re-queue (this slice's policy call):** a missed item drops a tier
//   (2A.1 `applyMiss`) and re-enters the SAME round's queue after
//   `requeueGap` other presentations (clamped to the queue's end — at small N
//   the loop is short; the fractions reviewer ruled short loops
//   non-degenerate). The gap exists so the retrieval isn't a working-memory
//   echo of the reveal; the clamp means a miss on the round's last item
//   re-presents immediately, which is accepted at small N. A See card
//   re-queues at the same gap: exposure, a breath, then the Recognize check.
//
// - **A correct answer retires the item for the round.** Escalation shows up
//   the NEXT time the item appears (design §2.2 "next time it appears"),
//   i.e. next round. Consequences: a round always ends on a correct answer
//   (misses and See cards re-queue, so they can never empty the queue), and
//   a perfect run completes in exactly three rounds per chunk (recognize →
//   recall → recall at `recallsToSolid: 2`).
//
// - **Completion can only land on a correct free recall.** Structural, not
//   incidental (2A.1 reviewer note): only recall-tier corrects move
//   `correctRecalls`, and the queue never holds solid items, so the
//   module-complete transition is always "the last not-yet-solid item was
//   just recalled correctly" — which also means completion always coincides
//   with a round boundary (the correct answer that completes the module also
//   empties the queue).
//
// - **Grading happens outside the machine.** Actions take a boolean verdict,
//   not the student's answer: the 2A.4 grader owns answer comparison
//   (including accepted families like `FRACTION_ACCEPTED_DECIMALS`), and the
//   machine imposes nothing on it. "Don't know?" is a miss (2A.1 rail):
//   callers pass `correct: false`; there is no separate decline path.
//
// - **Telemetry is events-out, never imports-in.** Actions return
//   `LearnSessionEvent`s describing what happened (tier transitions, the
//   solid crossing, round and module completion); the portal layer (2B.6)
//   maps them to `mathmog_events`. The machine never touches Firebase. Events
//   carry item id + tiers so the 2D feedback layer can attach a
//   `diagnoseMiss` identity at the UI without re-deriving state; the machine
//   itself carries no feedback strings.
//
// - **Reference-equality no-ops.** Like the 2A.1 helpers, every action
//   returns the SAME session reference (with an empty events array) when the
//   action doesn't apply — answering with no current item or at a See card,
//   tapping through a quizzed tier, starting a round mid-round or after
//   completion. `result.session === session` is the cheap change check.
//
// Standing rails: no percentages, streaks, or bars in any output here —
// `solidProgress` (a count pair) is the only progress shape; `attempts` /
// `misses` and the round summaries are trace data for the tutor surface,
// never student display. Spaced repetition stays un-designed-for (Q8).

import {
  applyCorrectAnswer,
  applyMiss,
  applySeen,
  createInitialItemStates,
  isItemSolid,
  isModuleComplete,
  validateLearnModuleDef,
} from './helpers';
import type {
  LearnConfig,
  LearnItemState,
  LearnModuleDef,
  LearnRoundState,
  LearnRoundSummary,
  LearnTier,
} from './types';

/**
 * The machine's tuning: the 2A.1 completion knob plus this slice's two
 * policy knobs. Per-product values live in the product binding
 * (`MATHMOG_LEARN_CONFIG`), never inline at call sites.
 */
export interface LearnSessionConfig extends LearnConfig {
  /**
   * Upper bound on items per round. Rounds are balanced: the not-yet-solid
   * remainder is divided into as few rounds as the bound allows, sized as
   * evenly as possible (13 remaining at a bound of 12 → 7 + 6, not 12 + 1).
   */
  maxRoundSize: number;
  /**
   * Presentations before a re-queued item (missed, or tapped through a See
   * card) comes back in the same round. Clamped to the queue's end.
   */
  requeueGap: number;
}

/**
 * Trace of the in-progress round; becomes the `LearnRoundSummary` when the
 * round's queue empties. Ids are unique and in first-occurrence order.
 */
export interface LearnRoundTrace {
  presentedItemIds: string[];
  missedItemIds: string[];
  newlySolidItemIds: string[];
}

/**
 * The session aggregate — everything Learn needs to run, resume, and report
 * one module pass. This exact shape is the 2B.1 Firestore wire format;
 * see the serializability contract in the file header. `itemStates` is in
 * `LearnModuleDef.items` order (creation order, never re-sorted).
 */
export interface LearnSessionState {
  moduleId: string;
  itemStates: LearnItemState[];
  round: LearnRoundState;
  roundTrace: LearnRoundTrace;
  roundSummaries: LearnRoundSummary[];
}

/**
 * Derived, never stored (same rail as `LearnItemStatus`):
 * - `in-round`: the queue has a current item to present.
 * - `round-complete`: the queue emptied and the module isn't done — the
 *   between-rounds summary screen; `startNextLearnRound` advances.
 * - `module-complete`: every item is solid. Terminal.
 */
export type LearnSessionPhase = 'in-round' | 'round-complete' | 'module-complete';

/**
 * What an action did, for the 2B.6 telemetry layer and the 2A.4 UI.
 * `tier-changed` fires on every rung move with its cause; note a correct
 * answer at `recall` moves no rung (the ladder clamps), so the solid path
 * is observed via `item-solid`, which fires exactly once per item — on the
 * recall-tier correct that crosses `recallsToSolid`.
 */
export type LearnSessionEvent =
  | {
      type: 'tier-changed';
      itemId: string;
      from: LearnTier;
      to: LearnTier;
      cause: 'correct' | 'miss' | 'seen';
    }
  | { type: 'item-solid'; itemId: string }
  | { type: 'round-complete'; summary: LearnRoundSummary }
  | { type: 'module-complete' };

export interface LearnActionResult {
  session: LearnSessionState;
  events: LearnSessionEvent[];
}

function emptyTrace(): LearnRoundTrace {
  return {
    presentedItemIds: [],
    missedItemIds: [],
    newlySolidItemIds: [],
  };
}

function appendUnique(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

/**
 * The round-composition policy: the next balanced chunk of not-yet-solid
 * items — canonical order on first contact (all items in the chunk still
 * unattempted), shuffled on review rounds. See the file header.
 */
function assembleRoundQueue(
  itemStates: LearnItemState[],
  config: LearnSessionConfig,
  rng: () => number
): string[] {
  const remaining = itemStates.filter(s => !isItemSolid(s, config));
  if (remaining.length === 0) return [];
  const rounds = Math.ceil(remaining.length / config.maxRoundSize);
  const chunk = remaining.slice(0, Math.ceil(remaining.length / rounds));
  const ids = chunk.map(s => s.itemId);
  if (chunk.every(s => s.attempts === 0)) return ids;
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

/**
 * Starts a session on a validated module. Validation runs ONCE here (a
 * malformed module throws loudly at the door — the portal's `isLearnEligible`
 * gate should make this unreachable); transitions assume it and never
 * re-validate. Round 1 is assembled immediately: the first balanced chunk of
 * `def.items` in order, every item at `INITIAL_LEARN_TIER`.
 */
export function createLearnSession(
  def: LearnModuleDef<unknown, unknown>,
  config: LearnSessionConfig
): LearnSessionState {
  const problems = validateLearnModuleDef(def);
  if (problems.length > 0) {
    throw new Error(
      `createLearnSession: module "${def.id}" is not Learn-eligible: ${problems.join('; ')}`
    );
  }
  const itemStates = createInitialItemStates(def);
  return {
    moduleId: def.id,
    itemStates,
    // Round 1 is all first-contact items, so assembly is deterministic
    // (canonical order) — no rng seam needed here.
    round: {
      roundNumber: 1,
      queue: assembleRoundQueue(itemStates, config, Math.random),
    },
    roundTrace: emptyTrace(),
    roundSummaries: [],
  };
}

/** The item to present now: the queue's head, or null between/after rounds. */
export function currentLearnItemId(session: LearnSessionState): string | null {
  return session.round.queue.length > 0 ? session.round.queue[0] : null;
}

export function getLearnItemState(
  session: LearnSessionState,
  itemId: string
): LearnItemState | undefined {
  return session.itemStates.find(s => s.itemId === itemId);
}

/** See `LearnSessionPhase`. Derived from the aggregate, never stored. */
export function learnSessionPhase(
  session: LearnSessionState,
  config: LearnSessionConfig
): LearnSessionPhase {
  if (session.round.queue.length > 0) return 'in-round';
  return isModuleComplete(session.itemStates, config)
    ? 'module-complete'
    : 'round-complete';
}

/** Re-inserts a just-presented item `requeueGap` presentations later. */
function requeue(
  rest: string[],
  itemId: string,
  config: LearnSessionConfig
): string[] {
  const at = Math.min(config.requeueGap, rest.length);
  return [...rest.slice(0, at), itemId, ...rest.slice(at)];
}

function replaceItemState(
  itemStates: LearnItemState[],
  next: LearnItemState
): LearnItemState[] {
  return itemStates.map(s => (s.itemId === next.itemId ? next : s));
}

/**
 * Grades the current item at its quizzed tier. `correct` is the caller's
 * verdict (the machine never sees the student's answer); "Don't know?" is
 * `correct: false` by the 2A.1 rail. A correct answer escalates and retires
 * the item for the round; a miss drops a tier and re-queues it
 * `requeueGap` presentations later (the immediate answer reveal on a miss is
 * 2A.4's presentation beat — at recognize the dropped item additionally
 * resurfaces as a See card when its re-queue comes up). When the answer
 * empties the queue the round is finalized: its summary is appended (and
 * emitted), and module completion is detected.
 *
 * No-op (same session reference) when there is no current item or the
 * current item sits at `see` — See cards are tap-through (`applyLearnSeen`),
 * never graded.
 */
export function applyLearnAnswer(
  session: LearnSessionState,
  config: LearnSessionConfig,
  correct: boolean
): LearnActionResult {
  const itemId = currentLearnItemId(session);
  if (itemId === null) return { session, events: [] };
  const state = getLearnItemState(session, itemId);
  if (state === undefined || state.tier === 'see') {
    return { session, events: [] };
  }

  const next = correct ? applyCorrectAnswer(state) : applyMiss(state);
  const becameSolid =
    !isItemSolid(state, config) && isItemSolid(next, config);

  const events: LearnSessionEvent[] = [];
  if (next.tier !== state.tier) {
    events.push({
      type: 'tier-changed',
      itemId,
      from: state.tier,
      to: next.tier,
      cause: correct ? 'correct' : 'miss',
    });
  }
  if (becameSolid) {
    events.push({ type: 'item-solid', itemId });
  }

  const itemStates = replaceItemState(session.itemStates, next);
  const rest = session.round.queue.slice(1);
  const queue = correct ? rest : requeue(rest, itemId, config);

  const trace: LearnRoundTrace = {
    presentedItemIds: appendUnique(session.roundTrace.presentedItemIds, itemId),
    missedItemIds: correct
      ? session.roundTrace.missedItemIds
      : appendUnique(session.roundTrace.missedItemIds, itemId),
    newlySolidItemIds: becameSolid
      ? appendUnique(session.roundTrace.newlySolidItemIds, itemId)
      : session.roundTrace.newlySolidItemIds,
  };

  if (queue.length > 0) {
    return {
      session: {
        ...session,
        itemStates,
        round: { ...session.round, queue },
        roundTrace: trace,
      },
      events,
    };
  }

  // The queue emptied: finalize the round (a round can only end on a correct
  // answer — misses and See cards re-queue).
  const summary: LearnRoundSummary = {
    roundNumber: session.round.roundNumber,
    presentedItemIds: trace.presentedItemIds,
    missedItemIds: trace.missedItemIds,
    newlySolidItemIds: trace.newlySolidItemIds,
  };
  events.push({ type: 'round-complete', summary });
  if (isModuleComplete(itemStates, config)) {
    events.push({ type: 'module-complete' });
  }
  return {
    session: {
      ...session,
      itemStates,
      round: { ...session.round, queue },
      roundTrace: emptyTrace(),
      roundSummaries: [...session.roundSummaries, summary],
    },
    events,
  };
}

/**
 * The student tapped through the current item's See card (the post-miss
 * re-teach beat — in v1 `see` is reachable only by a recognize-miss).
 * Exposure isn't retrieval: no attempt is counted (2A.1 `applySeen`). The
 * item escalates back to `recognize` and re-queues `requeueGap`
 * presentations later for the check, so a See tap can never end a round.
 *
 * No-op (same session reference) when there is no current item or the
 * current item isn't at `see`.
 */
export function applyLearnSeen(
  session: LearnSessionState,
  config: LearnSessionConfig
): LearnActionResult {
  const itemId = currentLearnItemId(session);
  if (itemId === null) return { session, events: [] };
  const state = getLearnItemState(session, itemId);
  if (state === undefined || state.tier !== 'see') {
    return { session, events: [] };
  }

  const next = applySeen(state);
  return {
    session: {
      ...session,
      itemStates: replaceItemState(session.itemStates, next),
      round: {
        ...session.round,
        queue: requeue(session.round.queue.slice(1), itemId, config),
      },
      roundTrace: {
        ...session.roundTrace,
        presentedItemIds: appendUnique(
          session.roundTrace.presentedItemIds,
          itemId
        ),
      },
    },
    events: [
      {
        type: 'tier-changed',
        itemId,
        from: state.tier,
        to: next.tier,
        cause: 'seen',
      },
    ],
  };
}

/**
 * Advances past the between-rounds summary: assembles the next balanced
 * chunk of not-yet-solid items under a new round number — canonical order
 * if the chunk is all first-contact items, shuffled otherwise (see the
 * file header). `rng` is injectable for deterministic tests, matching
 * `assembleRecognizeOptions`. Emits no events — the round-complete event
 * fired when the queue emptied; if the portal wants a round-started emit it
 * owns that call site.
 *
 * No-op (same session reference) unless the phase is `round-complete`.
 */
export function startNextLearnRound(
  session: LearnSessionState,
  config: LearnSessionConfig,
  rng: () => number = Math.random
): LearnActionResult {
  if (learnSessionPhase(session, config) !== 'round-complete') {
    return { session, events: [] };
  }
  return {
    session: {
      ...session,
      round: {
        roundNumber: session.round.roundNumber + 1,
        queue: assembleRoundQueue(session.itemStates, config, rng),
      },
      roundTrace: emptyTrace(),
    },
    events: [],
  };
}
