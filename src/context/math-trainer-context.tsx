
"use client";

import { createContext, useState, useCallback, useRef, useEffect, useContext, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { generateProblem, simplifyFraction } from '@/lib/math-problems';
import type { Mode, Difficulty, Problem, SpeedChallengeState, AdaptiveData, PendingLevelUp, LeaderboardUser } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { submitScore, getLeaderboardData } from '@/ai/flows/leaderboard-flow';
import { v4 as uuidv4 } from 'uuid';

interface MathTrainerContextType {
  isLoading: boolean;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  studyTab: string;
  setStudyTab: Dispatch<SetStateAction<string>>;
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
  user: LeaderboardUser | null;
  handleCheckAnswer: (answerToCheck: string) => void;
  handleNewProblem: (level?: number, difficulty?: Difficulty) => void;
  handleLevelDifficultyChange: (level: number, difficulty: Difficulty) => void;
  handleStartSpeedChallenge: () => void;
  handleReset: () => void;
  handleLevelUp: (accept: boolean) => void;
  refreshLeaderboardData: (user?: LeaderboardUser) => Promise<void>;
}

const getSecret = (): string => {
    if (typeof window === 'undefined') return '';
    let secret = localStorage.getItem('mathmog-secret');
    if (!secret) {
        secret = uuidv4();
        localStorage.setItem('mathmog-secret', secret);
    }
    return secret;
}


const MathTrainerContext = createContext<MathTrainerContextType | undefined>(undefined);

const HISTORY_LIMIT = 10;

export const MathTrainerProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('practice');
  const [studyTab, setStudyTab] = useState('memorize');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Medium');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [problemHistory, setProblemHistory] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [user, setUser] = useState<LeaderboardUser | null>(null);
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveData>({
    consecutiveCorrect: 0,
    currentAdaptiveLevel: null,
    pendingLevelUp: null,
  });
  const [speedChallenge, setSpeedChallenge] = useState<SpeedChallengeState>({
    enabled: false,
    duration: 1,
    timeLeft: 60,
    isActive: false,
    results: null,
  });
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);

  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secret = getSecret();

  const refreshLeaderboardData = useCallback(async (newUser?: LeaderboardUser) => {
    if (newUser) {
      setUser(newUser);
    }
    setLeaderboardVersion(v => v + 1);
  }, []);

  const handleNewProblem = useCallback((level?: number, difficulty?: Difficulty) => {
    setIsLoading(true);
    let problemGenerated = false;
    let attempt = 0;
    const levelToUse = level || currentLevel;
    const difficultyToUse = difficulty || currentDifficulty;
    
    while (!problemGenerated && attempt < 10) {
      try {
        const newProblem = generateProblem(levelToUse, difficultyToUse, problemHistory);
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
    setIsLoading(false);
  }, [currentLevel, currentDifficulty, problemHistory, toast]);

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
          action: 'changeDifficulty',
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
          action: 'changeDifficulty',
          from: 'Medium', to: 'Hard',
          emojis: '💪💃🌋',
          title: "This medium world cannot contain you",
          subtitle: "Ready for hard?",
          options: { yes: "Let's ride", no: "This is my safe space" }
        };
      }
      if (difficulty === 'Hard') {
         levelUpData = {
           action: 'trySpeedChallenge',
           emojis: '🧠🦵🦵🥱',
           title: 'Do your legs hurt from carrying that GIANT BRAIN all day???',
           subtitle: 'Try a speed challenge?',
           options: { yes: 'Feed my speed need', no: 'Lemme practice more (I’m so scared)' },
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
      handleLevelUpLogic(currentDifficulty);
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
        const exactAnswer = currentProblem.answer as number;
        // Handle division by zero for exactAnswer if it can be 0
        const deviation = exactAnswer === 0 ? Math.abs(userValue) : Math.abs((userValue - exactAnswer) / exactAnswer);
        const tolerance = currentProblem.tolerance || 0.2; // Default 20%
        
        if (deviation <= 0.02) { // 2%
          setFeedback(`✅ Are you, like, psychic? 👁️ (You were within ${(deviation * 100).toFixed(0)}% of the exact answer)`);
          isCorrect = true;
        } else if (deviation <= tolerance) {
          setFeedback(`✅ 😬 Close! (you were within ${(deviation * 100).toFixed(0)}% of the exact answer)`);
          isCorrect = true;
        } else {
           const answerDisplay = typeof currentProblem.answer === 'number' ? currentProblem.answer.toFixed(3) : currentProblem.answer;
          setFeedback(`❌ Not quite. (The exact answer is ${answerDisplay})`);
        }
        
        if (!isCorrect) setShowAnswer(true);
      }
    } else if (currentProblem.type.includes('Root Estimation')) {
        const cleanedAnswer = answerToCheck.replace(/\s/g, '');
        isCorrect = cleanedAnswer === currentProblem.answer;
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Incorrect. The correct answer is ${currentProblem.answer}`);
        if(!isCorrect) setShowAnswer(true);

    } else if (currentProblem.inputType === 'multi-text') {
        const cleanedAnswer = answerToCheck.replace(/\s/g, '');
        isCorrect = cleanedAnswer === currentProblem.answer;
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Not quite. The exact answer is ${currentProblem.answer}`);
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
            if (Array.isArray(currentProblem.answer)) {
                isCorrect = currentProblem.answer.some(ans => Math.abs(userValue - ans) <= tolerance);
            } else {
                isCorrect = Math.abs(userValue - (currentProblem.answer as number)) <= tolerance;
            }
        }
        const correctAnswerText = Array.isArray(currentProblem.answer) ? currentProblem.answer.join(' or ') : currentProblem.answer;
        setFeedback(isCorrect ? '✅ Correct!' : `❌ Incorrect. The correct answer is ${correctAnswerText}`);
        if(!isCorrect) setShowAnswer(true);
    }

    setScore(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));
    
    if (speedChallenge.isActive) {
      setTimeout(() => handleNewProblem(), 500);
    } else {
      if (isCorrect) {
        setAdaptiveData(prev => ({
          ...prev, 
          consecutiveCorrect: prev.consecutiveCorrect + 1 
        }));
      } else {
        setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: 0 }));
      }
    }

  }, [currentProblem, speedChallenge.isActive, handleNewProblem, feedback]);


  const handleLevelDifficultyChange = useCallback((level: number, difficulty: Difficulty) => {
    setIsLoading(true);
    setCurrentLevel(level);
    setCurrentDifficulty(difficulty);
    setProblemHistory([]);
    setAdaptiveData({ consecutiveCorrect: 0, currentAdaptiveLevel: null, pendingLevelUp: null });
    setScore({ correct: 0, total: 0 });
    handleNewProblem(level, difficulty);
  }, [handleNewProblem]);

  const handleLevelUp = useCallback((accept: boolean) => {
    const { pendingLevelUp } = adaptiveData;
    if (!pendingLevelUp) return;

    if (accept) {
      if (pendingLevelUp.action === 'changeDifficulty' && pendingLevelUp.to) {
        handleLevelDifficultyChange(currentLevel, pendingLevelUp.to);
        toast({ title: `Difficulty set to ${pendingLevelUp.to}!` });
      } else if (pendingLevelUp.action === 'trySpeedChallenge') {
        setSpeedChallenge(prev => ({ ...prev, enabled: true }));
        toast({ title: "Speed Challenge enabled!", description: "Toggle it on and start the timer when you're ready." });
      }
    }
    
    setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0 }));

  }, [adaptiveData.pendingLevelUp, toast, handleLevelDifficultyChange, currentLevel]);

  const handleStartSpeedChallenge = useCallback(() => {
    setIsLoading(true);
    setSpeedChallenge(prev => ({ ...prev, isActive: true, timeLeft: prev.duration * 60, results: null }));
    setProblemHistory([]);
    setScore({ correct: 0, total: 0 });
    setFeedback('');
    setShowAnswer(false);
    handleNewProblem();
  }, [handleNewProblem]);
  
  const handleReset = useCallback(() => {
    setIsLoading(true);
    setScore({ correct: 0, total: 0 });
    setProblemHistory([]);
    setAdaptiveData({ consecutiveCorrect: 0, currentAdaptiveLevel: null, pendingLevelUp: null });
    handleNewProblem();
  }, [handleNewProblem]);

  useEffect(() => {
    const handleChallengeEnd = async () => {
        if(timerRef.current) clearInterval(timerRef.current);
        setCurrentProblem(null);
        
        let isNewUser = !user;
        
        try {
            const data = await getLeaderboardData({ level: currentLevel, difficulty: currentDifficulty, duration: speedChallenge.duration, secret });
            if (data.user) {
              setUser(data.user);
              isNewUser = false;
            }
            
            if (!isNewUser && score.correct > 0) {
                await submitScore({ level: currentLevel, difficulty: currentDifficulty, score: score.correct, secret, duration: speedChallenge.duration });
                await refreshLeaderboardData();
            }
        } catch (error) {
            console.error("Error checking user status or submitting score", error);
        }

        setSpeedChallenge(prev => ({ 
            ...prev, 
            isActive: false, 
            results: { 
                correct: score.correct, 
                total: score.total,
                isNewUser: isNewUser && score.correct > 0
            } 
        }));
    };

    if (speedChallenge.isActive && speedChallenge.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setSpeedChallenge(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (speedChallenge.timeLeft <= 0 && speedChallenge.isActive) {
      handleChallengeEnd();
    }

    return () => {
      if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [speedChallenge.isActive, speedChallenge.timeLeft, speedChallenge.duration, score, currentLevel, currentDifficulty, secret, refreshLeaderboardData, user]);

  const value = {
    isLoading, mode, setMode, studyTab, setStudyTab, currentLevel, currentDifficulty, currentProblem, userAnswer, setUserAnswer,
    feedback, score, showAnswer, darkMode, setDarkMode, adaptiveData, speedChallenge, setSpeedChallenge, user,
    handleCheckAnswer, handleNewProblem, handleLevelDifficultyChange, handleStartSpeedChallenge, handleReset, handleLevelUp,
    leaderboardVersion, refreshLeaderboardData,
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
