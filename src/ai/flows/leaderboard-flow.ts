'use server';
/**
 * @fileOverview Server actions for arcade-style leaderboard.
 *
 * - getLeaderboardData - Fetches leaderboard scores.
 * - submitScore - Submits a score with name validation and profanity filtering.
 */

import { getLeaderboard, addScore } from '@/lib/leaderboard-service';
import type { Difficulty, LeaderboardScore } from '@/lib/types';
import { Filter } from 'bad-words';

const filter = new Filter();

// Add some additional words that might slip through
filter.addWords('ass', 'asses');

export type GetLeaderboardInput = {
  level: number;
  difficulty: Difficulty;
  duration: number;
};

export type SubmitScoreInput = {
  name: string;
  score: number;
  level: number;
  difficulty: Difficulty;
  duration: number;
};

export type LeaderboardData = {
  scores: LeaderboardScore[];
};

/**
 * Validates a name for the leaderboard.
 * - Must be 3-12 alphanumeric characters
 * - Must not contain profanity
 */
function validateName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim();

  // Check length
  if (trimmed.length < 3 || trimmed.length > 12) {
    return { valid: false, message: 'Name must be 3-12 characters' };
  }

  // Check alphanumeric
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(trimmed)) {
    return { valid: false, message: 'Name must be letters and numbers only' };
  }

  // Check profanity
  if (filter.isProfane(trimmed)) {
    return { valid: false, message: 'Please choose an appropriate name' };
  }

  return { valid: true };
}

export async function getLeaderboardData({ level, difficulty, duration }: GetLeaderboardInput): Promise<LeaderboardData> {
  try {
    const scores = await getLeaderboard(level, difficulty, duration);
    return { scores };
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return { scores: [] };
  }
}

export async function submitScore({ name, score, level, difficulty, duration }: SubmitScoreInput): Promise<{ success: boolean; message?: string }> {
  // Validate name
  const validation = validateName(name);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  // Don't save scores of 0
  if (score <= 0) {
    return { success: false, message: 'Score must be greater than 0' };
  }

  try {
    const result = await addScore(name.trim(), score, level, difficulty, duration);
    return result;
  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false, message: 'Failed to save score' };
  }
}
