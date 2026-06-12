type Difficulty = 'Easy' | 'Medium' | 'Hard';
/**
 * 2D.3: the (topic, itemId) identity of the underlying Memorize fact,
 * stamped at generation by the branches that know their operands (times
 * tables, perfect squares, perfect cubes, fraction conversions). Consumed
 * by the feedback surfaces: the `diagnoseMiss` lookup at miss time (live
 * identity line + capture-time storage on `MissedMathmogProblem`), the
 * correct-but-enriched postscript, and the validator's
 * faithful-transcription check. Absent on estimation problems, Level-2/3
 * types, text-input conversion directions (decToFrac / percToFrac),
 * advanced topics without a diagnoser, and pre-existing records —
 * consumers silently skip diagnosis when missing.
 */
interface ProblemFact {
    /** The four topics with 2D.2 diagnosers (subset of `MemorizeLearnTopic`). */
    topic: 'times_tables' | 'perfect_squares' | 'perfect_cubes' | 'fraction_conversions';
    /** Learn item id, doubling as fact id: "6x8", "7^2", "7^3", "5/6". */
    itemId: string;
    /**
     * Present on fracToPerc problems: the typed answer lives in the percent
     * shift of the fact's value (83.33 for 5/6). Decimal-space consumers
     * (`diagnoseMiss`, the enrichment postscript) skip these; the validator's
     * faithful-transcription check runs in percent space instead.
     */
    percentShift?: true;
}
interface Problem {
    question: string | string[];
    answer: any;
    type: string;
    explanation: string;
    inputType: 'number' | 'text' | 'buttons' | 'multi-text';
    options?: string[];
    /** See `ProblemFact` — absent on problems with no diagnosable fact. */
    fact?: ProblemFact;
    /**
     * Maximum acceptable relative deviation for estimation problems (e.g. 0.20
     * = 20% off still counts as correct). Read by the estimation branch of the
     * answer validator in `react/contexts/problem.tsx`. Falls back to 0.10
     * (10%) when omitted. Has no effect on non-estimation problems.
     */
    tolerance?: number;
    placeholder?: string;
}
interface SpeedChallengeState {
    enabled: boolean;
    duration: number;
    timeLeft: number;
    isActive: boolean;
    /**
     * Tagged "challenge-ended" signal. Truthy iff the round timer ran out;
     * cleared back to null when the next round starts or the user resets.
     * Does NOT carry the score — read the live score from the problem
     * context (`useProblem().score`).
     */
    results: {
        ended: true;
    } | null;
}
interface PendingLevelUp {
    action: 'changeDifficulty' | 'trySpeedChallenge';
    from?: Difficulty;
    to?: Difficulty;
    emojis: string;
    title: string;
    allCapsTitle?: string;
    subtitle: string;
    options: {
        yes: string;
        no: string;
    };
}
interface AdaptiveData {
    consecutiveCorrect: number;
    currentAdaptiveLevel: Difficulty | null;
    pendingLevelUp: PendingLevelUp | null;
    streakPure: boolean;
}

type MissedMathmogProblemKind = 'root-estimation' | 'fraction' | 'estimation' | 'multi-text' | 'number' | 'default';
interface MissedMathmogProblem {
    prompt: string;
    correctAnswer: string;
    studentAnswer: string;
    deviationPercent?: number;
    validationKind?: MissedMathmogProblemKind;
    correctAnswerNumeric?: number;
    explanation?: string;
    diagnosisMessage?: string;
    diagnosisCode?: string;
}

/**
 * The graduated retrieval ladder, easy to hard (design doc §2.2). Order is
 * load-bearing: `escalateTier` / `dropTier` move along this array.
 * - `see`: exposure — the item shown with its answer. Not a quizzed tier.
 * - `recognize`: cued recall — pick the answer from options.
 * - `recall`: free recall — produce the answer from memory. Only correct
 *   answers at this tier count toward completion.
 */
declare const LEARN_TIER_LADDER: readonly ["see", "recognize", "recall"];
type LearnTier = (typeof LEARN_TIER_LADDER)[number];
/**
 * The tiers a student actually answers at. See is exposure (tap-to-continue),
 * never graded — functions that grade, assemble options, or pick an input
 * mode should take this type so calling them at `see` is a compile error,
 * not a runtime no-op convention. Narrow with `isQuizzedTier`.
 */
type QuizzedLearnTier = Exclude<LearnTier, 'see'>;
/**
 * Per-item lifecycle state (design doc §2.3): `new` (never attempted) →
 * `learning` (attempted, not yet solid) → `solid` (recalled correctly
 * `recallsToSolid` times). Never stored — always derived from the counters
 * on `LearnItemState` via `deriveItemStatus`, so it cannot drift from the
 * facts that define it.
 */
type LearnItemStatus = 'new' | 'learning' | 'solid';
/**
 * One learnable fact. For Math Mog the teach card is the fact itself
 * (design doc §6.2): the See tier renders `prompt` + `answer` and needs no
 * authored lesson content. Products whose teach cards carry real content
 * (Formula Mog §7, Word Mog §8) widen `TPrompt` to a richer shape.
 */
