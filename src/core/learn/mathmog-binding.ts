// Math Mog binding for the generic Learn vocabulary (Phase 2A.1).
//
// For Math Mog, a Learn module IS a Memorize scope viewed as a Learn target
// (curriculum doc §6.5 — "same data, two modes"). The binding pins module
// identity to the (topic, scope) pair and carries the product's tuning.
// Only finite Memorize fact sets bind; Estimate / Get Crafty topics are
// generated and infinite, so no module id ever exists for them.

import type { DrillTopic } from '../drill-topics';
import type { LearnSessionConfig } from './machine';

/**
 * The Memorize (level 1) topics — the only ones whose content is a finite
 * enumerable fact set, hence the only ones that can ever bind to a Learn
 * module (curriculum doc §6.1). Estimate / Get Crafty topics are excluded at
 * the type level so a Learn module id cannot be minted for procedural
 * content (assignment URLs in 2B.4 build on this function). A test pins this
 * list against `DRILL_TOPIC_REGISTRY` level-1 entries so it can't silently
 * drift from the registry.
 */
export const MEMORIZE_LEARN_TOPICS = [
  'times_tables',
  'perfect_squares',
  'perfect_cubes',
  'fraction_conversions',
  'advanced_squares',
  'advanced_cubes',
  'higher_powers',
  'common_multiples',
] as const satisfies readonly DrillTopic[];

export type MemorizeLearnTopic = (typeof MEMORIZE_LEARN_TOPICS)[number];

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
export const MATHMOG_LEARN_CONFIG: LearnSessionConfig = {
  recallsToSolid: 2,
  maxRoundSize: 12,
  requeueGap: 3,
};

/**
 * Module-id wire format: `<topic>/<scopeId>`, e.g.
 * `times_tables/tt_just_7`. The explicit topic segment keeps ids
 * self-describing for assignment URLs (slice 2B.4) and Firestore keys
 * (slice 2B.1) even though scope ids are currently prefix-unique on their
 * own.
 */
export function mathmogLearnModuleId(
  topic: MemorizeLearnTopic,
  scopeId: string
): string {
  return `${topic}/${scopeId}`;
}

/** Inverse of `mathmogLearnModuleId`; null when the shape doesn't match. */
export function parseMathmogLearnModuleId(
  moduleId: string
): { topic: string; scopeId: string } | null {
  const parts = moduleId.split('/');
  if (parts.length !== 2 || parts[0] === '' || parts[1] === '') return null;
  return { topic: parts[0], scopeId: parts[1] };
}
