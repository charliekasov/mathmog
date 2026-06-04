export type DrillTopic =
  | 'times_tables'
  | 'perfect_squares'
  | 'perfect_cubes'
  | 'fraction_conversions'
  | 'advanced_squares'
  | 'advanced_cubes'
  | 'higher_powers'
  | 'common_multiples'
  | 'multiplication_estimation'
  | 'root_estimation'
  | 'fraction_estimation'
  | 'percentage_calculations'
  | 'strategic_mul_div'
  | 'divisibility_3_6_9'
  | 'divisibility_4_8'
  | 'divisibility_7';

// A scope is an optional narrowing of a topic's problem-generation pool.
// Sibling to Topic and Difficulty in the curriculum model (Skill → Topic →
// Scope → Difficulty → Mode). Per DESIGN-mathmog-curriculum.md §3.1, a scope
// is not a lesson and has no completion state — it is a knob that says "for
// the next batch of problems, narrow the generator's input space."
//
// The generator-side predicate is NOT stored here: each topic-specific
// generator interprets its own scope id. The registry stores only the
// user-facing scope definition.
//
// `widerThan` and `narrowerThan` are adjacency rails scaffolded for Phase 3's
// progression loop (DESIGN doc §3.6). They list the scope ids of the
// neighboring scopes that a "want to widen / narrow?" offer should target
// when the student scores high / low on a Drill. Phase 1.1 ships these rails
// with no consumer; Phase 3 reads them.
export interface ScopeDef {
  id: string;
  label: string;
  description?: string;
  widerThan?: string[];
  narrowerThan?: string[];
}

export interface DrillTopicInfo {
  id: DrillTopic;
  label: string;
  level: number;
  hasDifficulty: boolean;
  description: string;
  scopes?: ScopeDef[];
}

// Scope sets for the four v1 scoped Memorize topics. Per DESIGN doc §3.3
// (curriculum) — denominator-family split for fractions, base-range split for
// squares / cubes, row-based split for times tables.
//
// Naming: `<topic-prefix>_<scope-suffix>` (snake_case) — matches the existing
// topic-id convention. The id is the wire format that URLs and assign-homework
// will carry; the label is the user-facing string.

// Phase 1.2 — Times Tables (curriculum §2.1, §3.3). Tiered ranges plus a
// per-row singleton for each "actually-hard" row (6× through 9×). The
// singleton scopes are pedagogically distinct from the multi-row scopes: their
// generator preserves "N × b" presentation order so the student picking
// "Just the 7× table" sees the 7× row consistently. See math-problems.ts
// `generateTimesTablesProblem_targeted` for the implementation.
const SCOPES_TIMES_TABLES: ScopeDef[] = [
  { id: 'tt_full', label: 'Full (2× through 12×)', narrowerThan: ['tt_6_9'] },
  { id: 'tt_easy', label: 'The easy ones (2×, 5×, 10×)', widerThan: ['tt_2_5'] },
  { id: 'tt_2_5', label: '2× through 5×', widerThan: ['tt_full'], narrowerThan: ['tt_easy'] },
  { id: 'tt_6_9', label: '6× through 9×', widerThan: ['tt_full'], narrowerThan: ['tt_just_7'] },
  { id: 'tt_10_12', label: '10× through 12×', widerThan: ['tt_full'] },
  { id: 'tt_just_6', label: 'Just the 6× table', widerThan: ['tt_6_9'] },
  { id: 'tt_just_7', label: 'Just the 7× table', widerThan: ['tt_6_9'] },
  { id: 'tt_just_8', label: 'Just the 8× table', widerThan: ['tt_6_9'] },
  { id: 'tt_just_9', label: 'Just the 9× table', widerThan: ['tt_6_9'] },
];

const SCOPES_PERFECT_SQUARES: ScopeDef[] = [
  { id: 'squares_full', label: 'Full (1² through 20²)', narrowerThan: ['squares_1_10'] },
  { id: 'squares_1_5', label: '1² through 5²', widerThan: ['squares_1_10'] },
  { id: 'squares_1_10', label: '1² through 10²', widerThan: ['squares_full'], narrowerThan: ['squares_1_5'] },
  { id: 'squares_11_15', label: '11² through 15²', widerThan: ['squares_11_20'] },
  { id: 'squares_11_20', label: '11² through 20²', widerThan: ['squares_full'], narrowerThan: ['squares_11_15'] },
  { id: 'squares_16_20', label: '16² through 20²', widerThan: ['squares_11_20'] },
];

const SCOPES_PERFECT_CUBES: ScopeDef[] = [
  { id: 'cubes_full', label: 'Full (1³ through 10³)', narrowerThan: ['cubes_1_5'] },
  { id: 'cubes_1_3', label: '1³ through 3³', widerThan: ['cubes_1_5'] },
  { id: 'cubes_1_5', label: '1³ through 5³', widerThan: ['cubes_full'], narrowerThan: ['cubes_1_3'] },
  { id: 'cubes_6_10', label: '6³ through 10³', widerThan: ['cubes_full'] },
];

