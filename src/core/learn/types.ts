// @peakprep/mathmog/core/learn — Learn-mode type vocabulary (Phase 2A.1).
//
// Learn is the acquisition mode: a finite, graduated, teach-then-quiz pass
// over an enumerable fact set that ends when every item has been recalled
// from memory. Canonical pattern: DESIGN-mog-learn-mode.md §2 (portal repo);
// Math Mog instantiation: §6 of the same doc + DESIGN-mathmog-curriculum.md
// §3.9.
//
// This module is the VOCABULARY only. The session state machine that drives
// tier transitions, re-queuing, and round assembly is slice 2A.3; per-topic
// distractor curation is 2A.2. The vocabulary is product-agnostic (the
// pattern targets Math Mog first, then Formula Mog / Word Mog per design doc
// §7–8): item content is a type parameter and nothing here names a topic.
// The Math Mog binding (module-id convention, product config) lives in
// `./mathmog-binding.ts`.
//
// Two design rails are deliberately ABSENT from these types:
// - No percentage, streak, badge, or cross-session mastery fields. Progress
//   is derivable only as a solid-of-total count ("Facts solid: 8 of 11") via
//   `solidProgress` — Learn doc Q4 resolution + the §3 gamification line.
// - No per-item timestamps or due-date fields. Spaced repetition is deferred
//   to Phase 7+ (Learn doc Q8 resolution); don't design for it.

/**
 * The graduated retrieval ladder, easy to hard (design doc §2.2). Order is
 * load-bearing: `escalateTier` / `dropTier` move along this array.
 * - `see`: exposure — the item shown with its answer. Not a quizzed tier.
 * - `recognize`: cued recall — pick the answer from options.
 * - `recall`: free recall — produce the answer from memory. Only correct
 *   answers at this tier count toward completion.
 */
export const LEARN_TIER_LADDER = ['see', 'recognize', 'recall'] as const;

export type LearnTier = (typeof LEARN_TIER_LADDER)[number];

/**
 * The tiers a student actually answers at. See is exposure (tap-to-continue),
 * never graded — functions that grade, assemble options, or pick an input
 * mode should take this type so calling them at `see` is a compile error,
 * not a runtime no-op convention. Narrow with `isQuizzedTier`.
 */
export type QuizzedLearnTier = Exclude<LearnTier, 'see'>;

/**
 * Per-item lifecycle state (design doc §2.3): `new` (never attempted) →
 * `learning` (attempted, not yet solid) → `solid` (recalled correctly
 * `recallsToSolid` times). Never stored — always derived from the counters
 * on `LearnItemState` via `deriveItemStatus`, so it cannot drift from the
 * facts that define it.
 */
export type LearnItemStatus = 'new' | 'learning' | 'solid';

/**
 * One learnable fact. For Math Mog the teach card is the fact itself
 * (design doc §6.2): the See tier renders `prompt` + `answer` and needs no
 * authored lesson content. Products whose teach cards carry real content
 * (Formula Mog §7, Word Mog §8) widen `TPrompt` to a richer shape.
 */
export interface LearnItem<TPrompt = string, TAnswer = string> {
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
export interface LearnDistractorSet<TAnswer = string> {
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
export interface LearnModuleDef<TPrompt = string, TAnswer = string> {
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
export interface LearnConfig {
  recallsToSolid: number;
}

/**
 * Per-item session state: the facts the machine needs, nothing more.
 * `status` is deliberately not a field — derive it (`deriveItemStatus`).
 * `attempts`/`misses` exist for the round summary and the tutor-facing
 * session trace (design doc §4.2, e.g. "recall accuracy 90%"); they are
 * never surfaced to the student as a score.
 */
export interface LearnItemState {
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
export interface LearnRoundState {
  /** 1-based. */
  roundNumber: number;
  /** Item ids remaining in this round, in presentation order. */
  queue: string[];
}

/** Between-rounds summary (design doc §2: "after a round, a summary"). */
export interface LearnRoundSummary {
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
export const RECOGNIZE_OPTION_COUNT = 4;

/**
 * Every item starts at Recognize — no calibration pre-pass in v1 (Learn doc
 * Q3 resolution). Consequence worth stating: in v1 the See tier is reached
 * only by dropping from Recognize on a miss, so See's role is the re-teach
 * beat (§2.4), not first contact.
 */
export const INITIAL_LEARN_TIER: LearnTier = 'recognize';
