// This file is no longer used for the extension, 
// but is kept for potential other uses.
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
  summary: z.string().describe('The summary of the webpage in Markdown format.'),
});
export type SummarizeWebPageOutput = z.infer<typeof SummarizeWebPageOutputSchema>;

export async function summarizeWebPage(input: SummarizeWebPageInput): Promise<SummarizeWebPageOutput> {
  return summarizeWebPageFlow(input);
}

const summarizeWebPagePrompt = ai.definePrompt({
  name: 'summarizeWebPagePrompt',
  input: {schema: SummarizeWebPageInputSchema},
  output: {schema: SummarizeWebPageOutputSchema},
  prompt: `Summarize this web page clearly using Markdown for formatting.

# Core Message
(Provide the core message in 2-3 sentences)

## Key Points
- (Provide a detailed breakdown of key points in a bulleted list)

## Actionable Tasks
- (List specific, actionable tasks the viewer can implement right away based on the page's advice)

Web Page URL: {{{url}}}
`,
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
