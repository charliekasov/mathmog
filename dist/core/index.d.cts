import { D as Difficulty, b as Problem } from '../miss-types-Chf6mwut.cjs';
export { A as AdaptiveData, M as MissedMathmogProblem, a as MissedMathmogProblemKind, P as PendingLevelUp, S as SpeedChallengeState } from '../miss-types-Chf6mwut.cjs';
import { ClassValue } from 'clsx';

declare const simplifyFraction: (num: number, den: number) => string;
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

/** Every curated Math Mog Learn module across all topics shipped so far. */
declare const MATHMOG_LEARN_MODULES: LearnModuleDef<string, number>[];

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
 * Math Mog completion tuning: recalled-correctly-twice (Learn doc Q5
 * resolution — Quizlet's Write standard as the default, held in a per-product
 * constant rather than a literal).
 */
declare const MATHMOG_LEARN_CONFIG: LearnConfig;
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

declare function cn(...inputs: ClassValue[]): string;

export { DRILL_TOPIC_REGISTRY, Difficulty, type DrillTopic, type DrillTopicInfo, INITIAL_LEARN_TIER, LEARN_TIER_LADDER, type LearnConfig, type LearnDistractorSet, type LearnItem, type LearnItemState, type LearnItemStatus, type LearnModuleDef, type LearnRoundState, type LearnRoundSummary, type LearnTier, MATHMOG_LEARN_CONFIG, MATHMOG_LEARN_MODULES, MEMORIZE_LEARN_TOPICS, type MemorizeLearnTopic, Problem, type QuizzedLearnTier, RECOGNIZE_OPTION_COUNT, type ScopeDef, TIMES_TABLES_LEARN_MODULES, applyCorrectAnswer, applyMiss, applySeen, assembleRecognizeOptions, cn, commonFractionConversions, createInitialItemState, createInitialItemStates, deriveItemStatus, dropTier, escalateTier, generateProblem, getTopicInfo, getTopicsForLevel, isItemSolid, isLearnEligible, isLearnEligibleModule, isModuleComplete, isQuizzedTier, mathmogLearnModuleId, parseMathmogLearnModuleId, perfectCubes, perfectFifthPowers, perfectFourthPowers, perfectSquares, simplifyFraction, solidProgress, topicHasDifficulty, validateLearnModuleDef };
