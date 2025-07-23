"use client";

import { createContext, useState, useCallback, useRef, useEffect, useContext, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { generateProblem, simplifyFraction } from '@/lib/math-problems';
import type { Mode, Difficulty, Problem, SpeedChallengeState, AdaptiveData, PendingLevelUp } from '@/lib/types';
import { getAdaptiveLevelUpSuggestion } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface MathTrainerContextType {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  currentLevel: number;
  currentDifficulty: Difficulty;
  currentProblem: Problem | null;
  userAnswer: string;
  setUserAnswer: Dispatch<SetStateAction<string>>;
  feedback: string;
  score: { correct: number; total: number };
  showAnswer: boolean;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  adaptiveData: AdaptiveData;
  speedChallenge: SpeedChallengeState;
  setSpeedChallenge: Dispatch<SetStateAction<SpeedChallengeState>>;
  handleCheckAnswer: (answerToCheck: string) => void;
  handleNewProblem: () => void;
  handleLevelDifficultyChange: (level: number, difficulty: Difficulty) => void;
  handleStartSpeedChallenge: () => void;
  handleReset: () => void;
  handleLevelUp: (accept: boolean) => void;
}

const MathTrainerContext = createContext<MathTrainerContextType | undefined>(undefined);

export const MathTrainerProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('practice');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Medium');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveData>({
    consecutiveCorrect: 0,
    currentAdaptiveLevel: null,
    hardModeBonus: 0,
    pendingLevelUp: null,
  });
  const [speedChallenge, setSpeedChallenge] = useState<SpeedChallengeState>({
    enabled: false,
    duration: 2,
    timeLeft: 120,
    isActive: false,
    results: null,
  });

  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNewProblem = useCallback(() => {
    setCurrentProblem(generateProblem(currentLevel, currentDifficulty, adaptiveData.hardModeBonus));
    setUserAnswer('');
    setFeedback('');
    setShowAnswer(false);
  }, [currentLevel, currentDifficulty, adaptiveData.hardModeBonus]);

  const handleCheckAnswer = useCallback(async (answerToCheck: string) => {
    if (!currentProblem || answerToCheck.trim() === '') return;
    let isCorrect = false;

    if (currentProblem.type.includes('Root Estimation')) {
        const cleanedAnswer = answerToCheck.replace(/\s/g, '');
        isCorrect = cleanedAnswer === currentProblem.answer;
    } else if (currentProblem.inputType === 'text' && typeof currentProblem.answer === 'string' && currentProblem.answer.includes('/')) {
        try {
            const parts = answerToCheck.split('/');
            if (parts.length === 2) {
                const num = parseInt(parts[0].trim(), 10);
                const den = parseInt(parts[1].trim(), 10);
                if (!isNaN(num) && !isNaN(den) && den !== 0) {
                    const simplifiedUserAnswer = simplifyFraction(num, den);
                    isCorrect = simplifiedUserAnswer === currentProblem.answer;
                }
            }
        } catch (e) { isCorrect = false; }
    } else if (currentProblem.inputType === 'buttons') {
        isCorrect = answerToCheck.toLowerCase().trim() === currentProblem.answer.toString().toLowerCase();
    } else {
        const userValue = parseFloat(answerToCheck);
        if (!isNaN(userValue)) {
            const tolerance = currentProblem.tolerance || 0.001;
            isCorrect = Math.abs(userValue - currentProblem.answer) <= tolerance;
        }
    }

    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));

    if (isCorrect) {
        setFeedback('✅ Correct!');
        if (speedChallenge.isActive) {
            setTimeout(handleNewProblem, 500);
        } else {
            const newConsecutive = adaptiveData.consecutiveCorrect + 1;
            
            if (currentDifficulty !== 'Hard' && newConsecutive >= 7) {
                 const suggestion = await getAdaptiveLevelUpSuggestion({
                    currentDifficulty: currentDifficulty,
                    consecutiveCorrect: newConsecutive
                });
                
                if (suggestion && suggestion.suggestLevelUp) {
                    setAdaptiveData(prev => ({
                        ...prev,
                        pendingLevelUp: {
                            from: currentDifficulty,
                            to: suggestion.newDifficulty as Difficulty,
                            message: suggestion.reason,
                            options: { yes: "Let's Go!", no: "Not yet." }
                        },
                        consecutiveCorrect: 0
                    }));
                } else {
                     setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: newConsecutive }));
                }

            } else if (currentDifficulty === 'Hard' && newConsecutive >= 7) {
                setAdaptiveData(prev => ({ ...prev, hardModeBonus: (prev.hardModeBonus || 0) + 1, consecutiveCorrect: 0 }));
                 toast({
                    title: "🔥 Hard Mode Bonus!",
                    description: "Difficulty increased slightly. You're on fire!",
                });
            } else {
                setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: newConsecutive }));
            }
        }
    } else {
        setFeedback(`❌ Incorrect. The correct answer is ${currentProblem.answer}`);
        if (!speedChallenge.isActive) { setShowAnswer(true); }
        setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: 0 }));
    }
  }, [currentProblem, speedChallenge.isActive, handleNewProblem, currentDifficulty, adaptiveData, toast]);

  const handleLevelDifficultyChange = useCallback((level: number, difficulty: Difficulty) => {
    setCurrentLevel(level);
    setCurrentDifficulty(difficulty);
    setAdaptiveData({ consecutiveCorrect: 0, currentAdaptiveLevel: null, hardModeBonus: 0, pendingLevelUp: null });
    setScore({ correct: 0, total: 0 });
  }, []);

  const handleLevelUp = useCallback((accept: boolean) => {
    if (accept && adaptiveData.pendingLevelUp) {
      const { to } = adaptiveData.pendingLevelUp;
      setCurrentDifficulty(to);
      setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0, currentAdaptiveLevel: to, hardModeBonus: 0 }));
      toast({ title: `Difficulty set to ${to}!` });
    } else {
      setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0 }));
    }
  }, [adaptiveData.pendingLevelUp, toast]);

  const handleStartSpeedChallenge = useCallback(() => {
    setSpeedChallenge(prev => ({ ...prev, isActive: true, timeLeft: prev.duration * 60, results: null }));
    setScore({ correct: 0, total: 0 });
    setFeedback('');
    setShowAnswer(false);
    handleNewProblem();
  }, [handleNewProblem]);
  
  const handleReset = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setAdaptiveData({ consecutiveCorrect: 0, currentAdaptiveLevel: null, hardModeBonus: 0, pendingLevelUp: null });
    handleNewProblem();
  }, [handleNewProblem]);

  useEffect(() => { handleNewProblem(); }, [currentLevel, currentDifficulty]);

  useEffect(() => {
    if (speedChallenge.isActive && speedChallenge.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setSpeedChallenge(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (speedChallenge.timeLeft <= 0 && speedChallenge.isActive) {
      if(timerRef.current) clearInterval(timerRef.current);
      setSpeedChallenge(prev => ({ ...prev, isActive: false, results: { correct: score.correct, total: score.total } }));
      setCurrentProblem(null);
    }
    return () => {
      if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [speedChallenge.isActive, speedChallenge.timeLeft, score.correct, score.total]);

  const value = {
    mode, setMode, currentLevel, currentDifficulty, currentProblem, userAnswer, setUserAnswer,
    feedback, score, showAnswer, darkMode, setDarkMode, adaptiveData, speedChallenge, setSpeedChallenge,
    handleCheckAnswer, handleNewProblem, handleLevelDifficultyChange, handleStartSpeedChallenge, handleReset, handleLevelUp,
  };

  return <MathTrainerContext.Provider value={value}>{children}</MathTrainerContext.Provider>;
};

export const useMathTrainer = () => {
  const context = useContext(MathTrainerContext);
  if (context === undefined) {
    throw new Error('useMathTrainer must be used within a MathTrainerProvider');
  }
  return context;
};
