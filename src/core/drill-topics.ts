export type DrillTopic =
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

export interface DrillTopicInfo {
  id: DrillTopic;
  label: string;
  level: number;
  hasDifficulty: boolean;
  description: string;
}

export const DRILL_TOPIC_REGISTRY: DrillTopicInfo[] = [
  // Level 1: Memorize
  { id: 'perfect_squares', label: 'Perfect Squares (1-20)', level: 1, hasDifficulty: false, description: 'Squares of numbers 1 through 20' },
  { id: 'perfect_cubes', label: 'Perfect Cubes (1-10)', level: 1, hasDifficulty: false, description: 'Cubes of numbers 1 through 10' },
  { id: 'fraction_conversions', label: 'Fraction Conversions', level: 1, hasDifficulty: false, description: 'All denominators (3-9), all conversion types' },
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
