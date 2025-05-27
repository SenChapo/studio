'use server';
/**
 * @fileOverview A flow that enhances user queries with external knowledge when beneficial.
 *
 * - enhanceQueryWithExternalKnowledge - A function that enhances the query.
 * - EnhanceQueryWithExternalKnowledgeInput - The input type for the enhanceQueryWithExternalKnowledge function.
 * - EnhanceQueryWithExternalKnowledgeOutput - The return type for the enhanceQueryWithExternalKnowledge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceQueryWithExternalKnowledgeInputSchema = z.object({
  query: z.string().describe('The user query to be enhanced.'),
});
export type EnhanceQueryWithExternalKnowledgeInput = z.infer<typeof EnhanceQueryWithExternalKnowledgeInputSchema>;

const EnhanceQueryWithExternalKnowledgeOutputSchema = z.object({
  enhancedQuery: z.string().describe('The enhanced query with external knowledge.'),
});
export type EnhanceQueryWithExternalKnowledgeOutput = z.infer<typeof EnhanceQueryWithExternalKnowledgeOutputSchema>;

export async function enhanceQueryWithExternalKnowledge(input: EnhanceQueryWithExternalKnowledgeInput): Promise<EnhanceQueryWithExternalKnowledgeOutput> {
  return enhanceQueryWithExternalKnowledgeFlow(input);
}

const shouldEnhanceQuery = ai.defineTool({
  name: 'shouldEnhanceQuery',
  description: 'Determines whether the user query would benefit from being enhanced with external knowledge.',
  inputSchema: z.object({
    query: z.string().describe('The user query.'),
  }),
  outputSchema: z.boolean().describe('Whether the query should be enhanced.'),
},
async (input) => {
    // Implement logic to determine if external knowledge would benefit the query
    // For example, check if the query is ambiguous or requires specific factual information
    // This is a placeholder implementation - replace with your actual logic
    return input.query.length < 20; // Enhance if the query is short
  }
);

const getExternalKnowledge = ai.defineTool({
  name: 'getExternalKnowledge',
  description: 'Retrieves relevant information from external knowledge sources to enhance the user query.',
  inputSchema: z.object({
    query: z.string().describe('The user query to retrieve external knowledge for.'),
  }),
  outputSchema: z.string().describe('The relevant external knowledge.'),
},
async (input) => {
    // Implement logic to retrieve external knowledge based on the query
    // This could involve querying a database, searching the web, or accessing an API
    // This is a placeholder implementation - replace with your actual logic
    return `External knowledge for query: ${input.query}`;
  }
);

const enhanceQueryPrompt = ai.definePrompt({
  name: 'enhanceQueryPrompt',
  tools: [shouldEnhanceQuery, getExternalKnowledge],
  input: {schema: EnhanceQueryWithExternalKnowledgeInputSchema},
  output: {schema: EnhanceQueryWithExternalKnowledgeOutputSchema},
  prompt: `You are an AI assistant that enhances user queries with external knowledge when it is beneficial. 

  First, determine if the query would benefit from external knowledge using the shouldEnhanceQuery tool.
  If it would, use the getExternalKnowledge tool to retrieve relevant information.
  Finally, generate an enhanced query that incorporates the external knowledge.

  Query: {{{query}}}

  Enhanced Query: `,
});

const enhanceQueryWithExternalKnowledgeFlow = ai.defineFlow(
  {
    name: 'enhanceQueryWithExternalKnowledgeFlow',
    inputSchema: EnhanceQueryWithExternalKnowledgeInputSchema,
    outputSchema: EnhanceQueryWithExternalKnowledgeOutputSchema,
  },
  async input => {
    const {output} = await enhanceQueryPrompt(input);
    return output!;
  }
);
