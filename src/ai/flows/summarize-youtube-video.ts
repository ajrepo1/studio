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
  summary: z.string().describe('The summary of the YouTube video.'),
});
export type SummarizeYouTubeVideoOutput = z.infer<typeof SummarizeYouTubeVideoOutputSchema>;

export async function summarizeYouTubeVideo(input: SummarizeYouTubeVideoInput): Promise<SummarizeYouTubeVideoOutput> {
  return summarizeYouTubeVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeYouTubeVideoPrompt',
  input: {schema: SummarizeYouTubeVideoInputSchema},
  output: {schema: SummarizeYouTubeVideoOutputSchema},
  prompt: `You are an expert summarizer of YouTube videos.  Your goal is to provide a concise and accurate summary of the video content.

  The user will provide the URL of the video, and the desired length of the summary (short, medium, or long).  You must return a summary of the requested length.

  Video URL: {{{videoUrl}}}
  Summary Length: {{{length}}}
  Summary:`, // Removed Handlebars await keyword and replaced with tool.
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
