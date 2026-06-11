// @peakprep/mathmog/core/learn/modules — Perfect Squares Learn modules (Phase 2A.2).
//
// Hand-curated Recognize-tier distractors for 1² through 20², plus the six
// LearnModuleDefs (one per registry scope). Same curation contract as
// times-tables.ts (Q6: hand-picked pools, ≥1 plausible near-miss each;
// `assembleRecognizeOptions` samples 3 per presentation, so 4–5-entry pools
// buy layout variety).
//
// Squares-context confusion sources, in rough priority order:
// - adjacent squares — (n±1)², the which-square-is-it slips (49/36/64);
// - n²±n — the (n±1)×n off-by-one-factor product;
// - cube/power slips — n³ for small n (3²=27), the ×12-style overshoot
//   square (n+2)² for big n;
// - digit transpositions that look credible (256/265, 169/196 — the latter
//   doubles as 13²-vs-14²).
//
// Parity rule (inherited from the Times Tables reviewer pass): odd-answer
// facts take at least TWO odd distractors — (n±2)² odd squares, odd
// products. (n±1)² and n²±n of an odd n are all even, so curating purely
// from the adjacency rule hands the answer to parity elimination.
// Terminal-digit hygiene: squares end only in 0/1/4/5/6/9, and ×5 facts end
// in 25 — pools keep plausible terminal digits so elimination by last digit
// doesn't beat retrieval.
//
// Facts shared with Times Tables (2²…12² = the TT doubles) are deliberately
// curated SEPARATELY here: the module context changes the canonical
// confusions (adjacent squares and cube slips, not adjacent products), so
// pools attach to the (fact, topic) pair, not the bare fact.

import type { LearnItem, LearnModuleDef } from '../types';
import { mathmogLearnModuleId } from '../mathmog-binding';
import { registryScopeLabel } from './scope-label';

/** Keyed by the base n. */
const SQUARE_DISTRACTORS: Record<number, number[]> = {
  1: [2, 4, 9, 11],
  2: [6, 8, 9, 2],
  3: [6, 12, 16, 27, 15],
  4: [12, 20, 9, 25],
  5: [20, 30, 16, 35, 15],
  6: [30, 42, 25, 49],
  7: [36, 64, 42, 63, 35],
  8: [56, 72, 49, 81],
  9: [72, 90, 64, 63, 99],
  10: [90, 110, 81, 121],
  11: [110, 132, 144, 111, 99],
  12: [132, 121, 156, 169],
  13: [156, 196, 144, 121, 225],
  14: [182, 210, 169, 225],
  15: [210, 240, 196, 125, 289],
  16: [240, 272, 225, 289, 265],
  17: [272, 324, 256, 225, 361],
  18: [306, 342, 289, 361],
  19: [342, 380, 324, 289, 441],
  20: [380, 420, 361, 441],
};

/** Prompt mirrors the Drill generator's presentation: "7²". */
const squareItem = (n: number): LearnItem<string, number> => ({
  id: `${n}^2`,
  prompt: `${n}²`,
  answer: n * n,
});

const rangeItems = (lo: number, hi: number): LearnItem<string, number>[] => {
  const items: LearnItem<string, number>[] = [];
  for (let n = lo; n <= hi; n++) items.push(squareItem(n));
  return items;
};

const squaresModule = (
  scopeId: string,
  lo: number,
  hi: number
): LearnModuleDef<string, number> => {
  const items = rangeItems(lo, hi);
  return {
    id: mathmogLearnModuleId('perfect_squares', scopeId),
    label: registryScopeLabel('perfect_squares', scopeId),
    items,
    distractorSets: items.map(item => ({
      itemId: item.id,
      distractors: SQUARE_DISTRACTORS[Number(item.id.split('^')[0])],
    })),
  };
};

/** One module per registry scope; ranges match `squaresRangeForScope`. */
export const PERFECT_SQUARES_LEARN_MODULES: LearnModuleDef<string, number>[] = [
  squaresModule('squares_full', 1, 20),
  squaresModule('squares_1_5', 1, 5),
  squaresModule('squares_1_10', 1, 10),
  squaresModule('squares_11_15', 11, 15),
  squaresModule('squares_11_20', 11, 20),
  squaresModule('squares_16_20', 16, 20),
];
