
'use server';

import { enhanceQueryWithExternalKnowledge } from '@/ai/flows/enhance-query-with-external-knowledge';
import { generateTextResponse } from '@/ai/flows/generate-text';
import { summarizeImage } from '@/ai/flows/summarize-image-flow';
import { z } from 'zod';

const GetAiResponseInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt tidak boleh kosong.'),
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
    let queryToUse = prompt;
    try {
      const enhancementResult = await enhanceQueryWithExternalKnowledge({ query: prompt });
      if (enhancementResult.enhancedQuery) {
        queryToUse = enhancementResult.enhancedQuery;
      }
    } catch (enhancementError) {
      console.warn('Kesalahan saat meningkatkan kueri, menggunakan prompt asli:', enhancementError);
    }
    
    // Step 2: Generate text response using the (potentially enhanced) query
    const response = await generateTextResponse({ prompt: queryToUse });
    
    if (response.text) {
      return { text: response.text };
    } else {
      return { error: 'AI tidak memberikan respons teks.' };
    }
  } catch (error) {
    console.error('Kesalahan mendapatkan respons AI:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Terjadi kesalahan yang tidak diketahui saat mengambil respons AI.' };
  }
}


const GetImageSummaryInputSchema = z.object({
  imageDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: "Format URI data gambar tidak valid. Harus dimulai dengan 'data:image/'."
  }),
  userPrompt: z.string().min(1, "Prompt pengguna tidak boleh kosong."),
});

export type GetImageSummaryInput = z.infer<typeof GetImageSummaryInputSchema>;

export interface GetImageSummaryOutput {
  summary?: string;
  error?: string;
}

export async function getImageSummaryAction(input: GetImageSummaryInput): Promise<GetImageSummaryOutput> {
  const validatedInput = GetImageSummaryInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return { error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }

  const { imageDataUri, userPrompt } = validatedInput.data;

  try {
    const result = await summarizeImage({
      imageDataUri: imageDataUri,
      userPrompt: userPrompt, 
    });
    return { summary: result.summary };
  } catch (error) {
    console.error('Kesalahan mendapatkan ringkasan gambar:', error);
    if (error instanceof Error) {
      if (error.message.includes("model is overloaded")) {
        return { error: "Model AI saat ini kelebihan beban. Silakan coba lagi dalam beberapa saat." };
      }
      if (error.message.includes("Invalid argument")) {
        return { error: "Terjadi masalah saat memproses gambar. Pastikan format gambar valid dan ukurannya tidak terlalu besar." };
      }
      return { error: `Terjadi kesalahan: ${error.message}` };
    }
    return { error: 'Terjadi kesalahan yang tidak diketahui saat meringkas gambar.' };
  }
}
