type Difficulty = 'Easy' | 'Medium' | 'Hard';
interface Problem {
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
