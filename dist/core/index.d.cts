import { D as Difficulty, b as Problem } from '../miss-types-Chf6mwut.cjs';
export { A as AdaptiveData, M as MissedMathmogProblem, a as MissedMathmogProblemKind, P as PendingLevelUp, S as SpeedChallengeState } from '../miss-types-Chf6mwut.cjs';
import { ClassValue } from 'clsx';

declare const simplifyFraction: (num: number, den: number) => string;
/** Lowest accepted precision for repeating denominators (Charlie-ratified). */
declare const REPEATING_PRECISION_FLOOR = 2;
/** num/den truncated at `places` — exact (integer arithmetic, no float drift). */
declare const truncateFraction: (num: number, den: number, places: number) => number;
/** num/den rounded at `places` (round half up — the schoolroom convention). */
declare const roundFraction: (num: number, den: number, places: number) => number;
/**
 * The per-denominator precision policy. This is the tuning surface for the
 * family generator: adjust floors/ceilings here, never per-fact values.
 */
declare const fractionPrecisionPolicy: (den: number) => {
    floorPlaces: number;
    canonicalPlaces: number;
    ceilingPlaces: number;
};
/**
 * Every decimal the Drill grades correct for num/den, derived from the
 * policy. Order is precision-major, truncation before rounding — also the
 * render order when the family is displayed ("0.66 or 0.67 or 0.666 or
 * 0.667"). The 2A.4 Recall grader and the Drill share this list, so Learn
 * and Drill cannot disagree about a family (review finding #3).
 */
declare const acceptedDecimalFamily: (num: number, den: number) => number[];
/**
 * The repeating expansion for display: enough digits to show the repetend
 * (at least four for short cycles), then an ellipsis — "0.6666…",
 * "0.1666…", "0.142857…". Also handles shifted values for percent display
 * (200/3 → "66.6666…"). Throws on terminating fractions.
 */
declare const repeatingDecimalDisplay: (num: number, den: number) => string;
/**
 * fracToDec explanation. Repeating fractions show the repeating form and
 * lead with the truncated canonical — the same number Learn teaches and the
 * reference card lists first (2A.2 truncated-canonical ruling); the rounded
 * form rides along as the schoolroom alternative. Replaces the old
 * `toFixed` string, which ROUNDED ("0.67") while Learn taught the truncated
 * canonical (0.66) — same student, two different "the answers".
 */
declare const fractionToDecimalExplanation: (num: number, den: number) => string;
/** fracToPerc explanation, same truncated-canonical alignment as fracToDec. */
declare const fractionToPercentExplanation: (num: number, den: number, percentPlaces: number) => string;
declare const commonFractionConversions: {
    frac: string;
    decimal: string;
    percent: string;
}[];
declare const perfectSquares: Record<number, number>;
declare const perfectCubes: Record<number, number>;
declare const perfectFourthPowers: Record<number, number>;
declare const perfectFifthPowers: Record<number, number>;
declare const generateProblem: (level: number, difficulty: Difficulty, history: string[], topic?: string, scope?: string) => Problem;

/** One diagnosed miss: a stable pattern id plus the student-facing line. */
interface MissDiagnosis {
    /**
     * Stable error-pattern id (e.g. "tt-adjacent-product",
     * "frac-under-precision") for telemetry and tests. Never shown to
     * students.
     */
    code: string;
    /**
     * One short student-facing line. States a fact about the number, never
     * the student's intent; ends with the true value so the re-teach rides
     * along.
     */
    message: string;
}

