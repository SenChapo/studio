import { config } from 'dotenv';
config();

import '@/ai/flows/generate-text.ts';
import '@/ai/flows/enhance-query-with-external-knowledge.ts';
import '@/ai/flows/summarize-image-flow.ts'; // Added new flow
