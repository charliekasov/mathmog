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
import type { Difficulty, LeaderboardScore } from './types';

const SCORES_COLLECTION = 'scores';

/**
 * Adds a score to the leaderboard.
 * @param name The player's name for this score.
 * @param score The score to add.
 * @param level The level of the challenge.
 * @param difficulty The difficulty of the challenge.
 * @param duration The duration of the challenge in minutes.
 */
export async function addScore(
  name: string,
  score: number,
  level: number,
  difficulty: Difficulty,
  duration: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const scoresRef = collection(db, SCORES_COLLECTION);
    await addDoc(scoresRef, {
      name,
      score,
      level,
      difficulty,
      duration,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding score:', error);
    return { success: false, message: 'Failed to save score' };
  }
}

/**
 * Fetches the top 100 scores for a given level, difficulty, and duration.
 * @param level The level to fetch scores for.
 * @param difficulty The difficulty to fetch scores for.
 * @param duration The duration in minutes to fetch scores for.
 * @returns A promise that resolves to an array of LeaderboardScore objects.
 */
export async function getLeaderboard(
  level: number,
  difficulty: Difficulty,
  duration: number
): Promise<LeaderboardScore[]> {
  const scoresRef = collection(db, SCORES_COLLECTION);
  const q = query(
    scoresRef,
    where('level', '==', level),
    where('difficulty', '==', difficulty),
    where('duration', '==', duration),
    orderBy('score', 'desc'),
    limit(100)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      score: data.score,
      level: data.level,
      difficulty: data.difficulty,
      duration: data.duration,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as LeaderboardScore;
  });
}
