/**
 * Unit tests for `core/learn/machine` (Phase 2A.3 — the Learn session state
 * machine). These pin the 2A.1 HANDOFF §4 design-lock rails at session level
 * (cumulative recalls, See as the post-miss re-teach beat, items order as
 * canonical presentation order, "Don't know?" = miss, reference-equality
 * no-ops) plus this slice's policy calls: balanced not-yet-solid round
 * composition under `maxRoundSize` (canonical order on first contact,
 * within-chunk shuffle on review rounds — 2A.3 reviewer revision), and
 * same-round re-queue at `requeueGap` for misses and See taps. The
 * serialization round-trip pins the 2B.1 Firestore wire-shape contract.
 */

import { describe, it, expect } from 'vitest';
import {
  createLearnSession,
  currentLearnItemId,
  getLearnItemState,
  learnSessionPhase,
  applyLearnAnswer,
  applyLearnSeen,
  startNextLearnRound,
  MATHMOG_LEARN_MODULES,
  MATHMOG_LEARN_CONFIG,
  solidProgress,
  type LearnSessionConfig,
  type LearnSessionEvent,
  type LearnSessionState,
  type LearnModuleDef,
  type LearnTier,
} from '../../src/core/learn';

const cfg: LearnSessionConfig = {
  recallsToSolid: 2,
  maxRoundSize: 12,
  requeueGap: 3,
};

function makeModule(n: number): LearnModuleDef<string, string> {
  const items = Array.from({ length: n }, (_, i) => ({
    id: `i${i + 1}`,
    prompt: `p${i + 1}`,
    answer: `a${i + 1}`,
  }));
  return {
    id: `test/mod_${n}`,
    label: `Test module (${n} items)`,
    items,
    distractorSets: items.map(item => ({
      itemId: item.id,
      distractors: [`${item.id}-d1`, `${item.id}-d2`, `${item.id}-d3`],
    })),
  };
}

type Decide = (itemId: string, tier: LearnTier) => boolean;

const alwaysCorrect: Decide = () => true;

/** One presentation: taps through See cards, answers quizzed tiers. */
function step(
  session: LearnSessionState,
  decide: Decide,
  config = cfg
): { session: LearnSessionState; events: LearnSessionEvent[] } {
  const itemId = currentLearnItemId(session);
  if (itemId === null) throw new Error('step called with no current item');
  const tier = getLearnItemState(session, itemId)!.tier;
  return tier === 'see'
    ? applyLearnSeen(session, config)
    : applyLearnAnswer(session, config, decide(itemId, tier));
}

/** Plays presentations until the round (or module) completes. */
function playRound(
  session: LearnSessionState,
  decide: Decide,
  config = cfg
): { session: LearnSessionState; events: LearnSessionEvent[] } {
  const events: LearnSessionEvent[] = [];
  let s = session;
  let guard = 0;
  while (learnSessionPhase(s, config) === 'in-round') {
    if (++guard > 1000) throw new Error('playRound did not terminate');
    const r = step(s, decide, config);
    s = r.session;
    events.push(...r.events);
  }
  return { session: s, events };
}

/** Plays rounds (advancing through summaries) until the module completes. */
function playToCompletion(
  session: LearnSessionState,
  decide: Decide,
  config = cfg
): { session: LearnSessionState; events: LearnSessionEvent[] } {
  const events: LearnSessionEvent[] = [];
  let s = session;
  let guard = 0;
  while (learnSessionPhase(s, config) !== 'module-complete') {
    if (++guard > 1000) throw new Error('playToCompletion did not terminate');
    if (learnSessionPhase(s, config) === 'round-complete') {
      s = startNextLearnRound(s, config).session;
      continue;
    }
    const r = playRound(s, decide, config);
    s = r.session;
    events.push(...r.events);
  }
  return { session: s, events };
}

