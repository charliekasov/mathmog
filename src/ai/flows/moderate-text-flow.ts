'use server';
/**
 * @fileOverview A content moderation AI agent.
 *
 * - moderateText - A function that checks if text contains profanity.
 * - ModerateTextInput - The input type for the moderateText function.
 * - ModerateTextOutput - The return type for the moderateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ModerateTextInputSchema = z.object({
  textToModerate: z.string().describe('The text to be moderated.'),
});
export type ModerateTextInput = z.infer<typeof ModerateTextInputSchema>;

const ModerateTextOutputSchema = z.object({
  isProfane: z.boolean().describe('True if the text contains profanity, hate speech, or is otherwise inappropriate for a general audience. False otherwise.'),
});
export type ModerateTextOutput = z.infer<typeof ModerateTextOutputSchema>;

export async function moderateText(input: ModerateTextInput): Promise<ModerateTextOutput> {
  return moderateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateTextPrompt',
  input: { schema: ModerateTextInputSchema },
  output: { schema: ModerateTextOutputSchema },
  prompt: `You are a content moderator for a family-friendly math game. Your job is to determine if a user-submitted name is appropriate.

You must flag any text that contains profanity, hate speech, sexually explicit content, or other language that would be inappropriate for children.

Analyze the following text: {{{textToModerate}}}`,
});

const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerateTextInputSchema,
    outputSchema: ModerateTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
