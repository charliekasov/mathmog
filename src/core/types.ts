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
   * NOTE: this field is currently unused at validation time — the answer
   * validator in `problem-context.tsx` uses fixed tolerances per validation
   * branch (e.g. 0.0001 absolute for floats, 10% relative for estimations)
   * rather than reading `tolerance`. Kept on the type for backwards-compat
   * with generators that set it; either wire or drop in a follow-up PR.
   */
  tolerance?: number;
  placeholder?: string;
}

export interface SpeedChallengeState {
  enabled: boolean;
  duration: number; // in minutes
  timeLeft: number; // in seconds
  isActive: boolean;
  results: {
    correct: number;
    total: number;
  } | null;
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