describe('createLearnSession', () => {
  it('throws loudly on a module that is not Learn-eligible', () => {
    const bad = makeModule(2);
    bad.distractorSets = [];
    expect(() => createLearnSession(bad, cfg)).toThrow(/not Learn-eligible/);
  });

  it('starts round 1 with the items in LearnModuleDef.items order (canonical presentation order)', () => {
    const s = createLearnSession(makeModule(5), cfg);
    expect(s.round.roundNumber).toBe(1);
    expect(s.round.queue).toEqual(['i1', 'i2', 'i3', 'i4', 'i5']);
  });

  it('creates every item at the initial tier with zero counters, in items order', () => {
    const s = createLearnSession(makeModule(3), cfg);
    expect(s.itemStates.map(st => st.itemId)).toEqual(['i1', 'i2', 'i3']);
    for (const st of s.itemStates) {
      expect(st.tier).toBe('recognize');
      expect(st.correctRecalls).toBe(0);
      expect(st.attempts).toBe(0);
      expect(st.misses).toBe(0);
    }
  });

  it('starts with an empty trace, no summaries, and phase in-round', () => {
    const s = createLearnSession(makeModule(3), cfg);
    expect(s.roundTrace).toEqual({
      presentedItemIds: [],
      missedItemIds: [],
      newlySolidItemIds: [],
    });
    expect(s.roundSummaries).toEqual([]);
    expect(learnSessionPhase(s, cfg)).toBe('in-round');
  });

  it('records the module id (the 2B.1 resume key)', () => {
    const s = createLearnSession(makeModule(2), cfg);
    expect(s.moduleId).toBe('test/mod_2');
  });
});

describe('round composition: balanced chunks of not-yet-solid items', () => {
  it('round 1 = all items when the module fits maxRoundSize', () => {
    expect(createLearnSession(makeModule(12), cfg).round.queue).toHaveLength(12);
    expect(createLearnSession(makeModule(2), cfg).round.queue).toHaveLength(2);
  });

  it('balances instead of leaving an orphan tail (13 items → 7, never 12 + 1)', () => {
    const s = createLearnSession(makeModule(13), cfg);
    expect(s.round.queue).toEqual(['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7']);
  });

  it('splits 27 items into rounds of 9 and 66 items into rounds of 11', () => {
    expect(createLearnSession(makeModule(27), cfg).round.queue).toHaveLength(9);
    expect(createLearnSession(makeModule(66), cfg).round.queue).toHaveLength(11);
  });

  it('keeps the same chunk in rotation until it solidifies (chunk mastery, membership pin)', () => {
    const s = createLearnSession(makeModule(13), cfg);
    const r1 = playRound(s, alwaysCorrect);
    const r2 = startNextLearnRound(r1.session, cfg).session;
    // Nothing is solid after one correct pass (items are only at recall),
    // so round 2 re-presents the same first chunk — shuffled, since it has
    // been attempted (review rounds must not be sequence-rideable).
    expect(r2.round.roundNumber).toBe(2);
    expect([...r2.round.queue].sort()).toEqual(
      ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7'].sort()
    );
  });

  it('shuffles review rounds deterministically under an injected rng (order pin)', () => {
    const s = createLearnSession(makeModule(13), cfg);
    const r1 = playRound(s, alwaysCorrect);
    const r2 = startNextLearnRound(r1.session, cfg, () => 0).session;
    // Fisher–Yates with rng() = 0 rotates the chunk left by one.
    expect(r2.round.queue).toEqual(['i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i1']);
  });

  it('shuffles a mixed chunk (straggler + fresh items), keeping the straggler in rotation', () => {
    const s = createLearnSession(makeModule(13), cfg);
    // i1 misses every recall, so it never solidifies while i2–i7 do.
    const decide: Decide = (id, tier) => !(id === 'i1' && tier === 'recall');
    let cur = s;
    for (let round = 0; round < 3; round++) {
      cur = playRound(cur, decide).session;
      cur = startNextLearnRound(cur, cfg).session;
    }
    expect(solidProgress(cur.itemStates, cfg)).toEqual({ solid: 6, total: 13 });
    expect([...cur.round.queue].sort()).toEqual(
      ['i1', 'i8', 'i9', 'i10', 'i11', 'i12', 'i13'].sort()
    );
  });

  it('flows later items in once earlier ones go solid', () => {
    // Solidify the first chunk of 7 (three perfect passes), then the next
    // round should hold the remaining 6 items.
    const s = createLearnSession(makeModule(13), cfg);
    let cur = s;
    for (let round = 0; round < 3; round++) {
      cur = playRound(cur, alwaysCorrect).session;
      cur = startNextLearnRound(cur, cfg).session;
    }
    expect(solidProgress(cur.itemStates, cfg)).toEqual({ solid: 7, total: 13 });
    expect(cur.round.queue).toEqual(['i8', 'i9', 'i10', 'i11', 'i12', 'i13']);
  });

  it('never queues an already-solid item (no warmth tail)', () => {
    const s = createLearnSession(makeModule(4), cfg);
    let cur = s;
    const queuedEver: string[][] = [cur.round.queue];
    let guard = 0;
    while (learnSessionPhase(cur, cfg) !== 'module-complete') {
      if (++guard > 1000) throw new Error('did not terminate');
      if (learnSessionPhase(cur, cfg) === 'round-complete') {
        cur = startNextLearnRound(cur, cfg).session;
        queuedEver.push(cur.round.queue);
        continue;
      }
      const solidNow = new Set(
        cur.itemStates
          .filter(st => st.correctRecalls >= cfg.recallsToSolid)
          .map(st => st.itemId)
      );
      for (const id of cur.round.queue) expect(solidNow.has(id)).toBe(false);
      cur = step(cur, alwaysCorrect).session;
    }
  });
});

