// @peakprep/mathmog/core/learn/modules — Times Tables Learn modules (Phase 2A.2).
//
// Hand-curated Recognize-tier distractors for every times-tables fact, plus
// the nine LearnModuleDefs (one per registry scope). Curation rules per
// DESIGN-mog-learn-mode.md §6.4 + Learn doc Q6 resolution: every pool is
// hand-picked (never generated at runtime) and carries at least one plausible
// near-miss — an adjacent product (off by one row or one column), a
// neighboring-row confusion (7×8 vs 6×9), or a digit transposition (54 vs 45).
// Pools may exceed 3 entries: `assembleRecognizeOptions` samples 3 per
// presentation, so larger pools buy layout variety when an item re-queues.
//
// Item enumeration mirrors the Drill generator (math-problems.ts):
// - Single-row scopes (tt_just_6 … tt_just_9) preserve row-first order — the
//   student who picked "Just the 7× table" sees "7 × b" consistently, in
//   ascending order 7×2 … 7×12 (11 items).
// - Multi-row scopes present each fact larger-factor-first (the Drill's
//   canonical order) and dedupe commutative pairs: tt_2_5 contains "5 × 2"
//   once, not "2 × 5" and "5 × 2" as separate items.
// Distractors attach to the FACT, not the presentation, so both orders of a
// pair share one curated pool.

import { DRILL_TOPIC_REGISTRY } from '../../drill-topics';
import type { LearnDistractorSet, LearnItem, LearnModuleDef } from '../types';
import { mathmogLearnModuleId } from '../mathmog-binding';

const TT_FACTORS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/**
 * One curated pool per unique fact, keyed `"<lo>x<hi>"` (smaller factor
 * first). 66 facts = every unordered pair from 2…12; every scope's item set
 * is a subset, so this table is the single curation surface for the topic.
 *
 * Hand-curated (Q6): each entry was chosen, not derived. The recurring
 * sources of wrong answers, in rough priority order:
 * - adjacent products — (a±1)×b and a×(b±1), the off-by-one-row slips;
 * - neighboring-fact confusions — 7×8=56 vs 6×9=54 vs 7×9=63;
 * - digit transpositions where they look like real products (45/54, 36/63);
 * - the "kept adding the smaller factor" overshoot (2×13=26, 7×13=91).
 *
 * Parity rule (2A.2 reviewer pass): odd-answer facts take at least TWO odd
 * distractors — two-off same-row products (a×(b±2)), odd squares, odd
 * overshoots. Adjacent products of an odd×odd fact are always even, so
 * curating purely from the off-by-one rule hands the answer to parity
 * elimination ("odd×odd is odd, only one option is odd"). Future topic
 * curations inherit this rule wherever an answer family has a parity or
 * terminal-digit signature.
 */
const TT_FACT_DISTRACTORS: Record<string, number[]> = {
  // 2× row
  '2x2': [6, 8, 2, 5],
  '2x3': [4, 8, 9, 5],
  '2x4': [6, 10, 12, 9],
  '2x5': [8, 12, 15, 20],
  '2x6': [10, 14, 18, 13],
  '2x7': [12, 16, 21, 13],
  '2x8': [14, 18, 24, 15],
  '2x9': [16, 20, 27, 17],
  '2x10': [18, 22, 30, 21],
  '2x11': [20, 24, 33, 21],
  '2x12': [22, 26, 36, 28],
  // 3× row
  '3x3': [6, 12, 8, 27, 15],
  '3x4': [9, 15, 16, 8],
  '3x5': [12, 18, 25, 35],
  '3x6': [15, 21, 24, 12],
  '3x7': [24, 28, 27, 15],
  '3x8': [21, 27, 32, 16],
  '3x9': [24, 36, 21, 33],
  '3x10': [27, 33, 40, 20],
  '3x11': [44, 30, 27, 39],
  '3x12': [33, 39, 48, 24],
  // 4× row
  '4x4': [12, 20, 18, 8],
  '4x5': [16, 24, 25, 15],
  '4x6': [20, 28, 30, 18],
  '4x7': [24, 32, 35, 21],
  '4x8': [28, 36, 40, 24],
  '4x9': [32, 40, 45, 27],
  '4x10': [36, 44, 50, 30],
  '4x11': [40, 48, 55, 33],
  '4x12': [44, 52, 60, 36],
  // 5× row
  '5x5': [20, 30, 35, 24, 15],
  '5x6': [25, 35, 36, 24],
  '5x7': [30, 40, 45, 25],
  '5x8': [35, 45, 48, 32],
  '5x9': [40, 54, 35, 55],
  '5x10': [45, 55, 60, 40],
  '5x11': [50, 60, 45, 65],
  '5x12': [55, 65, 72, 48],
  // 6× row
  '6x6': [30, 42, 35, 48],
  '6x7': [36, 48, 49, 35],
  '6x8': [42, 54, 56, 40],
  '6x9': [48, 60, 63, 45, 56],
  '6x10': [54, 66, 70, 50],
  '6x11': [60, 72, 77, 55],
  '6x12': [66, 78, 84, 60],
  // 7× row
  '7x7': [42, 56, 48, 63, 35],
  '7x8': [54, 63, 48, 64, 65],
  '7x9': [56, 54, 72, 49, 81],
  '7x10': [63, 77, 80, 60],
  '7x11': [70, 84, 63, 91],
  '7x12': [77, 91, 96, 72],
  // 8× row
  '8x8': [56, 72, 63, 48],
  '8x9': [64, 80, 81, 63],
  '8x10': [72, 88, 90, 70],
  '8x11': [80, 96, 99, 77],
  '8x12': [88, 104, 108, 84],
  // 9× row
  '9x9': [72, 90, 63, 99],
  '9x10': [81, 99, 100, 80],
  '9x11': [90, 108, 81, 121],
  '9x12': [99, 117, 120, 96],
  // 10× row
  '10x10': [90, 110, 99, 120],
  '10x11': [100, 120, 121, 99],
  '10x12': [110, 130, 132, 108],
  // 11× row
  '11x11': [110, 132, 111, 99],
  '11x12': [121, 144, 120, 122],
  // 12× row
  '12x12': [132, 121, 156, 124],
};