interface LearnItem<TPrompt = string, TAnswer = string> {
    /** Stable within the module; per-item session state keys off it. */
    id: string;
    prompt: TPrompt;
    answer: TAnswer;
}
/**
 * The plug point slice 2A.2 fills per topic: hand-curated wrong options for
 * one item's Recognize tier (Learn doc Q6 resolution — curated, not
 * generated, with at least one plausible near-miss per item; a
 * `math-ed-ux-reviewer` pass gates each topic). Must supply at least
 * `RECOGNIZE_OPTION_COUNT - 1` distractors so the Recognize tier can always
 * fill its options.
 */
interface LearnDistractorSet<TAnswer = string> {
    itemId: string;
    distractors: TAnswer[];
}
/**
 * A Learn module: a finite, enumerable item set with identity (design doc
 * §2.1). For Math Mog, a module IS a scope viewed as a Learn target
 * (curriculum doc §6.5) — see `mathmogLearnModuleId` for the id convention.
 * Infinite/procedural content (Estimate, Get Crafty) can never be a module;
 * eligibility is exactly "a valid module definition exists for this
 * selection" (`isLearnEligible`).
 */
interface LearnModuleDef<TPrompt = string, TAnswer = string> {
    id: string;
    label: string;
    items: LearnItem<TPrompt, TAnswer>[];
    distractorSets: LearnDistractorSet<TAnswer>[];
}
/**
 * Per-product tuning. `recallsToSolid` is the completion condition: an item
 * is solid once recalled correctly this many times at the `recall` tier
 * (Learn doc Q5 resolution — recalled-correctly-twice as a tunable constant
 * per product, never a hardcoded literal). Math Mog's value lives in
 * `MATHMOG_LEARN_CONFIG`.
 */
interface LearnConfig {
    recallsToSolid: number;
}
/**
 * Per-item session state: the facts the machine needs, nothing more.
 * `status` is deliberately not a field — derive it (`deriveItemStatus`).
 * `attempts`/`misses` exist for the round summary and the tutor-facing
 * session trace (design doc §4.2, e.g. "recall accuracy 90%"); they are
 * never surfaced to the student as a score.
 */
interface LearnItemState {
    itemId: string;
    /** Which rung of the ladder this item is quizzed at next. */
    tier: LearnTier;
    /** Correct answers at the `recall` tier; drives completion. */
    correctRecalls: number;
    /** Quizzed presentations (recognize + recall). See-card views don't count. */
    attempts: number;
    /** Wrong answers across quizzed tiers. */
    misses: number;
}
/**
 * Round structure (design doc §2 / §3.1: rounds are a pacing aid, not a
 * reward mechanic). The queue is item ids in presentation order; the 2A.3
 * machine owns assembly and the miss re-queue position ("comes back sooner,
 * same session" — §2.4).
 */
interface LearnRoundState {
    /** 1-based. */
    roundNumber: number;
    /** Item ids remaining in this round, in presentation order. */
    queue: string[];
}
/** Between-rounds summary (design doc §2: "after a round, a summary"). */
interface LearnRoundSummary {
    roundNumber: number;
    presentedItemIds: string[];
    missedItemIds: string[];
    /** Items that crossed to solid during this round. */
    newlySolidItemIds: string[];
}
/**
 * Recognize tier shows this many options — 1 correct +
 * (RECOGNIZE_OPTION_COUNT - 1) distractors (design doc §1.1: Quizlet's
 * observed four-option layout). Eligibility checks distractor coverage
 * against it.
 */
declare const RECOGNIZE_OPTION_COUNT = 4;
/**
 * Every item starts at Recognize — no calibration pre-pass in v1 (Learn doc
 * Q3 resolution). Consequence worth stating: in v1 the See tier is reached
 * only by dropping from Recognize on a miss, so See's role is the re-teach
 * beat (§2.4), not first contact.
 */
declare const INITIAL_LEARN_TIER: LearnTier;

/**
 * The machine's tuning: the 2A.1 completion knob plus this slice's two
 * policy knobs. Per-product values live in the product binding
 * (`MATHMOG_LEARN_CONFIG`), never inline at call sites.
 */
