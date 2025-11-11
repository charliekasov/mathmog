"use client";

import { createContext, useState, useCallback, useContext, useEffect, type ReactNode } from 'react';
import type { LeaderboardUser } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface UserContextType {
  isLoading: boolean;
  user: LeaderboardUser | null;
  leaderboardVersion: number;
  refreshLeaderboardData: (newUser?: LeaderboardUser) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<LeaderboardUser | null>(null);
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        let secret = localStorage.getItem('user-secret');
        if (!secret) {
          secret = uuidv4();
          localStorage.setItem('user-secret', secret);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const refreshLeaderboardData = useCallback(async (newUser?: LeaderboardUser) => {
    if (newUser) {
      setUser(newUser);
    }
    setLeaderboardVersion(v => v + 1);
  }, []);

  const value = {
    isLoading,
    user,
    leaderboardVersion,
    refreshLeaderboardData,
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