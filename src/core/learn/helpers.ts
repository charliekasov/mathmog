// Pure helpers over the Learn vocabulary (Phase 2A.1). Everything here is
// stateless and side-effect free; the 2A.3 state machine composes these.
// All state-transition helpers return new objects (no mutation).

import {
  INITIAL_LEARN_TIER,
  LEARN_TIER_LADDER,
  RECOGNIZE_OPTION_COUNT,
} from './types';
import type {
  LearnConfig,
  LearnDistractorSet,
  LearnItem,
  LearnItemState,
  LearnItemStatus,
  LearnModuleDef,
  LearnTier,
  QuizzedLearnTier,
} from './types';

/** Narrows a tier to the gradeable ones (everything but `see`). */
export function isQuizzedTier(tier: LearnTier): tier is QuizzedLearnTier {
  return tier !== 'see';
}

/** One rung up the ladder; clamps at `recall`. */
export function escalateTier(tier: LearnTier): LearnTier {
  const i = LEARN_TIER_LADDER.indexOf(tier);
  return LEARN_TIER_LADDER[Math.min(i + 1, LEARN_TIER_LADDER.length - 1)];
}

/** One rung down the ladder; clamps at `see`. */
export function dropTier(tier: LearnTier): LearnTier {
  const i = LEARN_TIER_LADDER.indexOf(tier);
  return LEARN_TIER_LADDER[Math.max(i - 1, 0)];
}

export function createInitialItemState(itemId: string): LearnItemState {
  return {
    itemId,
    tier: INITIAL_LEARN_TIER,
    correctRecalls: 0,
    attempts: 0,
    misses: 0,
  };
}

export function createInitialItemStates(
  def: LearnModuleDef<unknown, unknown>
): LearnItemState[] {
  return def.items.map(item => createInitialItemState(item.id));
}

/**
 * The student finished a See card (tap-to-continue). Escalates back to
 * Recognize. See is exposure, not retrieval, so neither `attempts` nor
 * `correctRecalls` moves. No-op when the item isn't at `see`.
 */
export function applySeen(state: LearnItemState): LearnItemState {
  if (state.tier !== 'see') return state;
  return { ...state, tier: escalateTier(state.tier) };
}

/**
 * Correct answer at a quizzed tier: counts the attempt and escalates
 * (design doc §2.2). A correct at `recall` increments `correctRecalls` —
 * the only counter that drives completion. No-op at `see` (not a quizzed
 * tier; use `applySeen`).
 */
export function applyCorrectAnswer(state: LearnItemState): LearnItemState {
  if (state.tier === 'see') return state;
  return {
    ...state,
    tier: escalateTier(state.tier),
    attempts: state.attempts + 1,
    correctRecalls:
      state.tier === 'recall' ? state.correctRecalls + 1 : state.correctRecalls,
  };
}

/**
 * Miss at a quizzed tier: counts the attempt, drops a tier (design doc
 * §2.4 — the drop is the re-teach entry; a recognize-miss lands the item on
 * its See card). `correctRecalls` is preserved: the completion condition is
 * "recalled correctly at least twice" (§2.5), not twice-in-a-row. The 2A.3
 * design-lock notes flag this reading for review. A "Don't know?" decline
 * (design doc §1.1) is a miss. No-op at `see`.
 */
export function applyMiss(state: LearnItemState): LearnItemState {
  if (state.tier === 'see') return state;
  return {
    ...state,
    tier: dropTier(state.tier),
    attempts: state.attempts + 1,
    misses: state.misses + 1,
  };
}

/** Completion condition per item (Learn doc Q5): threshold from config. */
export function isItemSolid(
  state: LearnItemState,
  config: LearnConfig
): boolean {
  return state.correctRecalls >= config.recallsToSolid;
}

/** `new` → `learning` → `solid`, derived from the counters (never stored). */
export function deriveItemStatus(
  state: LearnItemState,
  config: LearnConfig
): LearnItemStatus {
  if (isItemSolid(state, config)) return 'solid';
  return state.attempts === 0 ? 'new' : 'learning';
}

/**
 * The one student-facing progress shape: a solid-of-total count, rendered as
 * text ("Facts solid: 8 of 11") per Learn doc Q4. Deliberately no percent
 * helper — a percentage is the first step toward the mastery-bar pattern the
 * gamification line excludes.
 */