interface LearnSessionConfig extends LearnConfig {
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
interface LearnRoundTrace {
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
interface LearnSessionState {
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
type LearnSessionPhase = 'in-round' | 'round-complete' | 'module-complete';
/**
 * What an action did, for the 2B.6 telemetry layer and the 2A.4 UI.
 * `tier-changed` fires on every rung move with its cause; note a correct
 * answer at `recall` moves no rung (the ladder clamps), so the solid path
 * is observed via `item-solid`, which fires exactly once per item — on the
 * recall-tier correct that crosses `recallsToSolid`.
 */
type LearnSessionEvent = {
    type: 'tier-changed';
    itemId: string;
    from: LearnTier;
    to: LearnTier;
    cause: 'correct' | 'miss' | 'seen';
} | {
    type: 'item-solid';
    itemId: string;
} | {
    type: 'round-complete';
    summary: LearnRoundSummary;
} | {
    type: 'module-complete';
};
interface LearnActionResult {
    session: LearnSessionState;
    events: LearnSessionEvent[];
}
/**
 * Starts a session on a validated module. Validation runs ONCE here (a
 * malformed module throws loudly at the door — the portal's `isLearnEligible`
 * gate should make this unreachable); transitions assume it and never
 * re-validate. Round 1 is assembled immediately: the first balanced chunk of
 * `def.items` in order, every item at `INITIAL_LEARN_TIER`.
 */
declare function createLearnSession(def: LearnModuleDef<unknown, unknown>, config: LearnSessionConfig): LearnSessionState;
/** The item to present now: the queue's head, or null between/after rounds. */
declare function currentLearnItemId(session: LearnSessionState): string | null;
declare function getLearnItemState(session: LearnSessionState, itemId: string): LearnItemState | undefined;
/** See `LearnSessionPhase`. Derived from the aggregate, never stored. */
declare function learnSessionPhase(session: LearnSessionState, config: LearnSessionConfig): LearnSessionPhase;
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
declare function applyLearnAnswer(session: LearnSessionState, config: LearnSessionConfig, correct: boolean): LearnActionResult;
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
declare function applyLearnSeen(session: LearnSessionState, config: LearnSessionConfig): LearnActionResult;
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
declare function startNextLearnRound(session: LearnSessionState, config: LearnSessionConfig, rng?: () => number): LearnActionResult;

/**
 * The Memorize (level 1) topics — the only ones whose content is a finite
 * enumerable fact set, hence the only ones that can ever bind to a Learn
 * module (curriculum doc §6.1). Estimate / Get Crafty topics are excluded at
 * the type level so a Learn module id cannot be minted for procedural
 * content (assignment URLs in 2B.4 build on this function). A test pins this
 * list against `DRILL_TOPIC_REGISTRY` level-1 entries so it can't silently
 * drift from the registry.
 */
declare const MEMORIZE_LEARN_TOPICS: readonly ["times_tables", "perfect_squares", "perfect_cubes", "fraction_conversions", "advanced_squares", "advanced_cubes", "higher_powers", "common_multiples"];
type MemorizeLearnTopic = (typeof MEMORIZE_LEARN_TOPICS)[number];
/**
 * Math Mog tuning: recalled-correctly-twice (Learn doc Q5 resolution —
 * Quizlet's Write standard as the default), plus the 2A.3 session-policy
 * knobs, all held in a per-product constant rather than literals.
 * - `maxRoundSize: 12` keeps every singleton-row and small-range scope whole
 *   as a single round (singleton times-table rows are 11 items; most
 *   squares/cubes/fractions scopes are ≤10) and balance-chunks every
 *   combined scope into rounds of 9–11 (tt_full 66 → 6×11, tt_2_5/tt_6_9
 *   38 → 4×10, fractions full 27 → 3×9, squares full 20 → 2×10) — inside
 *   the 8–12 right-sized-drill band.
 * - `requeueGap: 3` brings a missed or just-seen item back after three other
 *   presentations — soon enough to close the loop in the same round, spaced
 *   enough that the retrieval isn't an echo of the answer reveal.
 */
declare const MATHMOG_LEARN_CONFIG: LearnSessionConfig;
/**
 * Module-id wire format: `<topic>/<scopeId>`, e.g.
 * `times_tables/tt_just_7`. The explicit topic segment keeps ids
 * self-describing for assignment URLs (slice 2B.4) and Firestore keys
 * (slice 2B.1) even though scope ids are currently prefix-unique on their
 * own.
 */
declare function mathmogLearnModuleId(topic: MemorizeLearnTopic, scopeId: string): string;
/** Inverse of `mathmogLearnModuleId`; null when the shape doesn't match. */
declare function parseMathmogLearnModuleId(moduleId: string): {
    topic: string;
    scopeId: string;
} | null;

export { type AdaptiveData as A, learnSessionPhase as B, mathmogLearnModuleId as C, type Difficulty as D, parseMathmogLearnModuleId as E, startNextLearnRound as F, INITIAL_LEARN_TIER as I, LEARN_TIER_LADDER as L, MATHMOG_LEARN_CONFIG as M, type PendingLevelUp as P, type QuizzedLearnTier as Q, RECOGNIZE_OPTION_COUNT as R, type SpeedChallengeState as S, type LearnActionResult as a, type LearnConfig as b, type LearnDistractorSet as c, type LearnItem as d, type LearnItemState as e, type LearnItemStatus as f, type LearnModuleDef as g, type LearnRoundState as h, type LearnRoundSummary as i, type LearnRoundTrace as j, type LearnSessionConfig as k, type LearnSessionEvent as l, type LearnSessionPhase as m, type LearnSessionState as n, type LearnTier as o, MEMORIZE_LEARN_TOPICS as p, type MemorizeLearnTopic as q, type MissedMathmogProblem as r, type MissedMathmogProblemKind as s, type Problem as t, type ProblemFact as u, applyLearnAnswer as v, applyLearnSeen as w, createLearnSession as x, currentLearnItemId as y, getLearnItemState as z };