const SCOPES_FRACTION_CONVERSIONS: ScopeDef[] = [
  { id: 'fractions_full', label: 'Full (all denominators)', narrowerThan: ['fractions_friendly'] },
  { id: 'fractions_friendly', label: 'The friendly ones (halves, fourths, fifths)', widerThan: ['fractions_full'], narrowerThan: ['fractions_halves_fourths'] },
  { id: 'fractions_halves_fourths', label: 'Halves and fourths (1/2, 1/4, 3/4)', widerThan: ['fractions_friendly'] },
  { id: 'fractions_fifths', label: 'Fifths (1/5, 2/5, 3/5, 4/5)', widerThan: ['fractions_friendly'] },
  { id: 'fractions_eighths', label: 'Eighths (1/8, 3/8, 5/8, 7/8)', widerThan: ['fractions_full'] },
  { id: 'fractions_thirds', label: 'Thirds (1/3, 2/3)', widerThan: ['fractions_full'] },
  { id: 'fractions_sixths', label: 'Sixths (1/6, 5/6)', widerThan: ['fractions_full'] },
  { id: 'fractions_sevenths', label: 'Sevenths (1/7 … 6/7)', widerThan: ['fractions_full'] },
  { id: 'fractions_ninths', label: 'Ninths (1/9 … 8/9)', widerThan: ['fractions_full'] },
];

export const DRILL_TOPIC_REGISTRY: DrillTopicInfo[] = [
  // Level 1: Memorize
  { id: 'times_tables', label: 'Times Tables', level: 1, hasDifficulty: false, description: 'Single-digit multiplication facts (2× through 12×)', scopes: SCOPES_TIMES_TABLES },
  { id: 'perfect_squares', label: 'Perfect Squares (1-20)', level: 1, hasDifficulty: false, description: 'Squares of numbers 1 through 20', scopes: SCOPES_PERFECT_SQUARES },
  { id: 'perfect_cubes', label: 'Perfect Cubes (1-10)', level: 1, hasDifficulty: false, description: 'Cubes of numbers 1 through 10', scopes: SCOPES_PERFECT_CUBES },
  { id: 'fraction_conversions', label: 'Fraction Conversions', level: 1, hasDifficulty: false, description: 'All denominators (3-9), all conversion types', scopes: SCOPES_FRACTION_CONVERSIONS },
  { id: 'advanced_squares', label: 'Advanced Squares', level: 1, hasDifficulty: false, description: 'Squares of 10, 20, 30...100' },
  { id: 'advanced_cubes', label: 'Advanced Cubes', level: 1, hasDifficulty: false, description: 'Cubes of 10, 20, 30...100' },
  { id: 'higher_powers', label: 'Higher Powers', level: 1, hasDifficulty: false, description: '2^4-2^9, 3^4-3^6, 4^4, 5^4, 6^4' },
  { id: 'common_multiples', label: 'Common Multiples', level: 1, hasDifficulty: false, description: '13-36 times various multipliers' },

  // Level 2: Estimate
  { id: 'multiplication_estimation', label: 'Multiplication Estimation', level: 2, hasDifficulty: true, description: 'Estimate products of multi-digit numbers' },
  { id: 'root_estimation', label: 'Root Estimation', level: 2, hasDifficulty: true, description: 'Square roots, cube roots, and higher roots at Hard' },
  { id: 'fraction_estimation', label: 'Fraction Estimation', level: 2, hasDifficulty: true, description: 'Estimate fraction values with 2-digit or 3-digit denominators' },
  { id: 'percentage_calculations', label: 'Percentage Calculations', level: 2, hasDifficulty: true, description: 'Round, complex, or arbitrary number percentages' },

  // Level 3: Get Crafty
  { id: 'strategic_mul_div', label: 'Strategic Mult & Division', level: 3, hasDifficulty: true, description: 'Multiply/divide by 4, 5, 8, 9, 11, 12, 15, 25, 19, 99; squaring X5; complementary' },
  { id: 'divisibility_3_6_9', label: 'Divisibility by 3, 6, 9', level: 3, hasDifficulty: true, description: 'Digit-sum divisibility rules' },
  { id: 'divisibility_4_8', label: 'Divisibility by 4, 8', level: 3, hasDifficulty: true, description: 'Last-digits and halving rules' },
  { id: 'divisibility_7', label: 'Advanced Divisibility (7, 11)', level: 3, hasDifficulty: true, description: 'Multiply-last-digit method (7); alternating digit sum (11)' },
];

export function getTopicsForLevel(level: number): DrillTopicInfo[] {
  return DRILL_TOPIC_REGISTRY.filter(t => t.level === level).map(t => ({ ...t }));
}

export function getTopicInfo(topicId: string): DrillTopicInfo | undefined {
  const found = DRILL_TOPIC_REGISTRY.find(t => t.id === topicId);
  return found ? { ...found } : undefined;
}

export function topicHasDifficulty(topicId: string): boolean {
  const topic = DRILL_TOPIC_REGISTRY.find(t => t.id === topicId);
  return topic ? topic.hasDifficulty : false;
}
