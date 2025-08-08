
'use server';
/**
 * @fileOverview A flow for handling leaderboard interactions.
 *
 * - getLeaderboardData - Fetches leaderboard and user data.
 * - createUser - Creates a new leaderboard user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getLeaderboard,
  createLeaderboardUser,
  addScore,
} from '@/lib/leaderboard-service';
import type { Difficulty, LeaderboardData, LeaderboardUser } from '@/lib/types';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const USERS_COLLECTION = 'users';

const GetLeaderboardInputSchema = z.object({
  level: z.number(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  duration: z.number(),
  secret: z.string(),
});
export type GetLeaderboardInput = z.infer<typeof GetLeaderboardInputSchema>;

const CreateUserInputSchema = z.object({
  name: z.string(),
  secret: z.string(),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

const AddScoreInputSchema = z.object({
  level: z.number(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  duration: z.number(),
  score: z.number(),
  secret: z.string(),
});
export type AddScoreInput = z.infer<typeof AddScoreInputSchema>;

// Helper to find a user by their secret
async function findUserBySecret(secret: string): Promise<LeaderboardUser | null> {
  if (!secret) return null;
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('secret', '==', secret), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    secret: data.secret,
    createdAt: data.createdAt.toDate(),
  };
}

export const getLeaderboardData = ai.defineFlow(
  {
    name: 'getLeaderboardData',
    inputSchema: GetLeaderboardInputSchema,
    outputSchema: z.custom<LeaderboardData>(),
  },
  async ({ level, difficulty, duration, secret }): Promise<LeaderboardData> => {
    const user = await findUserBySecret(secret);
    const scores = await getLeaderboard(level, difficulty, duration);
    
    let userScore: { score: number; rank: number } | null = null;
    
    const scoresWithCurrentUser = scores.map((score, index) => {
        const isCurrentUser = user ? score.userId === user.id : false;
        if (isCurrentUser && !userScore) {
            userScore = { score: score.score, rank: index + 1 };
        }
        return { ...score, isCurrentUser };
    });

    return {
      scores: scoresWithCurrentUser,
      user: user ? { id: user.id!, name: user.name } : null,
      userScore,
    };
  }
);


export const createUser = ai.defineFlow(
    {
        name: 'createLeaderboardUserFlow',
        inputSchema: CreateUserInputSchema,
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async ( { name, secret }) => {
        return createLeaderboardUser(name, secret);
    }
);

export const submitScore = ai.defineFlow(
  {
    name: 'submitScoreFlow',
    inputSchema: AddScoreInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ level, difficulty, duration, score, secret }) => {
    const user = await findUserBySecret(secret);
    if (user && user.id) {
      await addScore(user.id, user.name, score, level, difficulty, duration);
      return { success: true };
    }
    return { success: false };
  }
);
