"use client";

import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { LeaderboardUser } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface UserContextType {
  isLoading: boolean;
  user: LeaderboardUser | null;
  leaderboardVersion: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<LeaderboardUser | null>(null);
  const [leaderboardVersion] = useState(0);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Just create a secret, don't call any backend
        let secret = localStorage.getItem('user-secret');
        if (!secret) {
          secret = uuidv4();
          localStorage.setItem('user-secret', secret);
        }
        // Don't fetch leaderboard data during initialization
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const value = {
    isLoading,
    user,
    leaderboardVersion,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};