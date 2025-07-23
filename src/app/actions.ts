'use server';

import { adaptiveLevelUpPrompt, type AdaptiveLevelUpInput } from '@/ai/flows/level-up-prompt';

export async function getAdaptiveLevelUpSuggestion(input: AdaptiveLevelUpInput) {
    try {
        const result = await adaptiveLevelUpPrompt(input);
        return result;
    } catch (error) {
        console.error("Error calling adaptiveLevelUpPrompt:", error);
        // Return a default non-level-up response in case of an error
        return {
            suggestLevelUp: false,
            newDifficulty: '',
            reason: 'Could not get a recommendation at this time.'
        };
    }
}
