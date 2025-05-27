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
  enhancedQuery: z.string().describe('The enhanced query with external knowledge, or the original query if no enhancement was beneficial.'),
});
export type EnhanceQueryWithExternalKnowledgeOutput = z.infer<typeof EnhanceQueryWithExternalKnowledgeOutputSchema>;

export async function enhanceQueryWithExternalKnowledge(input: EnhanceQueryWithExternalKnowledgeInput): Promise<EnhanceQueryWithExternalKnowledgeOutput> {
  return enhanceQueryWithExternalKnowledgeFlow(input);
}

const shouldEnhanceQuery = ai.defineTool({
  name: 'shouldEnhanceQuery',
  description: 'Determines whether the user query would benefit from being enhanced with external knowledge. Avoid enhancing simple greetings or very short non-questions.',
  inputSchema: z.object({
    query: z.string().describe('The user query.'),
  }),
  outputSchema: z.boolean().describe('Whether the query should be enhanced.'),
},
async ({ query }) => {
  const normalizedQuery = query.toLowerCase().trim();
  const greetings = ['halo', 'hai', 'hi', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'pagi', 'siang', 'sore', 'malam', 'hei', 'helo'];
  
  if (greetings.includes(normalizedQuery)) {
    return false; // Don't enhance simple greetings
  }
  // Avoid enhancing very short queries that are not questions
  if (normalizedQuery.length < 10 && !normalizedQuery.includes('?')) {
    return false; 
  }
  // Placeholder: More sophisticated logic could check for keywords implying need for external data.
  // For now, enhance if it's potentially a question or a longer statement.
  return normalizedQuery.length >= 10 || normalizedQuery.includes('?');
}
);

const getExternalKnowledge = ai.defineTool({
  name: 'getExternalKnowledge',
  description: 'Retrieves relevant information from external knowledge sources to enhance the user query. This should only be called if `shouldEnhanceQuery` indicates enhancement is beneficial.',
  inputSchema: z.object({
    query: z.string().describe('The user query to retrieve external knowledge for.'),
  }),
  outputSchema: z.string().describe('The relevant external knowledge.'),
},
async (input) => {
    // This is a placeholder implementation - replace with your actual logic
    // to query a database, search the web, or access an API.
    // For example, you might search for financial data, product details, or news articles.
    return `Informasi tambahan terkait: "${input.query}"`;
  }
);

const enhanceQueryPrompt = ai.definePrompt({
  name: 'enhanceQueryPrompt',
  tools: [shouldEnhanceQuery, getExternalKnowledge],
  input: {schema: EnhanceQueryWithExternalKnowledgeInputSchema},
  output: {schema: EnhanceQueryWithExternalKnowledgeOutputSchema},
  prompt: `You are an AI assistant. Your task is to analyze the user's query: "{{{query}}}".
First, use the 'shouldEnhanceQuery' tool to determine if this query would benefit from external knowledge.
- If 'shouldEnhanceQuery' returns true: Use the 'getExternalKnowledge' tool to retrieve relevant information based on the original query "{{{query}}}". Then, formulate an 'enhancedQuery' by integrating this external knowledge with the original query in a natural way. The enhanced query should still be a coherent question or statement.
- If 'shouldEnhanceQuery' returns false: The 'enhancedQuery' MUST be exactly the same as the original query: "{{{query}}}".

Return ONLY the 'enhancedQuery' in the specified output format.
Original Query: {{{query}}}
`,
});

const enhanceQueryWithExternalKnowledgeFlow = ai.defineFlow(
  {
    name: 'enhanceQueryWithExternalKnowledgeFlow',
    inputSchema: EnhanceQueryWithExternalKnowledgeInputSchema,
    outputSchema: EnhanceQueryWithExternalKnowledgeOutputSchema,
  },
  async input => {
    const {output} = await enhanceQueryPrompt(input);
    // Ensure output is not null or undefined. If it is, fall back to original query.
    if (output && output.enhancedQuery) {
        return output;
    }
    return { enhancedQuery: input.query }; // Fallback
  }
);
