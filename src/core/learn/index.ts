// @peakprep/mathmog/core/learn — barrel (Phase 2A.1).

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
} from './types';

export {
  LEARN_TIER_LADDER,
  RECOGNIZE_OPTION_COUNT,
  INITIAL_LEARN_TIER,
} from './types';

export {
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
} from './helpers';

export type {
  LearnSessionConfig,
  LearnRoundTrace,
  LearnSessionState,
  LearnSessionPhase,
  LearnSessionEvent,
  LearnActionResult,
} from './machine';

export {
  createLearnSession,
  currentLearnItemId,
  getLearnItemState,
  learnSessionPhase,
  applyLearnAnswer,
  applyLearnSeen,
  startNextLearnRound,
} from './machine';

export {
  TIMES_TABLES_LEARN_MODULES,
  PERFECT_SQUARES_LEARN_MODULES,
  PERFECT_CUBES_LEARN_MODULES,
  FRACTION_CONVERSIONS_LEARN_MODULES,
  FRACTION_ACCEPTED_DECIMALS,
  MATHMOG_LEARN_MODULES,
} from './modules';

export type { AcquiredModulePredicate, MathmogOffer } from './offers';

export {
  resolveLearnNextModule,
  validateLearnAdjacency,
  mathmogLearnCompletionOffers,
} from './offers';

export type { MemorizeLearnTopic } from './mathmog-binding';

export {
  MATHMOG_LEARN_CONFIG,
  MEMORIZE_LEARN_TOPICS,
  mathmogLearnModuleId,
  parseMathmogLearnModuleId,
} from './mathmog-binding';