describe('applyLearnAnswer — correct', () => {
  it('escalates recognize → recall with a tier-changed event and retires the item for the round', () => {
    const s = createLearnSession(makeModule(3), cfg);
    const { session: next, events } = applyLearnAnswer(s, cfg, true);
    expect(getLearnItemState(next, 'i1')!.tier).toBe('recall');
    expect(next.round.queue).toEqual(['i2', 'i3']);
    expect(events).toEqual([
      { type: 'tier-changed', itemId: 'i1', from: 'recognize', to: 'recall', cause: 'correct' },
    ]);
  });

  it('emits NO event on a non-crossing recall correct (the ladder clamps; no tier moved)', () => {
    const s = createLearnSession(makeModule(2), cfg);
    let cur = playRound(s, alwaysCorrect).session; // both items now at recall
    cur = startNextLearnRound(cur, cfg).session;
    const answered = currentLearnItemId(cur)!;
    const { events, session: next } = applyLearnAnswer(cur, cfg, true);
    expect(getLearnItemState(next, answered)!.correctRecalls).toBe(1);
    expect(events).toEqual([]);
  });

  it('emits item-solid exactly on the recall correct that crosses recallsToSolid', () => {
    const one = makeModule(1);
    const s = createLearnSession(one, cfg);
    let cur = playRound(s, alwaysCorrect).session; // recognize → recall
    cur = startNextLearnRound(cur, cfg).session;
    cur = playRound(cur, alwaysCorrect).session; // recall correct #1
    cur = startNextLearnRound(cur, cfg).session;
    const { events } = applyLearnAnswer(cur, cfg, true); // recall correct #2 → solid
    expect(events).toContainEqual({ type: 'item-solid', itemId: 'i1' });
  });

  it('tracks presented ids uniquely in the round trace', () => {
    const s = createLearnSession(makeModule(3), cfg);
    const { session: next } = applyLearnAnswer(s, cfg, true);
    expect(next.roundTrace.presentedItemIds).toEqual(['i1']);
    expect(next.roundTrace.missedItemIds).toEqual([]);
  });
});

