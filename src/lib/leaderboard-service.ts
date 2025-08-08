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
 * Creates a new user if the name is not taken and is appropriate.
 * @param name The name for the new user.
 * @param secret The secret for the new user.
 * @returns An object indicating success or the reason for failure.
 */
export async function createLeaderboardUser(
  name: string,
  secret: string
): Promise<{ success: boolean; message: string; userId?: string }> {
  // Rule 1: Validate name format (1-12 alphanumeric characters)
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (name.length === 0 || name.length > 12 || !alphanumericRegex.test(name)) {
    return { success: false, message: 'Name must be 1-12 alphanumeric characters.' };
  }

  // Rule 2: Check if name is already taken by another user
  if (await isNameTaken(name, secret)) {
    return { success: false, message: 'This name has already been taken.' };
  }

  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const docRef = await addDoc(usersRef, {
      name,
      secret, // In a real app, this should be hashed, but for arcade-style it's okay.
      createdAt: serverTimestamp(),
    });
    return { success: true, message: 'User created successfully!', userId: docRef.id };
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    return { success: false, message: 'Failed to create user.' };
  }
}


/**
 * Adds a score to the leaderboard.
 * @param userId The user's ID.
 * @param name The user's name.
 * @param score The score to add.
 * @param level The level of the challenge.
 * @param difficulty The difficulty of the challenge.
 * @param duration The duration of the challenge in minutes.
 */
export async function addScore(userId: string, name: string, score: number, level: number, difficulty: Difficulty, duration: number) {
  const scoresRef = collection(db, SCORES_COLLECTION);
  await addDoc(scoresRef, {
    userId,
    name,
    score,
    level,
    difficulty,
    duration,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetches the top 10 scores for a given level and difficulty.
 * @param level The level to fetch scores for.
 * @param difficulty The difficulty to fetch scores for.
 * @param duration The duration in minutes to fetch scores for.
 * @returns A promise that resolves to an array of LeaderboardScore objects.
 */
export async function getLeaderboard(level: number, difficulty: Difficulty, duration: number): Promise<LeaderboardScore[]> {
  const scoresRef = collection(db, SCORES_COLLECTION);
  const q = query(
    scoresRef,
    where('level', '==', level),
    where('difficulty', '==', difficulty),
    where('duration', '==', duration),
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
