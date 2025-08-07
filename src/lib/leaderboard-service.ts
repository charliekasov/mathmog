// This service is not a Genkit flow, so it does not need 'use server'.
// It will be imported into other server-side files.

import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import type { Difficulty, LeaderboardScore, LeaderboardUser } from './types';

const USERS_COLLECTION = 'users';
const SCORES_COLLECTION = 'scores';

/**
 * Checks if a name is already taken by a different user.
 * @param name The name to check.
 * @param secret The secret of the current user.
 * @returns True if the name is taken by someone else, false otherwise.
 */
export async function isNameTaken(name: string, secret: string): Promise<boolean> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('name', '==', name), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return false; // Name not found, so it's not taken.
  }

  const existingUser = querySnapshot.docs[0].data() as LeaderboardUser;
  return existingUser.secret !== secret; // Is it taken by someone else?
}

/**
 * Creates a new user if the name is not taken.
 * @param name The name for the new user.
 *- @param secret The secret for the new user.
 * @returns The new user's ID if successful, otherwise null.
 */
export async function createLeaderboardUser(name: string, secret: string): Promise<string | null> {
    if (await isNameTaken(name, secret)) {
        return null;
    }

    const usersRef = collection(db, USERS_COLLECTION);
    const docRef = await addDoc(usersRef, {
        name,
        secret, // In a real app, this should be hashed, but for arcade-style it's okay.
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}


/**
 * Adds a score to the leaderboard.
 * @param userId The user's ID.
 * @param name The user's name.
 * @param score The score to add.
 * @param level The level of the challenge.
 * @param difficulty The difficulty of the challenge.
 */
export async function addScore(userId: string, name: string, score: number, level: number, difficulty: Difficulty) {
  const scoresRef = collection(db, SCORES_COLLECTION);
  await addDoc(scoresRef, {
    userId,
    name,
    score,
    level,
    difficulty,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetches the top 10 scores for a given level and difficulty.
 * @param level The level to fetch scores for.
 * @param difficulty The difficulty to fetch scores for.
 * @returns A promise that resolves to an array of LeaderboardScore objects.
 */
export async function getLeaderboard(level: number, difficulty: Difficulty): Promise<LeaderboardScore[]> {
  const scoresRef = collection(db, SCORES_COLLECTION);
  const q = query(
    scoresRef,
    where('level', '==', level),
    where('difficulty', '==', difficulty),
    orderBy('score', 'desc'),
    limit(10)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as LeaderboardScore;
  });
}
