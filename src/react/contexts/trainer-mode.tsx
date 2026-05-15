"use client";

import * as React from 'react';
import type { Difficulty } from '../../core/types';
import { useProblem } from './problem';

// Trainer-level mode. Drill is the scored, target-count, no-Start-screen-on-mount
// experience. Free Play (Slice 2a) is the unscored, lands-on-a-problem,
// leave-when-you-leave mode. Default is 'drill' to preserve current habits.
export type TrainerMode = 'drill' | 'free-play';

// Slice 2b Item F: opt-in save handler signature. The callback is owned
// by the host page (so it can read student/user identity and gate on
// simulation mode); the trainer just emits the session payload when the
// student clicks "Save session."
export interface SavePracticeSessionPayload {
  correct: number;
  total: number;
  level: 1 | 2 | 3;
  difficulty: Difficulty;
  topic?: string;
  timeSpentSeconds: number;
  isSpeedChallenge: boolean;
  duration?: number;
}

export type OnSaveSession = (data: SavePracticeSessionPayload) => void | Promise<void>;

interface TrainerModeContextValue {
  trainerMode: TrainerMode;
  setTrainerMode: (mode: TrainerMode) => void;
  drillStarted: boolean;
  targetProblemCount: number;
  setTargetProblemCount: (count: number) => void;
  startDrill: () => void;
  endDrill: () => void;
  // Optional opt-in save callback wired by the host page; if absent, the
  // trainer hides all Save buttons (e.g. in homework flow or tests).
  onSaveSession?: OnSaveSession;
}

const TrainerModeContext = React.createContext<TrainerModeContextValue | null>(null);

export function useTrainerMode() {
  const context = React.useContext(TrainerModeContext);
  if (!context) throw new Error('useTrainerMode must be used within TrainerModeProvider');
  return context;
}

// Optional accessor — returns null when used outside the provider, instead of
// throwing. Useful for components like `LevelUpDialog` that legitimately render
// outside the trainer surface (homework flow without the TrainerMode provider).
export function useTrainerModeOptional(): TrainerModeContextValue | null {
  return React.useContext(TrainerModeContext);
}

export function TrainerModeProvider({
  children,
  onSaveSession,
}: {
  children: React.ReactNode;
  onSaveSession?: OnSaveSession;
}) {
  const [trainerMode, setTrainerMode] = React.useState<TrainerMode>('drill');
  const [drillStarted, setDrillStarted] = React.useState(false);
  const [targetProblemCount, setTargetProblemCount] = React.useState(10);
  const { handleReset } = useProblem();

  const startDrill = React.useCallback(() => {
    handleReset();
    setDrillStarted(true);
  }, [handleReset]);

  const endDrill = React.useCallback(() => {
    setDrillStarted(false);
  }, []);

  return (
    <TrainerModeContext.Provider
      value={{
        trainerMode,
        setTrainerMode,
        drillStarted,
        targetProblemCount,
        setTargetProblemCount,
        startDrill,
        endDrill,
        onSaveSession,
      }}
    >
      {children}
    </TrainerModeContext.Provider>
  );
}

export type { TrainerModeContextValue };
