'use server';
/**
 * @fileOverview Text generation flow.
 *
 * - generateTextResponse - A function that generates text based on a prompt.
 * - GenerateTextResponseInput - The input type for the generateTextResponse function.
 * - GenerateTextResponseOutput - The return type for the generateTextResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextResponseInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate text from.'),
});
export type GenerateTextResponseInput = z.infer<typeof GenerateTextResponseInputSchema>;

const GenerateTextResponseOutputSchema = z.object({
  text: z.string().describe('The generated text.'),
});
export type GenerateTextResponseOutput = z.infer<typeof GenerateTextResponseOutputSchema>;

export async function generateTextResponse(input: GenerateTextResponseInput): Promise<GenerateTextResponseOutput> {
  return generateTextResponseFlow(input);
}

const generateTextResponsePrompt = ai.definePrompt({
  name: 'generateTextResponsePrompt',
  input: {schema: GenerateTextResponseInputSchema},
  output: {schema: GenerateTextResponseOutputSchema},
  prompt: `{{prompt}}`,
});

const generateTextResponseFlow = ai.defineFlow(
  {
    name: 'generateTextResponseFlow',
    inputSchema: GenerateTextResponseInputSchema,
    outputSchema: GenerateTextResponseOutputSchema,
  },
  async input => {
    const {output} = await generateTextResponsePrompt(input);
    return output!;
  }
);