/** Why a curated fraction distractor is wrong — the curation's error story. */
type FractionDistractorIdentity = 
/** The value IS another fact's accepted decimal (or its truncation). */
{
    kind: 'other-fact';
    fraction: string;
}
/** Another fact's value, specifically the complement (d−n)/d. */
 | {
    kind: 'complement';
    fraction: string;
}
/** Sevenths: another rotation of the 142857 wheel. */
 | {
    kind: 'rotation';
    fraction: string;
}
/** Reads the fraction's own digits straight across (3/8 → 0.38). */
 | {
    kind: 'digits';
}
/** A correct form with two digits swapped (0.143 → 0.134). */
 | {
    kind: 'digit-swap';
    of: number;
}
/** Percent-magnitude slip (1/5 → 0.05, i.e. 5% for 20%). */
 | {
    kind: 'percent-slip';
}
/** The numerator or denominator alone, read as a decimal (1/4 → 0.4). */
 | {
    kind: 'part-as-decimal';
    part: 'numerator' | 'denominator';
};
interface FractionDistractorIdentityEntry {
    /** The pool value this identity belongs to (exact match at lookup). */
    value: number;
    identity: FractionDistractorIdentity;
}
/**
 * Keyed by item id ("5/6"). REPEATING-denominator entries whose value is
 * also a faithful truncation/rounding of the item below the precision
 * floor (0.4 for 3/7, 0.2 for 1/6, 0.6 for 4/7) are shadowed at lookup
 * time by the under-precision detector, which outranks the pool there —
 * validating a right start beats naming a different fact when both are
 * true. They stay annotated so the table fully mirrors the pools. For
 * terminating denominators the pool identity wins instead (rationale in
 * diagnose.ts).
 *
 * Deliberately unannotated (no defensible single error story, or the
 * detector already produces the best line): 0.35 for 3/8 (generic
 * re-teach), 0.45 for 4/9 (last-digit detector covers it).
 */
declare const FRACTION_DISTRACTOR_IDENTITIES: Record<string, FractionDistractorIdentityEntry[]>;

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

/**
 * Diagnose a wrong answer for one Memorize fact. Returns null whenever no
 * identity confidently matches — including unparseable item ids, topics
 * without a diagnoser yet, and answers equal to (or, for fractions, inside
 * the accepted family of) the true value. Callers render nothing extra on
 * null: the generic re-teach is the designed failure mode.
 */
declare const diagnoseMiss: (topic: MemorizeLearnTopic, itemId: string, wrongAnswer: number) => MissDiagnosis | null;

type DrillTopic = 'times_tables' | 'perfect_squares' | 'perfect_cubes' | 'fraction_conversions' | 'advanced_squares' | 'advanced_cubes' | 'higher_powers' | 'common_multiples' | 'multiplication_estimation' | 'root_estimation' | 'fraction_estimation' | 'percentage_calculations' | 'strategic_mul_div' | 'divisibility_3_6_9' | 'divisibility_4_8' | 'divisibility_7';
interface ScopeDef {
    id: string;
    label: string;
    description?: string;
    widerThan?: string[];
    narrowerThan?: string[];
}
interface DrillTopicInfo {
    id: DrillTopic;
    label: string;
    level: number;
    hasDifficulty: boolean;
    description: string;
    scopes?: ScopeDef[];
}
declare const DRILL_TOPIC_REGISTRY: DrillTopicInfo[];
declare function getTopicsForLevel(level: number): DrillTopicInfo[];
declare function getTopicInfo(topicId: string): DrillTopicInfo | undefined;
declare function topicHasDifficulty(topicId: string): boolean;

/** Narrows a tier to the gradeable ones (everything but `see`). */
declare function isQuizzedTier(tier: LearnTier): tier is QuizzedLearnTier;
/** One rung up the ladder; clamps at `recall`. */
declare function escalateTier(tier: LearnTier): LearnTier;
/** One rung down the ladder; clamps at `see`. */
declare function dropTier(tier: LearnTier): LearnTier;
declare function createInitialItemState(itemId: string): LearnItemState;
declare function createInitialItemStates(def: LearnModuleDef<unknown, unknown>): LearnItemState[];
/**
 * The student finished a See card (tap-to-continue). Escalates back to
 * Recognize. See is exposure, not retrieval, so neither `attempts` nor
 * `correctRecalls` moves. No-op when the item isn't at `see`.
 */