describe('applyLearnAnswer — miss (and "Don\'t know?" = the same miss)', () => {
  it('drops recognize → see and re-queues after requeueGap presentations (position pin)', () => {
    const s = createLearnSession(makeModule(5), cfg);
    const { session: next, events } = applyLearnAnswer(s, cfg, false);
    expect(getLearnItemState(next, 'i1')!.tier).toBe('see');
    expect(next.round.queue).toEqual(['i2', 'i3', 'i4', 'i1', 'i5']);
    expect(events).toEqual([
      { type: 'tier-changed', itemId: 'i1', from: 'recognize', to: 'see', cause: 'miss' },
    ]);
    expect(next.roundTrace.missedItemIds).toEqual(['i1']);
  });

  it('drops recall → recognize (NOT see) on a recall miss', () => {
    const s = createLearnSession(makeModule(2), cfg);
    let cur = playRound(s, alwaysCorrect).session;
    cur = startNextLearnRound(cur, cfg).session; // both at recall
    const missed = currentLearnItemId(cur)!;
    const { session: next, events } = applyLearnAnswer(cur, cfg, false);
    expect(getLearnItemState(next, missed)!.tier).toBe('recognize');
    expect(events[0]).toEqual({
      type: 'tier-changed', itemId: missed, from: 'recall', to: 'recognize', cause: 'miss',
    });
  });

  it('preserves earned correctRecalls across a miss (cumulative counting, session level)', () => {
    const s = createLearnSession(makeModule(1), cfg);
    let cur = playRound(s, alwaysCorrect).session; // recognize correct
    cur = startNextLearnRound(cur, cfg).session;
    cur = playRound(cur, alwaysCorrect).session; // recall correct → correctRecalls 1
    cur = startNextLearnRound(cur, cfg).session;
    const missed = applyLearnAnswer(cur, cfg, false).session; // recall miss
    expect(getLearnItemState(missed, 'i1')!.correctRecalls).toBe(1);
    expect(getLearnItemState(missed, 'i1')!.tier).toBe('recognize');
  });

  it('clamps the re-queue gap to the queue end (short loops at small N are accepted)', () => {
    const s = createLearnSession(makeModule(2), cfg);
    const { session: next } = applyLearnAnswer(s, cfg, false);
    expect(next.round.queue).toEqual(['i2', 'i1']);
  });

  it('re-presents immediately when the missed item was the only one left (a miss never ends a round)', () => {
    const s = createLearnSession(makeModule(1), cfg);
    const { session: next } = applyLearnAnswer(s, cfg, false);
    expect(next.round.queue).toEqual(['i1']);
    expect(learnSessionPhase(next, cfg)).toBe('in-round');
  });

  it('counts attempts and misses as trace data', () => {
    const s = createLearnSession(makeModule(1), cfg);
    let cur = applyLearnAnswer(s, cfg, false).session; // recognize miss → see
    cur = applyLearnSeen(cur, cfg).session; // see tap (no attempt)
    cur = applyLearnAnswer(cur, cfg, true).session; // recognize correct
    const st = getLearnItemState(cur, 'i1')!;
    expect(st.attempts).toBe(2);
    expect(st.misses).toBe(1);
  });
});

describe('applyLearnSeen — the post-miss re-teach beat', () => {
  function dropToSee(n: number) {
    const s = createLearnSession(makeModule(n), cfg);
    return applyLearnAnswer(s, cfg, false).session;
  }

  it('escalates see → recognize without counting an attempt, and re-queues at the gap', () => {
    let s = dropToSee(6); // queue: i2 i3 i4 i1 i5 i6, i1 at see
    s = applyLearnAnswer(s, cfg, true).session; // i2
    s = applyLearnAnswer(s, cfg, true).session; // i3
    s = applyLearnAnswer(s, cfg, true).session; // i4
    expect(currentLearnItemId(s)).toBe('i1');
    expect(getLearnItemState(s, 'i1')!.tier).toBe('see');
    const { session: next, events } = applyLearnSeen(s, cfg);
    expect(getLearnItemState(next, 'i1')!.tier).toBe('recognize');
    expect(getLearnItemState(next, 'i1')!.attempts).toBe(1); // only the original miss
    expect(next.round.queue).toEqual(['i5', 'i6', 'i1']);
    expect(events).toEqual([
      { type: 'tier-changed', itemId: 'i1', from: 'see', to: 'recognize', cause: 'seen' },
    ]);
  });

  it('can never end a round (the seen item always re-enters the queue)', () => {
    let s = dropToSee(1); // queue [i1], i1 at see... after miss+requeue
    s = applyLearnSeen(s, cfg).session;
    expect(s.round.queue).toEqual(['i1']);
    expect(learnSessionPhase(s, cfg)).toBe('in-round');
  });
});

