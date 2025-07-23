'use server';

/**
 * @fileOverview An AI agent that recommends level and difficulty increases based on user performance.
 *
 * - adaptiveLevelUpPrompt - A function that suggests a level/difficulty increase based on the user's recent performance.
 * - AdaptiveLevelUpInput - The input type for the adaptiveLevelUpPrompt function.
 * - AdaptiveLevelUpOutput - The return type for the adaptiveLevelUpPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveLevelUpInputSchema = z.object({
  currentDifficulty: z
    .string()
    .describe('The current difficulty level (e.g., Easy, Medium, Hard).'),
  consecutiveCorrect: z
    .number()
    .describe('The number of consecutively correct answers.'),
});
export type AdaptiveLevelUpInput = z.infer<typeof AdaptiveLevelUpInputSchema>;

const AdaptiveLevelUpOutputSchema = z.object({
  suggestLevelUp: z.boolean().describe('Whether to suggest leveling up or not.'),
  newDifficulty: z.string().describe('The new difficulty level if leveling up.'),
  reason: z.string().describe('The reason for suggesting the level up.'),
});
export type AdaptiveLevelUpOutput = z.infer<typeof AdaptiveLevelUpOutputSchema>;

export async function adaptiveLevelUpPrompt(
  input: AdaptiveLevelUpInput
): Promise<AdaptiveLevelUpOutput> {
  return adaptiveLevelUpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveLevelUpPrompt',
  input: {schema: AdaptiveLevelUpInputSchema},
  output: {schema: AdaptiveLevelUpOutputSchema},
  prompt: `Based on the user's current difficulty level of {{{currentDifficulty}}} and {{{consecutiveCorrect}}} consecutive correct answers, determine whether to suggest increasing the difficulty.

  If the user has a high number of consecutive correct answers (e.g., > 7), then suggest increasing the difficulty to the next level.

  Return a JSON object with the following format:
  {
    "suggestLevelUp": true or false,
    "newDifficulty": "the new difficulty if suggestLevelUp is true",
    "reason": "the reason for the suggestion"
  }

  Example 1:
  {
    "currentDifficulty": "Easy",
    "consecutiveCorrect": 8
  }

  Result:
  {
    "suggestLevelUp": true,
    "newDifficulty": "Medium",
    "reason": "The user has answered 8 questions correctly in a row at the Easy difficulty, so it is recommended to increase the difficulty to Medium."
  }

  Example 2:
  {
    "currentDifficulty": "Hard",
    "consecutiveCorrect": 3
  }

  Result:
  {
    "suggestLevelUp": false,
    "newDifficulty": "",
    "reason": "The user has only answered 3 questions correctly in a row at the Hard difficulty, so it is not recommended to increase the difficulty."
  }

  Now generate the JSON result for the following input:
  {
    "currentDifficulty": "{{{currentDifficulty}}}",
    "consecutiveCorrect": {{{consecutiveCorrect}}}
  }`,
});

const adaptiveLevelUpFlow = ai.defineFlow(
  {
    name: 'adaptiveLevelUpFlow',
    inputSchema: AdaptiveLevelUpInputSchema,
    outputSchema: AdaptiveLevelUpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
