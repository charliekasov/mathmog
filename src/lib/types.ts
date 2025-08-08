export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Mode = 'practice' | 'study' | 'leaderboard';

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
}

export interface LeaderboardScore {
    id?: string;
    userId: string;
    name: string;
    score: number;
    level: number;
    difficulty: Difficulty;
    duration: number; // in minutes
    createdAt: Date;
    isCurrentUser?: boolean;
}

export interface LeaderboardUser {
    id?: string;
    secret: string;
    name: string;
    createdAt: Date;
}

export interface LeaderboardData {
    scores: LeaderboardScore[];
    user: { id: string; name: string } | null;
    userScore: { score: number; rank: number } | null;
}