export function solidProgress(
  states: LearnItemState[],
  config: LearnConfig
): { solid: number; total: number } {
  return {
    solid: states.filter(s => isItemSolid(s, config)).length,
    total: states.length,
  };
}

/** A module completes when every item is solid (design doc §2.5). */
export function isModuleComplete(
  states: LearnItemState[],
  config: LearnConfig
): boolean {
  return states.length > 0 && states.every(s => isItemSolid(s, config));
}

/**
 * Builds one Recognize-tier presentation: RECOGNIZE_OPTION_COUNT - 1
 * distractors drawn at random from the curated pool, shuffled with the
 * correct answer. Selection varies across presentations when the pool is
 * larger than needed, so a re-queued item doesn't show an identical option
 * layout the student can pattern-match instead of doing the math. `rng` is
 * injectable for deterministic tests; pass a stable function to reproduce a
 * layout.
 */
export function assembleRecognizeOptions<TAnswer>(
  item: LearnItem<unknown, TAnswer>,
  set: LearnDistractorSet<TAnswer>,
  rng: () => number = Math.random
): { options: TAnswer[]; correctIndex: number } {
  const pool = [...set.distractors];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const chosen = pool.slice(0, RECOGNIZE_OPTION_COUNT - 1);
  const correctIndex = Math.floor(rng() * (chosen.length + 1));
  const options = [
    ...chosen.slice(0, correctIndex),
    item.answer,
    ...chosen.slice(correctIndex),
  ];
  return { options, correctIndex };
}

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
export function validateLearnModuleDef<TPrompt, TAnswer>(
  def: LearnModuleDef<TPrompt, TAnswer>
): string[] {
  const problems: string[] = [];
  if (def.items.length === 0) {
    problems.push(`module "${def.id}" has no items`);
  }

  const itemIds = new Set<string>();
  for (const item of def.items) {
    if (item.id === '') {
      problems.push(`module "${def.id}" has an item with an empty id`);
      continue;
    }
    if (itemIds.has(item.id)) {
      problems.push(`module "${def.id}" has duplicate item id "${item.id}"`);
    }
    itemIds.add(item.id);
  }

  const coveredIds = new Set<string>();
  for (const set of def.distractorSets) {
    if (!itemIds.has(set.itemId)) {
      problems.push(
        `module "${def.id}" has a distractor set for unknown item "${set.itemId}"`
      );
      continue;
    }
    if (coveredIds.has(set.itemId)) {
      problems.push(
        `module "${def.id}" has duplicate distractor sets for item "${set.itemId}"`
      );
    }
    coveredIds.add(set.itemId);

    if (set.distractors.length < RECOGNIZE_OPTION_COUNT - 1) {
      problems.push(
        `item "${set.itemId}" has ${set.distractors.length} distractors; needs at least ${RECOGNIZE_OPTION_COUNT - 1}`
      );
    }
    if (new Set(set.distractors).size !== set.distractors.length) {
      problems.push(`item "${set.itemId}" has duplicate distractors`);
    }
    const item = def.items.find(i => i.id === set.itemId);
    if (item && set.distractors.some(d => d === item.answer)) {
      problems.push(
        `item "${set.itemId}" has a distractor equal to its correct answer`
      );
    }
  }

  for (const id of itemIds) {
    if (!coveredIds.has(id)) {
      problems.push(`item "${id}" has no distractor set`);
    }
  }

  return problems;
}

/**
 * A single module is Learn-eligible when it is structurally sound: finite
 * non-empty item set with full Recognize-tier distractor coverage.
 */
export function isLearnEligibleModule<TPrompt, TAnswer>(
  def: LearnModuleDef<TPrompt, TAnswer>
): boolean {
  return validateLearnModuleDef(def).length === 0;
}

/**
 * The eligibility predicate the portal asks before rendering the Learn
 * button (Learn doc Q2 resolution: conditional button on the ready screen,
 * shown only when the selection maps to a valid module). `modules` is
 * whatever registry of curated modules exists at the call site — 2A.2 ships
 * the curated registries per topic.
 */
export function isLearnEligible(
  modules: LearnModuleDef<unknown, unknown>[],
  moduleId: string
): boolean {
  const def = modules.find(m => m.id === moduleId);
  return def !== undefined && isLearnEligibleModule(def);
}
