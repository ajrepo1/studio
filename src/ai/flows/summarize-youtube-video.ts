'use server';
/**
 * @fileOverview Summarizes YouTube videos using Genkit.
 *
 * - summarizeYouTubeVideo - A function that summarizes a YouTube video given its URL.
 * - SummarizeYouTubeVideoInput - The input type for the summarizeYouTubeVideo function.
 * - SummarizeYouTubeVideoOutput - The return type for the summarizeYouTubeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeYouTubeVideoInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the YouTube video to summarize.'),
  length: z.enum(['short', 'medium', 'long']).default('medium').describe('The desired length of the summary.'),
});
export type SummarizeYouTubeVideoInput = z.infer<typeof SummarizeYouTubeVideoInputSchema>;

const SummarizeYouTubeVideoOutputSchema = z.object({
  summary: z.string().describe('The summary of the YouTube video in Markdown format.'),
});
export type SummarizeYouTubeVideoOutput = z.infer<typeof SummarizeYouTubeVideoOutputSchema>;

export async function summarizeYouTubeVideo(input: SummarizeYouTubeVideoInput): Promise<SummarizeYouTubeVideoOutput> {
  return summarizeYouTubeVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeYouTubeVideoPrompt',
  input: {schema: SummarizeYouTubeVideoInputSchema},
  output: {schema: SummarizeYouTubeVideoOutputSchema},
  prompt: `Summarize this YouTube video clearly using Markdown for formatting.

# Core Message
(Provide the core message in 2-3 sentences)

## Key Points
- (Provide a detailed breakdown of key points in a bulleted list)

## Actionable Tasks
- (List specific, actionable tasks the viewer can implement right away based on the video’s advice)

Video URL: {{{videoUrl}}}
Summary Length: {{{length}}}
`,
});

const summarizeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'summarizeYouTubeVideoFlow',
    inputSchema: SummarizeYouTubeVideoInputSchema,
    outputSchema: SummarizeYouTubeVideoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