/** Canonical fact key: smaller factor first, matching the table above. */
const factKey = (a: number, b: number): string =>
  a <= b ? `${a}x${b}` : `${b}x${a}`;

/** Item id + prompt mirror the presented order: "7 × 12" → id "7x12". */
const ttItem = (a: number, b: number): LearnItem<string, number> => ({
  id: `${a}x${b}`,
  prompt: `${a} × ${b}`,
  answer: a * b,
});

const ttDistractorSet = (item: LearnItem<string, number>): LearnDistractorSet<number> => {
  const [a, b] = item.id.split('x').map(Number);
  return { itemId: item.id, distractors: TT_FACT_DISTRACTORS[factKey(a, b)] };
};

/** Single-row enumeration: row-first presentation, N×2 … N×12 (11 items). */
const rowItems = (row: number): LearnItem<string, number>[] =>
  TT_FACTORS.map(b => ttItem(row, b));

/**
 * Multi-row enumeration: row-major over `rows` ascending, second factor
 * ascending, commutative dupes skipped, each fact presented
 * larger-factor-first (Drill canonical order).
 */
const multiRowItems = (rows: number[]): LearnItem<string, number>[] => {
  const seen = new Set<string>();
  const items: LearnItem<string, number>[] = [];
  for (const a of [...rows].sort((x, y) => x - y)) {
    for (const b of TT_FACTORS) {
      const key = factKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(a >= b ? ttItem(a, b) : ttItem(b, a));
    }
  }
  return items;
};

const ttScopeLabel = (scopeId: string): string => {
  const topic = DRILL_TOPIC_REGISTRY.find(t => t.id === 'times_tables');
  const scope = topic?.scopes?.find(s => s.id === scopeId);
  if (!scope) throw new Error(`Unknown times_tables scope: ${scopeId}`);
  return scope.label;
};

const ttModule = (
  scopeId: string,
  items: LearnItem<string, number>[]
): LearnModuleDef<string, number> => ({
  id: mathmogLearnModuleId('times_tables', scopeId),
  label: ttScopeLabel(scopeId),
  items,
  distractorSets: items.map(ttDistractorSet),
});

/**
 * One Learn module per registry scope (design doc §6.5: every finite
 * Memorize fact set; the scope and the module are the same content unit
 * viewed two ways). A test pins this list against the registry so a new
 * scope can't ship without its module decision.
 */
export const TIMES_TABLES_LEARN_MODULES: LearnModuleDef<string, number>[] = [
  ttModule('tt_full', multiRowItems([...TT_FACTORS])),
  ttModule('tt_easy', multiRowItems([2, 5, 10])),
  ttModule('tt_2_5', multiRowItems([2, 3, 4, 5])),
  ttModule('tt_6_9', multiRowItems([6, 7, 8, 9])),
  ttModule('tt_10_12', multiRowItems([10, 11, 12])),
  ttModule('tt_just_6', rowItems(6)),
  ttModule('tt_just_7', rowItems(7)),
  ttModule('tt_just_8', rowItems(8)),
  ttModule('tt_just_9', rowItems(9)),
];
