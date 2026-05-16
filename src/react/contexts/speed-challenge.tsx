"use client";

import { createContext, useState, useCallback, useContext, useEffect, useRef, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { SpeedChallengeState } from '../../core/types';

interface SpeedChallengeContextValue {
  speedChallenge: SpeedChallengeState;
  setSpeedChallenge: Dispatch<SetStateAction<SpeedChallengeState>>;
  handleStartSpeedChallenge: () => void;
  clearSpeedChallengeResults: () => void;
}

const SpeedChallengeContext = createContext<SpeedChallengeContextValue | undefined>(undefined);

export const SpeedChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [speedChallenge, setSpeedChallenge] = useState<SpeedChallengeState>({
    enabled: false,
    duration: 2,
    timeLeft: 0,
    isActive: false,
    results: null
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      // Challenge ended — set the tagged completion signal. Consumers read
      // the live score from the problem context, not from this field.
      setSpeedChallenge(prev => ({
        ...prev,
        isActive: false,
        results: { ended: true },
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

export type { SpeedChallengeContextValue };
