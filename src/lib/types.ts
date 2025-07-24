export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Mode = 'practice' | 'study';

export interface Problem {
  question: string | string[];
  answer: any;
  type: string;
  explanation: string;
  inputType: 'number' | 'text' | 'buttons' | 'multi-text';
  options?: string[];
  tolerance?: number;
  placeholder?: string;
}

export interface SpeedChallengeState {
  enabled: boolean;
  duration: number; // in minutes
  timeLeft: number; // in seconds
  isActive: boolean;
  results: { correct: number; total: number } | null;
}

export interface PendingLevelUp {
  from: Difficulty;
  to: Difficulty;
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
  hardModeBonus: number;
  pendingLevelUp: PendingLevelUp | null;
}
