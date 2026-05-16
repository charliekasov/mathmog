import { D as Difficulty, b as Problem } from '../miss-types-D3IJmRap.cjs';
export { A as AdaptiveData, M as MissedMathmogProblem, a as MissedMathmogProblemKind, P as PendingLevelUp, S as SpeedChallengeState } from '../miss-types-D3IJmRap.cjs';
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
declare const generateProblem: (level: number, difficulty: Difficulty, history: string[], topic?: string) => Problem;

type DrillTopic = 'perfect_squares' | 'perfect_cubes' | 'fraction_conversions' | 'advanced_squares' | 'advanced_cubes' | 'higher_powers' | 'common_multiples' | 'multiplication_estimation' | 'root_estimation' | 'fraction_estimation' | 'percentage_calculations' | 'strategic_mul_div' | 'divisibility_3_6_9' | 'divisibility_4_8' | 'divisibility_7';
interface DrillTopicInfo {
    id: DrillTopic;
    label: string;
    level: number;
    hasDifficulty: boolean;
    description: string;
}
declare const DRILL_TOPIC_REGISTRY: DrillTopicInfo[];
declare function getTopicsForLevel(level: number): DrillTopicInfo[];
declare function getTopicInfo(topicId: string): DrillTopicInfo | undefined;
declare function topicHasDifficulty(topicId: string): boolean;

declare function cn(...inputs: ClassValue[]): string;

export { DRILL_TOPIC_REGISTRY, Difficulty, type DrillTopic, type DrillTopicInfo, Problem, cn, commonFractionConversions, generateProblem, getTopicInfo, getTopicsForLevel, perfectCubes, perfectFifthPowers, perfectFourthPowers, perfectSquares, simplifyFraction, topicHasDifficulty };
