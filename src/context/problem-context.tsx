"use client";

import { createContext, useState, useCallback, useContext, useRef, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { generateProblem, simplifyFraction } from '@/lib/math-problems';
import type { Difficulty, Problem, AdaptiveData, PendingLevelUp } from '@/lib/types';

interface ProblemContextType {
  currentLevel: number;
  currentDifficulty: Difficulty;
  currentTopic: string | undefined;
  currentProblem: Problem | null;
  userAnswer: string;
  setUserAnswer: Dispatch<SetStateAction<string>>;
  feedback: string;
  score: { correct: number; total: number };
  showAnswer: boolean;
  adaptiveData: AdaptiveData;
  problemHistory: string[];
  handleCheckAnswer: (answerToCheck: string) => void;
  handleNewProblem: (level?: number, difficulty?: Difficulty, topic?: string) => void;
  handleLevelDifficultyChange: (level: number, difficulty: Difficulty, topic?: string) => void;
  handleReset: () => void;
  handleLevelUp: (accept: boolean) => void;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

const HISTORY_LIMIT = 50;

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Easy');
  const [currentTopic, setCurrentTopic] = useState<string | undefined>(undefined);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [problemHistory, setProblemHistory] = useState<string[]>([]);
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveData>({
    consecutiveCorrect: 0,
    currentAdaptiveLevel: null,
    pendingLevelUp: null
  });

  // Use refs to avoid dependency issues
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
    }
  }, [currentLevel, currentDifficulty]);

  const handleCheckAnswer = useCallback((answerToCheck: string) => {
    if (!currentProblem) return;

    const userAnswerTrimmed = answerToCheck.trim().toLowerCase();
    let isCorrect = false;

    if (currentProblem.type === 'Root Estimation') {
      const answerParts = userAnswerTrimmed.split(',').map(s => s.trim());
      const correctParts = String(currentProblem.answer).split(',').map(s => s.trim().toLowerCase());
      isCorrect = answerParts.length === correctParts.length && 
                  answerParts.every((part, i) => part === correctParts[i]);
    } else if (currentProblem.inputType === 'text' && typeof currentProblem.answer === 'string' && currentProblem.answer.includes('/')) {
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
      const userNum = parseFloat(userAnswerTrimmed);
      if (!isNaN(userNum)) {
        const tolerance = currentProblem.tolerance || 0.2;
        const exactAnswer = currentProblem.answer as number;
        const deviation = exactAnswer === 0 ? Math.abs(userNum) : Math.abs((userNum - exactAnswer) / exactAnswer);
        isCorrect = deviation <= tolerance;
      }
    } else if (currentProblem.inputType === 'multi-text') {
      const possibleAnswers = Array.isArray(currentProblem.answer)
        ? currentProblem.answer.map(a => String(a).toLowerCase())
        : [String(currentProblem.answer).toLowerCase()];
      isCorrect = possibleAnswers.includes(userAnswerTrimmed);
    } else if (currentProblem.inputType === 'number') {
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
      isCorrect = userAnswerTrimmed === String(currentProblem.answer).toLowerCase();
    }

    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(!isCorrect);

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
          
          return {
            ...prev,
            consecutiveCorrect: 0,
            pendingLevelUp: levelUpData
          };
        }
        
        return { ...prev, consecutiveCorrect: newConsecutiveCorrect };
      });
    } else {
      setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: 0 }));
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
      pendingLevelUp: null
    });
    setScore({ correct: 0, total: 0 });
    handleNewProblem(level, difficulty, topic);
  }, [handleNewProblem]);

  const handleReset = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setFeedback('');
    setShowAnswer(false);
    setAdaptiveData({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null
    });
    handleNewProblem();
  }, [handleNewProblem]);

  const handleLevelUp = useCallback((accept: boolean) => {
    if (!adaptiveData.pendingLevelUp) return;

    if (accept) {
      if (adaptiveData.pendingLevelUp.action === 'changeDifficulty' && adaptiveData.pendingLevelUp.to) {
        handleLevelDifficultyChange(currentLevel, adaptiveData.pendingLevelUp.to);
      }
    }

    setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0 }));
  }, [adaptiveData.pendingLevelUp, currentLevel, handleLevelDifficultyChange]);

  const value = {
    currentLevel,
    currentDifficulty,
    currentTopic,
    currentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    score,
    showAnswer,
    adaptiveData,
    problemHistory,
    handleCheckAnswer,
    handleNewProblem,
    handleLevelDifficultyChange,
    handleReset,
    handleLevelUp,
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