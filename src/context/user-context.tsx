"use client";

import { createContext, useState, useCallback, useContext, useEffect, type ReactNode } from 'react';

interface UserContextType {
  isLoading: boolean;
  leaderboardVersion: number;
  refreshLeaderboardData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);

  useEffect(() => {
    // Simple initialization - just mark as loaded
    setIsLoading(false);
  }, []);

  const refreshLeaderboardData = useCallback(() => {
    setLeaderboardVersion(v => v + 1);
  }, []);

  const value = {
    isLoading,
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
