
'use server';

/**
 * @fileOverview An AI resume reviewer flow.
 *
 * - reviewResume - A function that reviews a resume and suggests improvements.
 * - ReviewResumeInput - The input type for the reviewResume function.
 * - ReviewResumeOutput - The return type for the reviewResume function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReviewResumeInput = z.infer<typeof ReviewResumeInputSchema>;

const ReviewResumeOutputSchema = z.object({
  atsScore: z.number().min(0).max(10).describe('The ATS score of the resume, from 0 to 10.'),
  improvements: z.array(z.string()).describe('A list of suggested improvements for the resume.'),
});
export type ReviewResumeOutput = z.infer<typeof ReviewResumeOutputSchema>;

export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput> {
  return reviewResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewResumePrompt',
  input: {schema: ReviewResumeInputSchema},
  output: {schema: ReviewResumeOutputSchema},
  prompt: `You are an expert resume reviewer. Your task is to analyze the provided resume and give it a score based on its compatibility with Applicant Tracking Systems (ATS).

Resume: {{media url=resumeDataUri}}

Based on your analysis, provide an ATS score from 0 to 10. A score of 10 means the resume is perfectly optimized. Also, provide a list of concrete, actionable improvements.`,
});

const reviewResumeFlow = ai.defineFlow(
  {
    name: 'reviewResumeFlow',
    inputSchema: ReviewResumeInputSchema,
    outputSchema: ReviewResumeOutputSchema,
  },
  async (input) => {
    try {
      console.log('Attempting to use primary model for resume review: gemini-1.5-pro');
      const { output } = await prompt(input, { model: proModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('429')) {
        console.warn('Primary resume review model failed or was rate-limited. Switching to fallback model: gemini-1.5-flash');
        try {
           const { output } = await prompt(input, { model: flashModel });
           return output!;
        } catch (fallbackError: any) {
            console.error("Fallback resume review model also failed:", fallbackError);
            throw fallbackError;
        }
      } else {
         console.error("An unexpected error occurred during resume review generation:", error);
         throw error;
      }
    }
  }
);
