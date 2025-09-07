'use server';

/**
 * @fileOverview Allows the user to control the summary length of a given text.
 *
 * - controlSummaryLength - A function that adjusts the length of a summary.
 * - ControlSummaryLengthInput - The input type for the controlSummaryLength function.
 * - ControlSummaryLengthOutput - The return type for the controlSummaryLength function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ControlSummaryLengthInputSchema = z.object({
  text: z.string().describe('The original text to summarize.'),
  summary: z.string().describe('The current summary of the text.'),
  length: z
    .enum(['short', 'medium', 'long'])
    .describe('The desired length of the summary.'),
});
export type ControlSummaryLengthInput = z.infer<typeof ControlSummaryLengthInputSchema>;

const ControlSummaryLengthOutputSchema = z.object({
  adjustedSummary: z.string().describe('The adjusted summary of the text.'),
});
export type ControlSummaryLengthOutput = z.infer<typeof ControlSummaryLengthOutputSchema>;

export async function controlSummaryLength(
  input: ControlSummaryLengthInput
): Promise<ControlSummaryLengthOutput> {
  return controlSummaryLengthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'controlSummaryLengthPrompt',
  input: {schema: ControlSummaryLengthInputSchema},
  output: {schema: ControlSummaryLengthOutputSchema},
  prompt: `You are an expert summarizer. You will be given a text, a summary, and a desired length for the summary.

Adjust the summary to be the desired length.  If the desired length is shorter, remove details.  If the desired length is longer, add details from the original text.

Original Text: {{{text}}}
Current Summary: {{{summary}}}
Desired Length: {{{length}}}

Adjusted Summary:`,
});

const controlSummaryLengthFlow = ai.defineFlow(
  {
    name: 'controlSummaryLengthFlow',
    inputSchema: ControlSummaryLengthInputSchema,
    outputSchema: ControlSummaryLengthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {adjustedSummary: output!};
  }
);
