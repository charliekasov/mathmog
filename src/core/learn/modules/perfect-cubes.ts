// @peakprep/mathmog/core/learn/modules — Perfect Cubes Learn modules (Phase 2A.2).
//
// Hand-curated Recognize-tier distractors for 1³ through 10³, plus the four
// LearnModuleDefs (one per registry scope). Same curation contract as
// times-tables.ts / perfect-squares.ts (Q6 + the parity rule).
//
// Cubes-context confusion sources, in rough priority order:
// - n² — the forgot-the-third-factor slip, the single most common cube
//   error ("7³ = 49"). Deliberately admitted even though it's 1/n of the
//   answer: unlike the magnitude outliers excluded elsewhere, this is the
//   error students actually make, not filler;
// - adjacent cubes — (n±1)³, the which-cube-is-it slips (216/343/512);
// - n²·k slips — multiplied the square by the wrong third factor
//   (7²×3 = 147 for "cube means ×3"; 9²×3 = 243);
// - power slips — the wrong exponent on the right base (625 = 5⁴
//   "squared it twice", 256 = 2⁸, 81 = 3⁴, 32 = 2⁵);
// - zero-count slips for 10³ (100 and 10000 — appending the wrong number
//   of zeros IS the whole error space for powers of ten);
// - digit slips that look credible (216 → 126).

import type { LearnItem, LearnModuleDef } from '../types';
import { mathmogLearnModuleId } from '../mathmog-binding';
import { registryScopeLabel } from './scope-label';

/** Keyed by the base n. */
const CUBE_DISTRACTORS: Record<number, number[]> = {
  1: [3, 13, 8, 27],
  2: [4, 6, 27, 16],
  3: [9, 64, 81, 18],
  4: [16, 27, 125, 32],
  5: [25, 75, 64, 625],
  6: [36, 125, 343, 126],
  7: [49, 216, 512, 147],
  8: [64, 343, 729, 256],
  9: [81, 512, 1000, 243],
  10: [100, 10000, 729, 300],
};

/** Prompt mirrors the Drill generator's presentation: "7³". */
const cubeItem = (n: number): LearnItem<string, number> => ({
  id: `${n}^3`,
  prompt: `${n}³`,
  answer: n * n * n,
});

const rangeItems = (lo: number, hi: number): LearnItem<string, number>[] => {
  const items: LearnItem<string, number>[] = [];
  for (let n = lo; n <= hi; n++) items.push(cubeItem(n));
  return items;
};

const cubesModule = (
  scopeId: string,
  lo: number,
  hi: number,
  nextScopeId?: string
): LearnModuleDef<string, number> => {
  const items = rangeItems(lo, hi);
  return {
    id: mathmogLearnModuleId('perfect_cubes', scopeId),
    label: registryScopeLabel('perfect_cubes', scopeId),
    items,
    distractorSets: items.map(item => ({
      itemId: item.id,
      distractors: CUBE_DISTRACTORS[Number(item.id.split('^')[0])],
    })),
    ...(nextScopeId !== undefined && {
      nextModuleId: mathmogLearnModuleId('perfect_cubes', nextScopeId),
    }),
  };
};

/**
 * One module per registry scope; ranges match `cubesRangeForScope`.
 *
 * Learn-side adjacency (2A.5): 1–3 → 1–5 → 6–10 (the new portion of Full,
 * per user-stories F1: Iris's widen-into-unacquired moment on Perfect Cubes
 * resolves as "Learn the new portion first"). cubes_1_5 and cubes_6_10 are
 * a mutual pair; cubes_full is all-review once both halves are acquired —
 * no stored next.
 */
export const PERFECT_CUBES_LEARN_MODULES: LearnModuleDef<string, number>[] = [
  cubesModule('cubes_full', 1, 10),
  cubesModule('cubes_1_3', 1, 3, 'cubes_1_5'),
  cubesModule('cubes_1_5', 1, 5, 'cubes_6_10'),
  cubesModule('cubes_6_10', 6, 10, 'cubes_1_5'),
];
