'use server';

import { enhanceQueryWithExternalKnowledge } from '@/ai/flows/enhance-query-with-external-knowledge';
import { generateTextResponse } from '@/ai/flows/generate-text';
import { z } from 'zod';

const GetAiResponseInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.'),
});

export type GetAiResponseInput = z.infer<typeof GetAiResponseInputSchema>;

export interface GetAiResponseOutput {
  text?: string;
  error?: string;
}

export async function getAiResponse(input: GetAiResponseInput): Promise<GetAiResponseOutput> {
  const validatedInput = GetAiResponseInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return { error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }

  const { prompt } = validatedInput.data;

  try {
    // Step 1: Enhance query if needed
    // For simplicity, we'll assume the enhanceQueryWithExternalKnowledge flow internally decides
    // whether to actually enhance or return the original.
    // If it errors or returns an empty enhancedQuery, we might fall back to the original prompt.
    let queryToUse = prompt;
    try {
      const enhancementResult = await enhanceQueryWithExternalKnowledge({ query: prompt });
      if (enhancementResult.enhancedQuery) {
        queryToUse = enhancementResult.enhancedQuery;
      }
    } catch (enhancementError) {
      console.warn('Error enhancing query, using original prompt:', enhancementError);
      // Fallback to original prompt is already default
    }
    
    // Step 2: Generate text response using the (potentially enhanced) query
    const response = await generateTextResponse({ prompt: queryToUse });
    
    if (response.text) {
      return { text: response.text };
    } else {
      return { error: 'AI did not return a text response.' };
    }
  } catch (error) {
    console.error('Error getting AI response:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred while fetching the AI response.' };
  }
}
