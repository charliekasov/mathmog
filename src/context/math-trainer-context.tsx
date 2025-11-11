"use client";

import { createContext, useContext } from 'react';

const MathTrainerContext = createContext<any>(undefined);

export const MathTrainerProvider = ({ children }: { children: React.ReactNode }) => {
  throw new Error('OLD CONTEXT STILL BEING USED! This context has been split. Check which component is importing from math-trainer-context.tsx');
};

export const useMathTrainer = () => {
  throw new Error('useMathTrainer has been replaced! Use useProblem, useUI, useSpeedChallenge, or useUser instead');
};