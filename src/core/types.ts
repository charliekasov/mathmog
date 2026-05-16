// Mathmog types for mental math trainer

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  question: string | string[];
  answer: any;
  type: string;
  explanation: string;
  inputType: 'number' | 'text' | 'buttons' | 'multi-text';
  options?: string[];
  /**
   * Maximum acceptable relative deviation for estimation problems (e.g. 0.20
   * = 20% off still counts as correct). Read by the estimation branch of the
   * answer validator in `react/contexts/problem.tsx`. Falls back to 0.10
   * (10%) when omitted. Has no effect on non-estimation problems.
   */
  tolerance?: number;
  placeholder?: string;
}

export interface SpeedChallengeState {
  enabled: boolean;
  duration: number; // in minutes
  timeLeft: number; // in seconds
  isActive: boolean;
  /**
   * Tagged "challenge-ended" signal. Truthy iff the round timer ran out;
   * cleared back to null when the next round starts or the user resets.
   * Does NOT carry the score — read the live score from the problem
   * context (`useProblem().score`).
   */
  results: { ended: true } | null;
}

export interface PendingLevelUp {
  action: 'changeDifficulty' | 'trySpeedChallenge';
  from?: Difficulty;
  to?: Difficulty;
  emojis: string;
  title: string;
  allCapsTitle?: string;
  subtitle: string;
  options: {
    yes: string;
    no: string;
  };
}

export interface AdaptiveData {
  consecutiveCorrect: number;
  currentAdaptiveLevel: Difficulty | null;
  pendingLevelUp: PendingLevelUp | null;
  // True when the current streak has been earned with no scaffolding
  // (no Skip / Show me / Reference open during the run). Used by the
  // trainer to decide whether to surface the level-up dialog in
  // Free Play — tainted streaks silently decline so progression isn't
  // driven by scaffolded answers. Resets to `true` at every site where
  // `consecutiveCorrect` resets to 0; flipped to `false` (one-way within
  // a streak) by the trainer's taintStreak callback.
  streakPure: boolean;
}
