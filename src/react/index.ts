// @peakprep/mathmog/react — providers, hooks, components.

// ── UI primitive bag ──────────────────────────────────────────────────
export type { UIPrimitiveBag } from './ui/primitive-bag';
export { MathmogUIProvider, useMathmogUI } from './ui/provider';

// ── Trainer state (mode / studyTab / darkMode) ────────────────────────
export {
  TrainerStateProvider,
  useTrainerState,
  type TrainerStateContextValue,
} from './contexts/trainer-state';

// ── Problem context ───────────────────────────────────────────────────
export {
  ProblemProvider,
  useProblem,
  type ProblemContextValue,
  type EstimationTier,
} from './contexts/problem';

// ── Speed challenge context ───────────────────────────────────────────
export {
  SpeedChallengeProvider,
  useSpeedChallenge,
  type SpeedChallengeContextValue,
} from './contexts/speed-challenge';

// ── Trainer mode context (Drill / Free Play) ─────────────────────────
export {
  TrainerModeProvider,
  useTrainerMode,
  useTrainerModeOptional,
  type TrainerModeContextValue,
  type TrainerMode,
  type OnSaveSession,
  type SavePracticeSessionPayload,
} from './contexts/trainer-mode';

// ── Composite provider ────────────────────────────────────────────────
export { MathmogTrainerProviders } from './contexts/trainer-providers';

// ── Components ────────────────────────────────────────────────────────
export { ScoreDisplay } from './components/score-display';
export { ElapsedTimer } from './components/elapsed-timer';
export { SpeedChallengeControls } from './components/speed-challenge-controls';
export { TrainerConfigSelector } from './components/trainer-config-selector';
export { SpeedChallengeReadyScreen } from './components/speed-challenge-ready-screen';
export { MissesReviewScreen } from './components/misses-review-screen';
export { LevelUpDialog } from './components/level-up-dialog';
export { ProblemDisplay } from './components/problem-display';
export {
  StudyGuide,
  MemorizeContent,
  EstimateContent,
  CraftyContent,
  DifficultyScalingContent,
  PrintableStudyGuideProvider,
} from './components/study-guide';

// ── Learn mode (Phase 2A.4) ──────────────────────────────────────────
// The session host is the 2B.2 mounting surface; the tier components are
// internal to it and deliberately not exported. `gradeLearnRecall` is
// exported for the 2B.6 per-answer telemetry call sites (the verdict is
// known where it's graded).
export {
  LearnSessionHost,
  type LearnSessionHostProps,
} from './components/learn/learn-session-host';
export {
  gradeLearnRecall,
  acceptedLearnAnswers,
  learnAnswerDisplay,
  learnAnswerRevealDisplay,
  learnModuleTopic,
  type LearnRecallVerdict,
} from './components/learn/grading';