declare function applySeen(state: LearnItemState): LearnItemState;
/**
 * Correct answer at a quizzed tier: counts the attempt and escalates
 * (design doc §2.2). A correct at `recall` increments `correctRecalls` —
 * the only counter that drives completion. No-op at `see` (not a quizzed
 * tier; use `applySeen`).
 */
declare function applyCorrectAnswer(state: LearnItemState): LearnItemState;
/**
 * Miss at a quizzed tier: counts the attempt, drops a tier (design doc
 * §2.4 — the drop is the re-teach entry; a recognize-miss lands the item on
 * its See card). `correctRecalls` is preserved: the completion condition is
 * "recalled correctly at least twice" (§2.5), not twice-in-a-row. The 2A.3
 * design-lock notes flag this reading for review. A "Don't know?" decline
 * (design doc §1.1) is a miss. No-op at `see`.
 */
declare function applyMiss(state: LearnItemState): LearnItemState;
/** Completion condition per item (Learn doc Q5): threshold from config. */
declare function isItemSolid(state: LearnItemState, config: LearnConfig): boolean;
/** `new` → `learning` → `solid`, derived from the counters (never stored). */
declare function deriveItemStatus(state: LearnItemState, config: LearnConfig): LearnItemStatus;
/**
 * The one student-facing progress shape: a solid-of-total count, rendered as
 * text ("Facts solid: 8 of 11") per Learn doc Q4. Deliberately no percent
 * helper — a percentage is the first step toward the mastery-bar pattern the
 * gamification line excludes.
 */
declare function solidProgress(states: LearnItemState[], config: LearnConfig): {
    solid: number;
    total: number;
};
/** A module completes when every item is solid (design doc §2.5). */
declare function isModuleComplete(states: LearnItemState[], config: LearnConfig): boolean;
/**
 * Builds one Recognize-tier presentation: RECOGNIZE_OPTION_COUNT - 1
 * distractors drawn at random from the curated pool, shuffled with the
 * correct answer. Selection varies across presentations when the pool is
 * larger than needed, so a re-queued item doesn't show an identical option
 * layout the student can pattern-match instead of doing the math. `rng` is
 * injectable for deterministic tests; pass a stable function to reproduce a
 * layout.
 */
declare function assembleRecognizeOptions<TAnswer>(item: LearnItem<unknown, TAnswer>, set: LearnDistractorSet<TAnswer>, rng?: () => number): {
    options: TAnswer[];
    correctIndex: number;
};
/**
 * Mechanical integrity checks on a module definition. Returns human-readable
 * problems (empty array = structurally sound). This is the cheap half of the
 * 2A.2 quality gate — plausibility of distractors stays a human
 * (`math-ed-ux-reviewer`) judgment; this catches the mechanical failures:
 * missing or thin distractor coverage, a distractor equal to the correct
 * answer, references to unknown items. Equality on answers is strict (`===`)
 * — products with non-primitive answer types need their own comparison at
 * curation time.
 */
declare function validateLearnModuleDef<TPrompt, TAnswer>(def: LearnModuleDef<TPrompt, TAnswer>): string[];
/**
 * A single module is Learn-eligible when it is structurally sound: finite
 * non-empty item set with full Recognize-tier distractor coverage.
 */
declare function isLearnEligibleModule<TPrompt, TAnswer>(def: LearnModuleDef<TPrompt, TAnswer>): boolean;
/**
 * The eligibility predicate the portal asks before rendering the Learn
 * button (Learn doc Q2 resolution: conditional button on the ready screen,
 * shown only when the selection maps to a valid module). `modules` is
 * whatever registry of curated modules exists at the call site — 2A.2 ships
 * the curated registries per topic.
 */
declare function isLearnEligible(modules: LearnModuleDef<unknown, unknown>[], moduleId: string): boolean;

