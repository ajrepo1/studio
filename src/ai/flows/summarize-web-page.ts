// Summarize the content of any webpage.
'use server';
/**
 * @fileOverview Summarizes the content of a webpage.
 *
 * - summarizeWebPage - A function that summarizes the content of a webpage.
 * - SummarizeWebPageInput - The input type for the summarizeWebPage function.
 * - SummarizeWebPageOutput - The return type for the summarizeWebPage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWebPageInputSchema = z.object({
  url: z.string().describe('The URL of the webpage to summarize.'),
});
export type SummarizeWebPageInput = z.infer<typeof SummarizeWebPageInputSchema>;

const SummarizeWebPageOutputSchema = z.object({
  summary: z.string().describe('The summary of the webpage.'),
});
export type SummarizeWebPageOutput = z.infer<typeof SummarizeWebPageOutputSchema>;

export async function summarizeWebPage(input: SummarizeWebPageInput): Promise<SummarizeWebPageOutput> {
  return summarizeWebPageFlow(input);
}

const summarizeWebPagePrompt = ai.definePrompt({
  name: 'summarizeWebPagePrompt',
  input: {schema: SummarizeWebPageInputSchema},
  output: {schema: SummarizeWebPageOutputSchema},
  prompt: `Summarize the content of the webpage at the following URL:\n\n{{{url}}}`,
});

const summarizeWebPageFlow = ai.defineFlow(
  {
    name: 'summarizeWebPageFlow',
    inputSchema: SummarizeWebPageInputSchema,
    outputSchema: SummarizeWebPageOutputSchema,
  },
  async input => {
    const {output} = await summarizeWebPagePrompt(input);
    return output!;
  }
);
