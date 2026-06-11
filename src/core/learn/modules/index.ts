// @peakprep/mathmog/core/learn/modules — curated Learn module registries.
//
// One file per topic, in 2A.2 slice order: Times Tables (this slice), then
// Perfect Squares, Perfect Cubes, Fractions ↔ Decimals ↔ Percents. Each topic
// slice appends its modules to MATHMOG_LEARN_MODULES — the single array the
// portal hands to `isLearnEligible` (Q2) and the 2A.3 machine resolves module
// ids against.

import type { LearnModuleDef } from '../types';
import { TIMES_TABLES_LEARN_MODULES } from './times-tables';
import { PERFECT_SQUARES_LEARN_MODULES } from './perfect-squares';
import { PERFECT_CUBES_LEARN_MODULES } from './perfect-cubes';
import {
  FRACTION_CONVERSIONS_LEARN_MODULES,
  FRACTION_ACCEPTED_DECIMALS,
} from './fractions';

export {
  TIMES_TABLES_LEARN_MODULES,
  PERFECT_SQUARES_LEARN_MODULES,
  PERFECT_CUBES_LEARN_MODULES,
  FRACTION_CONVERSIONS_LEARN_MODULES,
  FRACTION_ACCEPTED_DECIMALS,
};

/** Every curated Math Mog Learn module across all topics shipped so far. */
export const MATHMOG_LEARN_MODULES: LearnModuleDef<string, number>[] = [
  ...TIMES_TABLES_LEARN_MODULES,
  ...PERFECT_SQUARES_LEARN_MODULES,
  ...PERFECT_CUBES_LEARN_MODULES,
  ...FRACTION_CONVERSIONS_LEARN_MODULES,
];
