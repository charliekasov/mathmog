import { D as Difficulty, u as Problem, q as MemorizeLearnTopic, r as MissDiagnosis, e as LearnItemState, d as LearnItem, c as LearnDistractorSet, g as LearnModuleDef, b as LearnConfig, f as LearnItemStatus, o as LearnTier, Q as QuizzedLearnTier } from '../mathmog-binding-DjIQYQpm.cjs';
export { A as AdaptiveData, I as INITIAL_LEARN_TIER, L as LEARN_TIER_LADDER, a as LearnActionResult, h as LearnRoundState, i as LearnRoundSummary, j as LearnRoundTrace, k as LearnSessionConfig, l as LearnSessionEvent, m as LearnSessionPhase, n as LearnSessionState, M as MATHMOG_LEARN_CONFIG, p as MEMORIZE_LEARN_TOPICS, s as MissedMathmogProblem, t as MissedMathmogProblemKind, P as PendingLevelUp, v as ProblemFact, R as RECOGNIZE_OPTION_COUNT, S as SpeedChallengeState, w as applyLearnAnswer, x as applyLearnSeen, y as createLearnSession, z as currentLearnItemId, B as getLearnItemState, C as learnSessionPhase, E as mathmogLearnModuleId, F as parseMathmogLearnModuleId, G as startNextLearnRound } from '../mathmog-binding-DjIQYQpm.cjs';
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
 * Upper bound on typed decimal places the faithful-transcription check will
 * verify. Past ~10 places float comparison stops being trustworthy; nobody
 * faithfully transcribes that far from a teach card. (Moved from the 2A.4
 * Learn grader when the check was unified into the Drill validator — 2D.3.)
 */
declare const MAX_TRANSCRIPTION_PLACES = 10;
/**
 * THE shared faithful-transcription check (2A.4 §4 grader-side ruling,
 * unified across Learn and Drill in 2D.3 — Charlie-ratified 2026-06-11).
 * True when `typed` is a faithful truncation or rounding of the fact's true
 * value at the typed precision, anywhere from the policy floor up to
 * `MAX_TRANSCRIPTION_PLACES` — the Learn See card displays the full
 * repeating form ("0.6666…"), so transcribing its digits (0.3333 for 1/3)
 * must grade correct everywhere. Repeating denominators only; terminating
 * fractions and non-fraction item ids return false (their exact value is
 * the only accepted answer — unchanged).
 *
 * `space: 'percent'` runs the same check against the percent shift of the
 * fact (33.33 for 1/3 as a percent), with the floor shifted two places
 * accordingly (exact integer arithmetic throughout — no float drift).
 *
 * This is validator behavior, deliberately NOT a family change: the 2D.1
 * policy table (`ceilingPlaces`), the displayed families, and the
 * explanation strings are Charlie-ratified and stay exactly as-is.
 */
declare const isFaithfulFractionTranscription: (itemId: string, typed: string, space?: "decimal" | "percent") => boolean;
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
 * Diagnose a wrong answer for one Memorize fact. Returns null whenever no
 * identity confidently matches — including unparseable item ids, topics
 * without a diagnoser yet, and answers equal to (or, for fractions, inside
 * the accepted family of) the true value. Callers render nothing extra on
 * null: the generic re-teach is the designed failure mode.
 */
declare const diagnoseMiss: (topic: MemorizeLearnTopic, itemId: string, wrongAnswer: number) => MissDiagnosis | null;

/**
 * The muted one-liner under "✅ Correct!" for a non-canonical accepted
 * answer to a repeating-fraction decimal conversion, or null when no
 * enrichment should render. `typed` is the student's raw input (decimal
 * space — fracToPerc answers are deliberately not enriched in 2D.3).
 */
declare const fractionEnrichmentPostscript: (itemId: string, typed: string) => string | null;

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

export { DRILL_TOPIC_REGISTRY, Difficulty, type DrillTopic, type DrillTopicInfo, FRACTION_ACCEPTED_DECIMALS, FRACTION_CONVERSIONS_LEARN_MODULES, FRACTION_DISTRACTOR_IDENTITIES, type FractionDistractorIdentity, type FractionDistractorIdentityEntry, LearnConfig, LearnDistractorSet, LearnItem, LearnItemState, LearnItemStatus, LearnModuleDef, LearnTier, MATHMOG_LEARN_MODULES, MAX_TRANSCRIPTION_PLACES, MemorizeLearnTopic, MissDiagnosis, PERFECT_CUBES_LEARN_MODULES, PERFECT_SQUARES_LEARN_MODULES, Problem, QuizzedLearnTier, REPEATING_PRECISION_FLOOR, type ScopeDef, TIMES_TABLES_LEARN_MODULES, acceptedDecimalFamily, applyCorrectAnswer, applyMiss, applySeen, assembleRecognizeOptions, cn, commonFractionConversions, createInitialItemState, createInitialItemStates, deriveItemStatus, diagnoseMiss, dropTier, escalateTier, fractionEnrichmentPostscript, fractionPrecisionPolicy, fractionToDecimalExplanation, fractionToPercentExplanation, generateProblem, getTopicInfo, getTopicsForLevel, isFaithfulFractionTranscription, isItemSolid, isLearnEligible, isLearnEligibleModule, isModuleComplete, isQuizzedTier, perfectCubes, perfectFifthPowers, perfectFourthPowers, perfectSquares, repeatingDecimalDisplay, roundFraction, simplifyFraction, solidProgress, topicHasDifficulty, truncateFraction, validateLearnModuleDef };