/**
 * One Learn module per registry scope (design doc §6.5: every finite
 * Memorize fact set; the scope and the module are the same content unit
 * viewed two ways). A test pins this list against the registry so a new
 * scope can't ship without its module decision.
 */
declare const TIMES_TABLES_LEARN_MODULES: LearnModuleDef<string, number>[];

/** One module per registry scope; ranges match `squaresRangeForScope`. */
declare const PERFECT_SQUARES_LEARN_MODULES: LearnModuleDef<string, number>[];

/** One module per registry scope; ranges match `cubesRangeForScope`. */
declare const PERFECT_CUBES_LEARN_MODULES: LearnModuleDef<string, number>[];

/**
 * Every decimal the Drill grades as correct, per item — derived straight
 * from the 2D.1 precision policy, the same function that builds the Drill's
 * `answers` maps, so Learn and Drill cannot disagree about a family. The
 * 2A.4 Recall grader accepts any member (matching the Drill's number
 * input); curation excludes all members from the item's distractor pool.
 */
declare const FRACTION_ACCEPTED_DECIMALS: Record<string, number[]>;
/**
 * One module per registry scope; denominator lists match the Drill's
 * `fractionDenominatorsForScope` (pinned by test).
 */
declare const FRACTION_CONVERSIONS_LEARN_MODULES: LearnModuleDef<string, number>[];

/** Every curated Math Mog Learn module across all topics shipped so far. */
declare const MATHMOG_LEARN_MODULES: LearnModuleDef<string, number>[];

declare function cn(...inputs: ClassValue[]): string;

export { DRILL_TOPIC_REGISTRY, Difficulty, type DrillTopic, type DrillTopicInfo, FRACTION_ACCEPTED_DECIMALS, FRACTION_CONVERSIONS_LEARN_MODULES, FRACTION_DISTRACTOR_IDENTITIES, type FractionDistractorIdentity, type FractionDistractorIdentityEntry, INITIAL_LEARN_TIER, LEARN_TIER_LADDER, type LearnActionResult, type LearnConfig, type LearnDistractorSet, type LearnItem, type LearnItemState, type LearnItemStatus, type LearnModuleDef, type LearnRoundState, type LearnRoundSummary, type LearnRoundTrace, type LearnSessionConfig, type LearnSessionEvent, type LearnSessionPhase, type LearnSessionState, type LearnTier, MATHMOG_LEARN_CONFIG, MATHMOG_LEARN_MODULES, MEMORIZE_LEARN_TOPICS, type MemorizeLearnTopic, type MissDiagnosis, PERFECT_CUBES_LEARN_MODULES, PERFECT_SQUARES_LEARN_MODULES, Problem, type QuizzedLearnTier, RECOGNIZE_OPTION_COUNT, REPEATING_PRECISION_FLOOR, type ScopeDef, TIMES_TABLES_LEARN_MODULES, acceptedDecimalFamily, applyCorrectAnswer, applyLearnAnswer, applyLearnSeen, applyMiss, applySeen, assembleRecognizeOptions, cn, commonFractionConversions, createInitialItemState, createInitialItemStates, createLearnSession, currentLearnItemId, deriveItemStatus, diagnoseMiss, dropTier, escalateTier, fractionPrecisionPolicy, fractionToDecimalExplanation, fractionToPercentExplanation, generateProblem, getLearnItemState, getTopicInfo, getTopicsForLevel, isItemSolid, isLearnEligible, isLearnEligibleModule, isModuleComplete, isQuizzedTier, learnSessionPhase, mathmogLearnModuleId, parseMathmogLearnModuleId, perfectCubes, perfectFifthPowers, perfectFourthPowers, perfectSquares, repeatingDecimalDisplay, roundFraction, simplifyFraction, solidProgress, startNextLearnRound, topicHasDifficulty, truncateFraction, validateLearnModuleDef };
