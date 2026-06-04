// @peakprep/mathmog/core — pure-logic surface (no React).

export type {
  Difficulty,
  Problem,
  SpeedChallengeState,
  PendingLevelUp,
  AdaptiveData,
} from './types';

export type {
  MissedMathmogProblem,
  MissedMathmogProblemKind,
} from './miss-types';

export {
  simplifyFraction,
  commonFractionConversions,
  perfectSquares,
  perfectCubes,
  perfectFourthPowers,
  perfectFifthPowers,
  generateProblem,
} from './math-problems';

export type {
  DrillTopic,
  DrillTopicInfo,
  ScopeDef,
} from './drill-topics';

export {
  DRILL_TOPIC_REGISTRY,
  getTopicsForLevel,
  getTopicInfo,
  topicHasDifficulty,
} from './drill-topics';

export { cn } from './cn';