describe('reference-equality no-ops', () => {
  it('answering at a See card is a no-op (See is tap-through, never graded)', () => {
    const s = createLearnSession(makeModule(1), cfg);
    const atSee = applyLearnAnswer(s, cfg, false).session;
    const r = applyLearnAnswer(atSee, cfg, true);
    expect(r.session).toBe(atSee);
    expect(r.events).toEqual([]);
  });

  it('tapping "seen" at a quizzed tier is a no-op', () => {
    const s = createLearnSession(makeModule(2), cfg);
    const r = applyLearnSeen(s, cfg);
    expect(r.session).toBe(s);
    expect(r.events).toEqual([]);
  });

  it('answering between rounds (empty queue) is a no-op', () => {
    const s = createLearnSession(makeModule(2), cfg);
    const done = playRound(s, alwaysCorrect).session;
    const r = applyLearnAnswer(done, cfg, true);
    expect(r.session).toBe(done);
  });

  it('startNextLearnRound mid-round is a no-op', () => {
    const s = createLearnSession(makeModule(2), cfg);
    expect(startNextLearnRound(s, cfg).session).toBe(s);
  });

  it('startNextLearnRound after module completion is a no-op (terminal phase)', () => {
    const s = createLearnSession(makeModule(1), cfg);
    const { session: done } = playToCompletion(s, alwaysCorrect);
    expect(learnSessionPhase(done, cfg)).toBe('module-complete');
    expect(startNextLearnRound(done, cfg).session).toBe(done);
  });
});

describe('round lifecycle and summaries', () => {
  it('finalizes the round when the queue empties: summary appended + round-complete event', () => {
    const s = createLearnSession(makeModule(2), cfg);
    let cur = applyLearnAnswer(s, cfg, true).session;
    const { session: done, events } = applyLearnAnswer(cur, cfg, true);
    expect(learnSessionPhase(done, cfg)).toBe('round-complete');
    const summary = {
      roundNumber: 1,
      presentedItemIds: ['i1', 'i2'],
      missedItemIds: [],
      newlySolidItemIds: [],
    };
    expect(done.roundSummaries).toEqual([summary]);
    expect(events).toContainEqual({ type: 'round-complete', summary });
    expect(done.roundTrace).toEqual({
      presentedItemIds: [],
      missedItemIds: [],
      newlySolidItemIds: [],
    });
  });

  it('summaries carry missed ids uniquely even after in-round recovery', () => {
    const s = createLearnSession(makeModule(2), cfg);
    // miss i1 twice (recognize → see → recognize-miss again), then recover
    let missesLeft = 2;
    const withMisses: Decide = (id, tier) => {
      if (id === 'i1' && tier === 'recognize' && missesLeft > 0) {
        missesLeft--;
        return false;
      }
      return true;
    };
    const { session: done } = playRound(s, withMisses);
    expect(done.roundSummaries[0].missedItemIds).toEqual(['i1']);
    expect(done.roundSummaries[0].presentedItemIds).toEqual(['i1', 'i2']);
  });

  it('startNextLearnRound increments the round number and resets the trace', () => {
    const s = createLearnSession(makeModule(2), cfg);
    const r1 = playRound(s, alwaysCorrect).session;
    const r2 = startNextLearnRound(r1, cfg);
    expect(r2.session.round.roundNumber).toBe(2);
    expect([...r2.session.round.queue].sort()).toEqual(['i1', 'i2']);
    expect(r2.session.roundTrace.presentedItemIds).toEqual([]);
    expect(r2.events).toEqual([]);
  });

  it('records newly-solid items in the round summary', () => {
    const s = createLearnSession(makeModule(1), cfg);
    const { session: done } = playToCompletion(s, alwaysCorrect);
    expect(done.roundSummaries).toHaveLength(3);
    expect(done.roundSummaries[2].newlySolidItemIds).toEqual(['i1']);
    expect(done.roundSummaries[0].newlySolidItemIds).toEqual([]);
  });
});

