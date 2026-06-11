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

export type {
  LearnTier,
  QuizzedLearnTier,
  LearnItemStatus,
  LearnItem,
  LearnDistractorSet,
  LearnModuleDef,
  LearnConfig,
  LearnItemState,
  LearnRoundState,
  LearnRoundSummary,
  LearnSessionConfig,
  LearnRoundTrace,
  LearnSessionState,
  LearnSessionPhase,
  LearnSessionEvent,
  LearnActionResult,
  MemorizeLearnTopic,
} from './learn';

export {
  LEARN_TIER_LADDER,
  RECOGNIZE_OPTION_COUNT,
  INITIAL_LEARN_TIER,
  isQuizzedTier,
  escalateTier,
  dropTier,
  createInitialItemState,
  createInitialItemStates,
  applySeen,
  applyCorrectAnswer,
  applyMiss,
  isItemSolid,
  deriveItemStatus,
  solidProgress,
  isModuleComplete,
  assembleRecognizeOptions,
  validateLearnModuleDef,
  isLearnEligibleModule,
  isLearnEligible,
  createLearnSession,
  currentLearnItemId,
  getLearnItemState,
  learnSessionPhase,
  applyLearnAnswer,
  applyLearnSeen,
  startNextLearnRound,
  TIMES_TABLES_LEARN_MODULES,
  PERFECT_SQUARES_LEARN_MODULES,
  PERFECT_CUBES_LEARN_MODULES,
  FRACTION_CONVERSIONS_LEARN_MODULES,
  FRACTION_ACCEPTED_DECIMALS,
  MATHMOG_LEARN_MODULES,
  MATHMOG_LEARN_CONFIG,
  MEMORIZE_LEARN_TOPICS,
  mathmogLearnModuleId,
  parseMathmogLearnModuleId,
} from './learn';

export { cn } from './cn';
