'use server';

/**
 * @fileOverview Recommends an appropriate level of difficulty and skill for practice based on the user's recent performance.
 *
 * - difficultyRecommender - A function that handles the difficulty recommendation process.
 * - DifficultyRecommenderInput - The input type for the difficultyRecommender function.
 * - DifficultyRecommenderOutput - The return type for the difficultyRecommender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DifficultyRecommenderInputSchema = z.object({
  correctAnswers: z
    .number()
    .describe('The number of questions the user answered correctly.'),
  totalQuestions: z
    .number()
    .describe('The total number of questions the user answered.'),
  currentDifficulty: z
    .string()
    .describe('The current difficulty level of the questions.'),
  currentLevel: z
    .number()
    .describe('The current level of the questions.'),
});
export type DifficultyRecommenderInput = z.infer<typeof DifficultyRecommenderInputSchema>;

const DifficultyRecommenderOutputSchema = z.object({
  recommendedDifficulty: z
    .string()
    .describe('The recommended difficulty level for the user.'),
  recommendedLevel: z
    .number()
    .describe('The recommended level for the user.'),
  reason: z.string().describe('The reasoning behind the recommendation.'),
});
export type DifficultyRecommenderOutput = z.infer<typeof DifficultyRecommenderOutputSchema>;

export async function difficultyRecommender(input: DifficultyRecommenderInput): Promise<DifficultyRecommenderOutput> {
  return difficultyRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'difficultyRecommenderPrompt',
  input: {schema: DifficultyRecommenderInputSchema},
  output: {schema: DifficultyRecommenderOutputSchema},
  prompt: `You are an AI that recommends the difficulty and level of math problems for a user based on their performance.

The user has answered {{correctAnswers}} questions correctly out of {{totalQuestions}} questions.
The user is currently at difficulty level {{currentDifficulty}} and level {{currentLevel}}.

Based on this information, recommend a difficulty level (Easy, Medium, or Hard) and a level (1, 2, or 3) for the user.
Also, explain your reasoning for the recommendation in a concise manner.
`,
});

const difficultyRecommenderFlow = ai.defineFlow(
  {
    name: 'difficultyRecommenderFlow',
    inputSchema: DifficultyRecommenderInputSchema,
    outputSchema: DifficultyRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