describe('full-session walkthroughs', () => {
  it('perfect run: recognize pass + recallsToSolid recall passes, completion on the last recall', () => {
    const s = createLearnSession(makeModule(5), cfg);
    const { session: done, events } = playToCompletion(s, alwaysCorrect);
    expect(learnSessionPhase(done, cfg)).toBe('module-complete');
    expect(done.roundSummaries).toHaveLength(3); // recognize, recall ×2
    expect(solidProgress(done.itemStates, cfg)).toEqual({ solid: 5, total: 5 });
    // module-complete fires exactly once, as the final event
    const completes = events.filter(e => e.type === 'module-complete');
    expect(completes).toHaveLength(1);
    expect(events[events.length - 1]).toEqual({ type: 'module-complete' });
    // every item crossed solid exactly once
    for (const id of ['i1', 'i2', 'i3', 'i4', 'i5']) {
      expect(events.filter(e => e.type === 'item-solid' && e.itemId === id)).toHaveLength(1);
    }
  });

  it('miss-heavy run: every quizzed tier missed once per item still terminates, all solid', () => {
    const missedOnce = new Set<string>();
    const decide: Decide = (id, tier) => {
      const key = `${id}@${tier}`;
      if (!missedOnce.has(key)) {
        missedOnce.add(key);
        return false;
      }
      return true;
    };
    const s = createLearnSession(makeModule(4), cfg);
    const { session: done } = playToCompletion(s, decide);
    expect(learnSessionPhase(done, cfg)).toBe('module-complete');
    expect(solidProgress(done.itemStates, cfg)).toEqual({ solid: 4, total: 4 });
    for (const st of done.itemStates) {
      expect(st.misses).toBeGreaterThan(0);
      expect(st.correctRecalls).toBe(cfg.recallsToSolid);
    }
  });

  it('"Don\'t know?" on every first recognize look (decline = miss → See re-teach → recover)', () => {
    const seen = new Set<string>();
    const decide: Decide = (id, tier) => {
      if (tier === 'recognize' && !seen.has(id)) {
        seen.add(id); // student declines anything not yet re-taught
        return false;
      }
      return true;
    };
    const s = createLearnSession(makeModule(3), cfg);
    const { session: done, events } = playToCompletion(s, decide);
    expect(learnSessionPhase(done, cfg)).toBe('module-complete');
    // every item passed through its See card
    const seeDrops = events.filter(
      e => e.type === 'tier-changed' && e.to === 'see'
    );
    expect(seeDrops).toHaveLength(3);
    expect(done.roundSummaries[0].missedItemIds).toEqual(['i1', 'i2', 'i3']);
  });

  it('completion coincides with the round boundary (the final correct recall empties the queue)', () => {
    const s = createLearnSession(makeModule(2), cfg);
    let cur = s;
    let lastEvents: LearnSessionEvent[] = [];
    let guard = 0;
    while (learnSessionPhase(cur, cfg) !== 'module-complete') {
      if (++guard > 1000) throw new Error('did not terminate');
      if (learnSessionPhase(cur, cfg) === 'round-complete') {
        cur = startNextLearnRound(cur, cfg).session;
        continue;
      }
      const r = step(cur, alwaysCorrect);
      cur = r.session;
      lastEvents = r.events;
    }
    expect(cur.round.queue).toEqual([]);
    expect(lastEvents.map(e => e.type)).toEqual([
      'item-solid',
      'round-complete',
      'module-complete',
    ]);
  });

  it('an item answered correctly mid-round returns at its NEW tier next round (escalation shows next appearance)', () => {
    const s = createLearnSession(makeModule(2), cfg);
    const r1 = playRound(s, alwaysCorrect).session;
    const r2 = startNextLearnRound(r1, cfg).session;
    expect(getLearnItemState(r2, 'i1')!.tier).toBe('recall');
    expect(getLearnItemState(r2, 'i2')!.tier).toBe('recall');
    expect(r2.round.queue).toContain('i1');
  });

  it('recall-miss recovery path: recognize correct retires the item; recall comes next round', () => {
    const s = createLearnSession(makeModule(1), cfg);
    let cur = playRound(s, alwaysCorrect).session; // recognize → recall
    cur = startNextLearnRound(cur, cfg).session;
    cur = applyLearnAnswer(cur, cfg, false).session; // recall miss → recognize, re-queued
    expect(currentLearnItemId(cur)).toBe('i1');
    const { session: afterRecover } = applyLearnAnswer(cur, cfg, true); // recognize correct
    // retired for the round → round 2 ends; next round presents it at recall
    expect(learnSessionPhase(afterRecover, cfg)).toBe('round-complete');
    const r3 = startNextLearnRound(afterRecover, cfg).session;
    expect(getLearnItemState(r3, 'i1')!.tier).toBe('recall');
  });
});

