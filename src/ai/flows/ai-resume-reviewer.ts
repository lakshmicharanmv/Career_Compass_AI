'use server';

/**
 * @fileOverview An AI resume reviewer flow.
 *
 * - reviewResume - A function that reviews a resume and suggests improvements.
 * - ReviewResumeInput - The input type for the reviewResume function.
 * - ReviewResumeOutput - The return type for the reviewResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'The resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type ReviewResumeInput = z.infer<typeof ReviewResumeInputSchema>;

const ReviewResumeOutputSchema = z.object({
  improvedResume: z.string().describe('The improved, ATS-friendly resume.'),
  feedback: z.string().describe('Feedback on formatting, keyword gaps, and grammar errors.'),
});
export type ReviewResumeOutput = z.infer<typeof ReviewResumeOutputSchema>;

export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput> {
  return reviewResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewResumePrompt',
  input: {schema: ReviewResumeInputSchema},
  output: {schema: ReviewResumeOutputSchema},
  prompt: `You are an expert resume reviewer. You will review the resume and provide feedback on formatting, keyword gaps, and grammar errors. Then, you will generate an improved, ATS-friendly version of the resume.

Resume: {{media url=resumeDataUri}}

Respond with the improved resume and your feedback.`,
});

const reviewResumeFlow = ai.defineFlow(
  {
    name: 'reviewResumeFlow',
    inputSchema: ReviewResumeInputSchema,
    outputSchema: ReviewResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
