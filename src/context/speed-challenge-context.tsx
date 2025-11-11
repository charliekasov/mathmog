"use client";

import { createContext, useState, useCallback, useContext, useEffect, useRef, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { SpeedChallengeState } from '@/lib/types';

interface SpeedChallengeContextType {
  speedChallenge: SpeedChallengeState;
  setSpeedChallenge: Dispatch<SetStateAction<SpeedChallengeState>>;
  handleStartSpeedChallenge: () => void;
  clearSpeedChallengeResults: () => void;
}

const SpeedChallengeContext = createContext<SpeedChallengeContextType | undefined>(undefined);

export const SpeedChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [speedChallenge, setSpeedChallenge] = useState<SpeedChallengeState>({
    enabled: false,
    duration: 2,
    timeLeft: 0,
    isActive: false,
    results: null
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartSpeedChallenge = useCallback(() => {
    setSpeedChallenge(prev => ({
      ...prev,
      isActive: true,
      timeLeft: prev.duration * 60,
      results: null
    }));
  }, []);

  const clearSpeedChallengeResults = useCallback(() => {
    setSpeedChallenge(prev => ({ ...prev, results: null }));
  }, []);

  useEffect(() => {
    if (speedChallenge.isActive && speedChallenge.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setSpeedChallenge(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (speedChallenge.timeLeft <= 0 && speedChallenge.isActive) {
      // Challenge ended - just set results to show completion
      // TODO: Re-enable leaderboard submission after refactoring
      setSpeedChallenge(prev => ({ 
        ...prev, 
        isActive: false, 
        results: { 
          correct: 0, // Will be updated by the component that tracks score
          total: 0,
          isNewUser: false
        } 
      }));
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speedChallenge.isActive, speedChallenge.timeLeft]);

  const value = {
    speedChallenge,
    setSpeedChallenge,
    handleStartSpeedChallenge,
    clearSpeedChallengeResults,
  };

  return <SpeedChallengeContext.Provider value={value}>{children}</SpeedChallengeContext.Provider>;
};

export const useSpeedChallenge = () => {
  const context = useContext(SpeedChallengeContext);
  if (context === undefined) {
    throw new Error('useSpeedChallenge must be used within a SpeedChallengeProvider');
  }
  return context;
};