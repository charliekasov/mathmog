"use client";

import { createContext, useState, useContext, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { Mode } from '@/lib/types';

interface UIContextType {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  studyTab: string;
  setStudyTab: Dispatch<SetStateAction<string>>;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('practice');
  const [studyTab, setStudyTab] = useState('memorize');
  const [darkMode, setDarkMode] = useState(false);

  const value = {
    mode,
    setMode,
    studyTab,
    setStudyTab,
    darkMode,
    setDarkMode,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};