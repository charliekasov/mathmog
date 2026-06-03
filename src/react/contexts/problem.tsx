"use client";

import { createContext, useState, useCallback, useContext, useRef, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { generateProblem, simplifyFraction } from '../../core/math-problems';
import type { Difficulty, Problem, AdaptiveData, PendingLevelUp } from '../../core/types';
import type { MissedMathmogProblem, MissedMathmogProblemKind } from '../../core/miss-types';

function formatProblemPrompt(question: Problem['question']): string {
  return Array.isArray(question) ? question.join(' ___ ') : String(question);
}

function formatProblemAnswer(answer: Problem['answer']): string {
  if (Array.isArray(answer)) return answer.map((a) => String(a)).join(' or ');
  return String(answer);
}

// Tiered feedback for estimation problems.
// NOTE: Currently all tiers within 10% count as correct for scoring.
// Future build-out: experiment with restricting which tiers count as correct
// to create harder drills (e.g., only ≤5% or ≤2% counts as correct).
export type EstimationTier = 'exact' | 'within2' | 'within5' | 'within10' | 'outside' | null;

interface ProblemContextValue {
  currentLevel: number;
  currentDifficulty: Difficulty;
  currentTopic: string | undefined;
  currentProblem: Problem | null;
  userAnswer: string;
  setUserAnswer: Dispatch<SetStateAction<string>>;
  feedback: string;
  estimationTier: EstimationTier;
  estimationDeviation: number | null;
  score: { correct: number; total: number };
  showAnswer: boolean;
  adaptiveData: AdaptiveData;
  problemHistory: string[];
  missedProblems: MissedMathmogProblem[];
  handleCheckAnswer: (answerToCheck: string) => void;
  handleNewProblem: (level?: number, difficulty?: Difficulty, topic?: string) => void;
  handleLevelDifficultyChange: (level: number, difficulty: Difficulty, topic?: string) => void;
  handleReset: () => void;
  handleLevelUp: (accept: boolean) => void;
  // Marks the current streak as "tainted" — set to false by callers that
  // consume scaffolding (Show me / Skip / Reference open). One-way ratchet:
  // does NOT reset `consecutiveCorrect`. The streak boundary resets
  // (`streakPure: true`) only happen at the 5 enumerated sites where
  // `consecutiveCorrect` itself resets.
  taintStreak: () => void;
}

const ProblemContext = createContext<ProblemContextValue | undefined>(undefined);

const HISTORY_LIMIT = 50;

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Easy');
  const [currentTopic, setCurrentTopic] = useState<string | undefined>(undefined);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [estimationTier, setEstimationTier] = useState<EstimationTier>(null);
  const [estimationDeviation, setEstimationDeviation] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [problemHistory, setProblemHistory] = useState<string[]>([]);
  const [missedProblems, setMissedProblems] = useState<MissedMathmogProblem[]>([]);
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveData>({
    consecutiveCorrect: 0,
    currentAdaptiveLevel: null,
    pendingLevelUp: null,
    streakPure: true,
  });

  // Use ref to avoid dependency issues
  const problemHistoryRef = useRef<string[]>([]);
  const currentTopicRef = useRef<string | undefined>(undefined);

  // Keep refs in sync
  problemHistoryRef.current = problemHistory;
  currentTopicRef.current = currentTopic;

  const handleNewProblem = useCallback((level?: number, difficulty?: Difficulty, topic?: string) => {
    const targetLevel = level ?? currentLevel;
    const targetDifficulty = difficulty ?? currentDifficulty;
    const targetTopic = topic !== undefined ? topic : currentTopicRef.current;

    try {
      const newProblem = generateProblem(targetLevel, targetDifficulty, problemHistoryRef.current, targetTopic);
      setCurrentProblem(newProblem);
      setUserAnswer('');
      setFeedback('');
      setEstimationTier(null);
      setEstimationDeviation(null);
      setShowAnswer(false);

      setProblemHistory(prev => {
        const newHistory = [...prev, newProblem.question.toString()];
        if (newHistory.length > HISTORY_LIMIT) {
          return newHistory.slice(newHistory.length - HISTORY_LIMIT);
        }
        return newHistory;
      });
    } catch (error) {
      console.error("Error generating problem:", error);
      // Mirror the happy-path resets at the top of the try so a generator
      // throw can't leave the previous problem's feedback / showAnswer /
      // estimation flags on screen. `currentProblem` and `problemHistory`
      // are intentionally not touched (companion test pins that contract).
      setUserAnswer('');
      setFeedback('');
      setEstimationTier(null);
      setEstimationDeviation(null);
      setShowAnswer(false);
    }
  }, [currentLevel, currentDifficulty]); // Removed problemHistory from deps

  const handleCheckAnswer = useCallback((answerToCheck: string) => {
    if (!currentProblem) return;

    const userAnswerTrimmed = answerToCheck.trim().toLowerCase();
    let isCorrect = false;
    let deviationPercent: number | undefined;
    let validationKind: MissedMathmogProblemKind = 'default';
    let correctAnswerNumeric: number | undefined;

    if (currentProblem.type === 'Root Estimation') {
      validationKind = 'root-estimation';
      const answerParts = userAnswerTrimmed.split(',').map(s => s.trim());
      const correctParts = String(currentProblem.answer).split(',').map(s => s.trim().toLowerCase());
      if (answerParts.length === correctParts.length && answerParts.length >= 3) {
        // "Between X and Y" — either order is valid
        const userBetween = [answerParts[0], answerParts[1]].sort();
        const correctBetween = [correctParts[0], correctParts[1]].sort();
        const betweenMatch = userBetween[0] === correctBetween[0] && userBetween[1] === correctBetween[1];
        // "Closer to" must match exactly
        isCorrect = betweenMatch && answerParts[2] === correctParts[2];
      }
    } else if (currentProblem.inputType === 'text' && typeof currentProblem.answer === 'string' && currentProblem.answer.includes('/')) {
      validationKind = 'fraction';
      try {
        const parts = userAnswerTrimmed.split('/');
        if (parts.length === 2) {
          const num = parseInt(parts[0].trim(), 10);
          const den = parseInt(parts[1].trim(), 10);
          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            const simplifiedUserAnswer = simplifyFraction(num, den);
            isCorrect = simplifiedUserAnswer === currentProblem.answer;
          }
        }
      } catch (e) {
        isCorrect = false;
      }
    } else if (currentProblem.type.includes('Estimation')) {
      validationKind = 'estimation';
      const userNum = parseFloat(userAnswerTrimmed);
      if (!isNaN(userNum)) {
        const exactAnswer = currentProblem.answer as number;
        correctAnswerNumeric = exactAnswer;
        const deviation = exactAnswer === 0 ? Math.abs(userNum) : Math.abs((userNum - exactAnswer) / exactAnswer);
        deviationPercent = Math.round(deviation * 1000) / 10; // e.g. 7.3%
        setEstimationDeviation(deviationPercent);

        if (deviation < 0.001) {
          setEstimationTier('exact');
        } else if (deviation <= 0.02) {
          setEstimationTier('within2');
        } else if (deviation <= 0.05) {
          setEstimationTier('within5');
        } else if (deviation <= 0.10) {
          setEstimationTier('within10');
        } else {
          setEstimationTier('outside');
        }

        // Correctness gate: prefer the problem's per-instance tolerance if
        // it's set (multiplication/percentage estimation = 0.20, fraction
        // estimation = 0.25), fall back to 10%. The display tiers above are
        // fixed at 0/2/5/10% — they describe estimate quality, not
        // correctness — so 'outside' can be correct when tolerance > 0.10.
        isCorrect = deviation <= (currentProblem.tolerance ?? 0.10);
      }
    } else if (currentProblem.inputType === 'multi-text') {
      validationKind = 'multi-text';
      const possibleAnswers = Array.isArray(currentProblem.answer)
        ? currentProblem.answer.map(a => String(a).toLowerCase())
        : [String(currentProblem.answer).toLowerCase()];
      isCorrect = possibleAnswers.includes(userAnswerTrimmed);
    } else if (currentProblem.inputType === 'number') {
      validationKind = 'number';
      // Capture the numeric form only when the live answer is a scalar — array
      // answers (repeating decimals) don't have a single canonical number.
      if (!Array.isArray(currentProblem.answer)) {
        const candidate = typeof currentProblem.answer === 'number'
          ? currentProblem.answer
          : parseFloat(String(currentProblem.answer));
        if (!isNaN(candidate)) correctAnswerNumeric = candidate;
      }
      // For number inputs, compare numerically to handle cases like ".2" vs "0.2"
      const userNum = parseFloat(userAnswerTrimmed);
      if (!isNaN(userNum)) {
        // Handle array of acceptable answers (for repeating decimals like 1/3, 1/6)
        if (Array.isArray(currentProblem.answer)) {
          isCorrect = currentProblem.answer.some(acceptableAnswer => {
            const correctNum = typeof acceptableAnswer === 'number'
              ? acceptableAnswer
              : parseFloat(String(acceptableAnswer));
            return !isNaN(correctNum) && Math.abs(userNum - correctNum) < 0.0001;
          });
        } else {
          const correctNum = typeof currentProblem.answer === 'number'
            ? currentProblem.answer
            : parseFloat(String(currentProblem.answer));
          if (!isNaN(correctNum)) {
            // Use small tolerance for floating point comparison
            isCorrect = Math.abs(userNum - correctNum) < 0.0001;
          }
        }
      } else {
        isCorrect = userAnswerTrimmed === String(currentProblem.answer).toLowerCase();
      }
    } else {
      validationKind = 'default';
      isCorrect = userAnswerTrimmed === String(currentProblem.answer).toLowerCase();
    }

    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);

    if (!isCorrect) {
      setMissedProblems(prev => [
        ...prev,
        {
          prompt: formatProblemPrompt(currentProblem.question),
          correctAnswer: formatProblemAnswer(currentProblem.answer),
          studentAnswer: answerToCheck.trim(),
          validationKind,
          ...(deviationPercent !== undefined ? { deviationPercent } : {}),
          ...(correctAnswerNumeric !== undefined ? { correctAnswerNumeric } : {}),
          ...(currentProblem.explanation ? { explanation: currentProblem.explanation } : {}),
        },
      ]);
    }

    if (isCorrect) {
      setAdaptiveData(prev => {
        const newConsecutiveCorrect = prev.consecutiveCorrect + 1;

        if (newConsecutiveCorrect >= 7 && !prev.pendingLevelUp) {
          let levelUpData: PendingLevelUp | null = null;

          if (currentDifficulty === 'Easy') {
            levelUpData = {
              action: 'changeDifficulty',
              from: 'Easy',
              to: 'Medium',
              emojis: '😋🪏🍳🥞',
              title: "We're all out of easy problems because",
              allCapsTitle: 'YOU JUST ATE THEM FOR BREAKFAST',
              subtitle: "Ready for medium?",
              options: { yes: "sounds delicious", no: "nah I'm good" }
            };
          } else if (currentDifficulty === 'Medium') {
            levelUpData = {
              action: 'changeDifficulty',
              from: 'Medium',
              to: 'Hard',
              emojis: '💪💃🌋',
              title: "This medium world cannot contain you",
              subtitle: "Ready for hard?",
              options: { yes: "Let's ride", no: "This is my safe space" }
            };
          } else if (currentDifficulty === 'Hard') {
            levelUpData = {
              action: 'trySpeedChallenge',
              emojis: '🧠🦵🦵🥱',
              title: 'Do your legs hurt from carrying that GIANT BRAIN all day???',
              subtitle: 'Try a speed challenge?',
              options: { yes: 'Feed my speed need', no: 'Lemme practice more (I\'m so scared)' }
            };
          }

          // Streak hits 7 — set pendingLevelUp but PRESERVE the prev
          // streakPure value. The trainer's Free Play suppression effect
          // reads streakPure at this moment to decide whether to silently
          // decline the level-up. handleLevelUp(accept or decline) is the
          // canonical re-purify site for the new streak that follows.
          return {
            ...prev,
            consecutiveCorrect: 0,
            pendingLevelUp: levelUpData,
          };
        }

        return { ...prev, consecutiveCorrect: newConsecutiveCorrect };
      });
    } else {
      // Streak boundary on incorrect — restart pure.
      setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: 0, streakPure: true }));
    }
  }, [currentProblem, currentDifficulty]);

  const handleLevelDifficultyChange = useCallback((level: number, difficulty: Difficulty, topic?: string) => {
    setCurrentLevel(level);
    setCurrentDifficulty(difficulty);
    setCurrentTopic(topic);
    setProblemHistory([]);
    setAdaptiveData({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true,
    });
    setScore({ correct: 0, total: 0 });
    setMissedProblems([]);
    handleNewProblem(level, difficulty, topic);
  }, [handleNewProblem]);

  const handleReset = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setFeedback('');
    setEstimationTier(null);
    setEstimationDeviation(null);
    setShowAnswer(false);
    setAdaptiveData({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true,
    });
    setMissedProblems([]);
    handleNewProblem();
  }, [handleNewProblem]);

  const handleLevelUp = useCallback((accept: boolean) => {
    if (!adaptiveData.pendingLevelUp) return;

    if (accept) {
      if (adaptiveData.pendingLevelUp.action === 'changeDifficulty' && adaptiveData.pendingLevelUp.to) {
        handleLevelDifficultyChange(currentLevel, adaptiveData.pendingLevelUp.to, currentTopic);
      }
    }

    // Streak boundary on accept-or-decline — re-purify.
    setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0, streakPure: true }));
  }, [adaptiveData.pendingLevelUp, currentLevel, currentTopic, handleLevelDifficultyChange]);

  // One-way ratchet within a streak. Safe to call any time — when
  // consecutiveCorrect is already 0 this is a no-op (next reset site will
  // re-set streakPure: true anyway). Uses the functional setState pattern
  // so it doesn't need to close over the latest adaptiveData.
  const taintStreak = useCallback(() => {
    setAdaptiveData(prev => (prev.streakPure ? { ...prev, streakPure: false } : prev));
  }, []);

  const value = {
    currentLevel,
    currentDifficulty,
    currentTopic,
    currentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    estimationTier,
    estimationDeviation,
    score,
    showAnswer,
    adaptiveData,
    problemHistory,
    missedProblems,
    handleCheckAnswer,
    handleNewProblem,
    handleLevelDifficultyChange,
    handleReset,
    handleLevelUp,
    taintStreak,
  };

  return <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>;
}

export function useProblem() {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider');
  }
  return context;
}

export type { ProblemContextValue };
