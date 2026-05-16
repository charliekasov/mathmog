"use client";

import { createContext, useState, useContext, type ReactNode, type Dispatch, type SetStateAction } from 'react';

interface TrainerStateContextValue {
  studyTab: string;
  setStudyTab: Dispatch<SetStateAction<string>>;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
}

const TrainerStateContext = createContext<TrainerStateContextValue | undefined>(undefined);

export const TrainerStateProvider = ({ children }: { children: ReactNode }) => {
  const [studyTab, setStudyTab] = useState('memorize');
  const [darkMode, setDarkMode] = useState(false);

  const value = {
    studyTab,
    setStudyTab,
    darkMode,
    setDarkMode,
  };

  return <TrainerStateContext.Provider value={value}>{children}</TrainerStateContext.Provider>;
};

export const useTrainerState = () => {
  const context = useContext(TrainerStateContext);
  if (context === undefined) {
    throw new Error('useTrainerState must be used within a TrainerStateProvider');
  }
  return context;
};

export type { TrainerStateContextValue };
