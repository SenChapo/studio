
'use server';
/**
 * @fileOverview Flow untuk meringkas konten gambar.
 * - summarizeImage - Fungsi untuk mendapatkan ringkasan gambar.
 * - SummarizeImageInput - Tipe input.
 * - SummarizeImageOutput - Tipe output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "Gambar yang akan diringkas, sebagai data URI. Format yang diharapkan: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userPrompt: z.string().describe('Prompt dari pengguna, termasuk instruksi bahasa (misalnya, "Deskripsikan gambar ini dalam Bahasa Indonesia." atau "Describe this image in English.").'),
});
export type SummarizeImageInput = z.infer<typeof SummarizeImageInputSchema>;

const SummarizeImageOutputSchema = z.object({
  summary: z.string().describe('Ringkasan gambar yang dihasilkan (dalam bahasa yang diminta pengguna).'),
});
export type SummarizeImageOutput = z.infer<typeof SummarizeImageOutputSchema>;

export async function summarizeImage(input: SummarizeImageInput): Promise<SummarizeImageOutput> {
  return summarizeImageFlow(input);
}

const summarizeImagePrompt = ai.definePrompt({
  name: 'summarizeImagePrompt',
  input: {schema: SummarizeImageInputSchema},
  output: {schema: SummarizeImageOutputSchema},
  // Gunakan model yang mendukung input multimodal
  model: 'googleai/gemini-2.0-flash', 
  prompt: `Anda adalah seorang analis gambar yang ahli. Tugas Anda adalah menganalisis gambar yang diberikan dan mendeskripsikan kontennya berdasarkan permintaan pengguna.

Permintaan Pengguna: {{{userPrompt}}}
Gambar untuk dianalisis: {{media url=imageDataUri}}

Berikan ringkasan yang detail dan komprehensif. Fokus pada elemen kunci, warna, objek, teks yang ada (jika ada), latar, dan suasana atau subjek keseluruhan.
Pastikan respons Anda secara ketat mengikuti bahasa yang ditentukan dalam permintaan pengguna.`,
});

const summarizeImageFlow = ai.defineFlow(
  {
    name: 'summarizeImageFlow',
    inputSchema: SummarizeImageInputSchema,
    outputSchema: SummarizeImageOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeImagePrompt(input);
    if (!output) {
        throw new Error('Tidak ada output dari summarizeImagePrompt');
    }
    return output;
  }
);
