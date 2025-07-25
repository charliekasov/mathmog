
"use client";

import { createContext, useState, useCallback, useRef, useEffect, useContext, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { generateProblem, simplifyFraction } from '@/lib/math-problems';
import type { Mode, Difficulty, Problem, SpeedChallengeState, AdaptiveData, PendingLevelUp } from '@/lib/types';
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
  handleNewProblem: (level?: number, difficulty?: Difficulty) => void;
  handleLevelDifficultyChange: (level: number, difficulty: Difficulty) => void;
  handleStartSpeedChallenge: () => void;
  handleReset: () => void;
  handleLevelUp: (accept: boolean) => void;
}

const MathTrainerContext = createContext<MathTrainerContextType | undefined>(undefined);

const HISTORY_LIMIT = 10;

export const MathTrainerProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('practice');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Medium');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [problemHistory, setProblemHistory] = useState<string[]>([]);
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

  const handleNewProblem = useCallback((level?: number, difficulty?: Difficulty) => {
    let problemGenerated = false;
    let attempt = 0;
    const levelToUse = level || currentLevel;
    const difficultyToUse = difficulty || currentDifficulty;
    
    while (!problemGenerated && attempt < 10) {
      try {
        const newProblem = generateProblem(levelToUse, difficultyToUse, adaptiveData.hardModeBonus, problemHistory);
        setProblemHistory(prev => {
            const newHistory = [...prev, newProblem.question.toString()];
            if (newHistory.length > HISTORY_LIMIT) {
                return newHistory.slice(newHistory.length - HISTORY_LIMIT);
            }
            return newHistory;
        });
        setCurrentProblem(newProblem);
        problemGenerated = true;
      } catch (error) {
        console.error("Error generating problem, retrying...", error);
        attempt++;
      }
    }
    if (!problemGenerated) {
        toast({ title: "Error", description: "Could not generate a new problem. Please try changing the level or difficulty.", variant: "destructive" });
    }
    
    setUserAnswer('');
    setFeedback('');
    setShowAnswer(false);
  }, [currentLevel, currentDifficulty, adaptiveData.hardModeBonus, problemHistory, toast]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    handleNewProblem(1, 'Medium');
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLevelUpLogic = useCallback((difficulty: Difficulty) => {
      let levelUpData: PendingLevelUp | null = null;
      if (difficulty === 'Easy') {
        levelUpData = {
          from: 'Easy', to: 'Medium',
          emojis: '😋🪏🍳🥞',
          title: "We're all out of easy problems because",
          allCapsTitle: 'YOU JUST ATE THEM FOR BREAKFAST',
          subtitle: "Ready for medium?",
          options: { yes: "sounds delicious", no: "nah I'm good" }
        };
      }
      if (difficulty === 'Medium') {
         levelUpData = {
          from: 'Medium', to: 'Hard',
          emojis: '💪💃🌋',
          title: "This medium world cannot contain you",
          subtitle: "Ready for hard?",
          options: { yes: "Let's ride", no: "This is my safe space" }
        };
      }

      if (levelUpData) {
        setAdaptiveData(prev => ({
          ...prev,
          consecutiveCorrect: 0, // Reset on suggestion
          pendingLevelUp: levelUpData,
        }));
      }
    }, []);
  
  useEffect(() => {
    if (adaptiveData.consecutiveCorrect >= 7 && !speedChallenge.isActive && !adaptiveData.pendingLevelUp) {
      if (currentDifficulty === 'Hard') {
          setAdaptiveData(prev => ({
            ...prev,
            consecutiveCorrect: 0, // Reset on bonus
            hardModeBonus: (prev.hardModeBonus || 0) + 1,
          }));
          toast({
            title: "🔥 Hard Mode Bonus!",
            description: "Difficulty increased slightly. You're on fire!",
          });
      } else {
        handleLevelUpLogic(currentDifficulty);
      }
    }
  }, [adaptiveData.consecutiveCorrect, currentDifficulty, speedChallenge.isActive, adaptiveData.pendingLevelUp, handleLevelUpLogic, toast]);

  const handleCheckAnswer = useCallback(async (answerToCheck: string) => {
    if (!currentProblem || feedback !== '') return;
    
    if (currentProblem.inputType === 'buttons') {
      setUserAnswer(answerToCheck);
    }
    
    if (answerToCheck.trim() === '') return;

    let isCorrect = false;

    if (currentProblem.type.includes('Estimation')) {
      const userValue = parseFloat(answerToCheck);
      if (isNaN(userValue)) {
        setFeedback(`❌ Incorrect. Please enter a valid number.`);
        setShowAnswer(true);
      } else {
        const exactAnswer = currentProblem.answer;
        const deviation = Math.abs((userValue - exactAnswer) / exactAnswer) * 100;
        
        if (deviation <= 2) {
          setFeedback(`✅ 👁️ Are you, like, psychic?! You were within 2% of the exact answer!`);
          isCorrect = true;
        } else if (deviation <= 10) {
          setFeedback(`✅ Correct! You were within ${deviation.toFixed(0)}% of the exact answer.`);
          isCorrect = true;
        } else if (deviation <= 20) {
          setFeedback(`✅ Close! You were within ${deviation.toFixed(0)}% of the exact answer.`);
          isCorrect = true; // Still counts as correct
        } else {
          setFeedback(`❌ Not quite. You were off by ${deviation.toFixed(0)}%.`);
        }
        setShowAnswer(true);
      }

    } else if (currentProblem.inputType === 'multi-text') {
        const cleanedAnswer = answerToCheck.replace(/\s/g, '');
        isCorrect = cleanedAnswer === currentProblem.answer;
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Not quite. The exact answer is ${currentProblem.answer}`);
        if(!isCorrect) setShowAnswer(true);

    } else if (currentProblem.type.includes('Root Estimation')) {
        const cleanedAnswer = answerToCheck.replace(/\s/g, '');
        isCorrect = cleanedAnswer === currentProblem.answer;
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Incorrect. The correct answer is ${currentProblem.answer}`);
        if(!isCorrect) setShowAnswer(true);

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
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Incorrect. The correct answer is ${currentProblem.answer}`);
        if(!isCorrect) setShowAnswer(true);
    } else if (currentProblem.inputType === 'buttons') {
        isCorrect = answerToCheck.toLowerCase().trim() === currentProblem.answer.toString().toLowerCase();
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Incorrect. The correct answer is ${currentProblem.answer}`);
        if(!isCorrect) setShowAnswer(true);
    } else {
        const userValue = parseFloat(answerToCheck);
        if (!isNaN(userValue)) {
            const tolerance = currentProblem.tolerance || 0.001;
            isCorrect = Math.abs(userValue - currentProblem.answer) <= tolerance;
        }
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Incorrect. The correct answer is ${currentProblem.answer}`);
        if(!isCorrect) setShowAnswer(true);
    }

    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));

      if (speedChallenge.isActive) {
        setTimeout(() => handleNewProblem(), 500);
      } else {
        setAdaptiveData(prev => ({
          ...prev, 
          consecutiveCorrect: prev.consecutiveCorrect + 1 
        }));
      }
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
      setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: 0 }));
    }
  }, [currentProblem, speedChallenge.isActive, handleNewProblem, feedback]);


  const handleLevelDifficultyChange = useCallback((level: number, difficulty: Difficulty) => {
    setCurrentLevel(level);
    setCurrentDifficulty(difficulty);
    setProblemHistory([]);
    setAdaptiveData({ consecutiveCorrect: 0, currentAdaptiveLevel: null, hardModeBonus: 0, pendingLevelUp: null });
    setScore({ correct: 0, total: 0 });
    handleNewProblem(level, difficulty);
  }, [handleNewProblem]);

  const handleLevelUp = useCallback((accept: boolean) => {
    if (accept && adaptiveData.pendingLevelUp) {
      const { to } = adaptiveData.pendingLevelUp;
      handleLevelDifficultyChange(currentLevel, to);
      setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, currentAdaptiveLevel: to }));
      toast({ title: `Difficulty set to ${to}!` });
    } else {
      setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0 }));
    }
  }, [adaptiveData.pendingLevelUp, toast, handleLevelDifficultyChange, currentLevel]);

  const handleStartSpeedChallenge = useCallback(() => {
    setSpeedChallenge(prev => ({ ...prev, isActive: true, timeLeft: prev.duration * 60, results: null }));
    setProblemHistory([]);
    setScore({ correct: 0, total: 0 });
    setFeedback('');
    setShowAnswer(false);
    handleNewProblem();
  }, [handleNewProblem]);
  
  const handleReset = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setProblemHistory([]);
    setAdaptiveData({ consecutiveCorrect: 0, currentAdaptiveLevel: null, hardModeBonus: 0, pendingLevelUp: null });
    handleNewProblem();
  }, [handleNewProblem]);

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

    