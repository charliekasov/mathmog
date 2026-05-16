type Difficulty = 'Easy' | 'Medium' | 'Hard';
interface Problem {
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
interface SpeedChallengeState {
    enabled: boolean;
    duration: number;
    timeLeft: number;
    isActive: boolean;
    results: {
        correct: number;
        total: number;
    } | null;
}
interface PendingLevelUp {
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
interface AdaptiveData {
    consecutiveCorrect: number;
    currentAdaptiveLevel: Difficulty | null;
    pendingLevelUp: PendingLevelUp | null;
    streakPure: boolean;
}

type MissedMathmogProblemKind = 'root-estimation' | 'fraction' | 'estimation' | 'multi-text' | 'number' | 'default';
interface MissedMathmogProblem {
    prompt: string;
    correctAnswer: string;
    studentAnswer: string;
    deviationPercent?: number;
    validationKind?: MissedMathmogProblemKind;
    correctAnswerNumeric?: number;
    explanation?: string;
}

export type { AdaptiveData as A, Difficulty as D, MissedMathmogProblem as M, PendingLevelUp as P, SpeedChallengeState as S, MissedMathmogProblemKind as a, Problem as b };