describe('the session aggregate is the 2B.1 wire shape', () => {
  it('JSON round-trips deep-equal at creation, mid-round, and at completion', () => {
    const roundTrip = (s: LearnSessionState) =>
      expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    const fresh = createLearnSession(makeModule(5), cfg);
    roundTrip(fresh);
    const mid = applyLearnAnswer(
      applyLearnAnswer(fresh, cfg, true).session,
      cfg,
      false
    ).session;
    roundTrip(mid);
    roundTrip(playToCompletion(fresh, alwaysCorrect).session);
  });

  it('actions never mutate the prior session (resume safety)', () => {
    const s = createLearnSession(makeModule(3), cfg);
    const frozen = JSON.parse(JSON.stringify(s));
    applyLearnAnswer(s, cfg, false);
    applyLearnAnswer(s, cfg, true);
    expect(s).toEqual(frozen);
  });

  it('untouched item states keep reference identity across an action (cheap change detection)', () => {
    const s = createLearnSession(makeModule(3), cfg);
    const { session: next } = applyLearnAnswer(s, cfg, true);
    expect(next.itemStates[1]).toBe(s.itemStates[1]);
    expect(next.itemStates[2]).toBe(s.itemStates[2]);
    expect(next.itemStates[0]).not.toBe(s.itemStates[0]);
  });
});

describe('Math Mog binding integration', () => {
  it('MATHMOG_LEARN_CONFIG carries the 2A.3 policy knobs', () => {
    expect(MATHMOG_LEARN_CONFIG.maxRoundSize).toBe(12);
    expect(MATHMOG_LEARN_CONFIG.requeueGap).toBe(3);
  });

  it('a singleton times-table row runs as one whole round of 11 in row order', () => {
    const just7 = MATHMOG_LEARN_MODULES.find(
      m => m.id === 'times_tables/tt_just_7'
    )!;
    const s = createLearnSession(just7, MATHMOG_LEARN_CONFIG);
    expect(s.round.queue).toEqual(just7.items.map(i => i.id));
    expect(s.round.queue).toHaveLength(11);
    expect(s.round.queue[0]).toBe('7x2');
  });

  it('tt_full (66 facts) paces as balanced rounds of 11', () => {
    const full = MATHMOG_LEARN_MODULES.find(
      m => m.id === 'times_tables/tt_full'
    )!;
    const s = createLearnSession(full, MATHMOG_LEARN_CONFIG);
    expect(full.items).toHaveLength(66);
    expect(s.round.queue).toEqual(full.items.slice(0, 11).map(i => i.id));
  });

  it('tt_2_5 (38 facts, the mid-size combined scope) balance-chunks into rounds of 10 and completes', () => {
    const mod = MATHMOG_LEARN_MODULES.find(
      m => m.id === 'times_tables/tt_2_5'
    )!;
    expect(mod.items).toHaveLength(38);
    const s = createLearnSession(mod, MATHMOG_LEARN_CONFIG);
    expect(s.round.queue).toHaveLength(10); // ceil(38 / ceil(38/12))
    const { session: done } = playToCompletion(
      s,
      alwaysCorrect,
      MATHMOG_LEARN_CONFIG
    );
    expect(learnSessionPhase(done, MATHMOG_LEARN_CONFIG)).toBe('module-complete');
    expect(solidProgress(done.itemStates, MATHMOG_LEARN_CONFIG)).toEqual({
      solid: 38,
      total: 38,
    });
  });

  it('a 2-item fractions module (thirds) runs a full session sensibly', () => {
    const thirds = MATHMOG_LEARN_MODULES.find(
      m => m.id === 'fraction_conversions/fc_thirds'
    );
    // fall back: locate any 2-item fractions module if the scope id differs
    const mod =
      thirds ??
      MATHMOG_LEARN_MODULES.find(
        m => m.id.startsWith('fraction_conversions/') && m.items.length === 2
      )!;
    const s = createLearnSession(mod, MATHMOG_LEARN_CONFIG);
    const { session: done } = playToCompletion(s, alwaysCorrect, MATHMOG_LEARN_CONFIG);
    expect(learnSessionPhase(done, MATHMOG_LEARN_CONFIG)).toBe('module-complete');
    expect(done.roundSummaries).toHaveLength(3);
  });
});
