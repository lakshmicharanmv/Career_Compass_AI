
'use server';

/**
 * @fileOverview An AI resume reviewer flow that analyzes extracted text content.
 *
 * - reviewResume - A function that reviews resume text and suggests improvements.
 * - ReviewResumeInput - The input type for the reviewResume function.
 * - ReviewResumeOutput - The return type for the reviewResume function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewResumeInputSchema = z.object({
  resumeText: z.string().describe("The full text content extracted from the user's resume."),
});
export type ReviewResumeInput = z.infer<typeof ReviewResumeInputSchema>;

const ReviewResumeOutputSchema = z.object({
  atsScore: z.number().min(0).max(10).describe('The ATS score of the resume, from 0 to 10.'),
  improvements: z.array(z.string()).describe('A list of specific, actionable improvements for the resume.'),
  summary: z.string().describe("A brief summary of the resume's strengths and weaknesses."),
});
export type ReviewResumeOutput = z.infer<typeof ReviewResumeOutputSchema>;


export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput | { error: true; message: string }> {
  return reviewResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewResumePrompt',
  input: {schema: ReviewResumeInputSchema},
  output: {schema: ReviewResumeOutputSchema},
  prompt: `You are an expert resume reviewer and career coach with deep knowledge of Applicant Tracking Systems (ATS). Your task is to analyze the provided resume text and give it a comprehensive review.

  RESUME TEXT:
  {{{resumeText}}}

  INSTRUCTIONS:
  1.  **ATS Score**: Analyze the resume for ATS compatibility. Consider factors like standard formatting, keyword optimization (for common roles), clear headings (like "Work Experience", "Education", "Skills"), and contact information. Provide a score from 0 to 10, where 10 is perfectly optimized.
  2.  **Summary**: Provide a brief, balanced summary highlighting the resume's strongest points and its biggest areas for improvement.
  3.  **Actionable Improvements**: Provide a list of at least 5-7 specific, actionable improvements. The advice must be concrete.
      - Bad advice: "Improve your bullet points."
      - Good advice: "Rewrite bullet points to start with strong action verbs (e.g., 'Managed', 'Developed', 'Accelerated') and quantify achievements (e.g., 'Increased sales by 15%')."
      - Good advice: "Add a 'Skills' section that includes keywords relevant to your target job, such as 'Project Management' or 'Data Analysis'."
      - Good advice: "Ensure your contact information is complete and includes your LinkedIn profile URL."

  Return the analysis as a structured JSON object.
  `,
});

const reviewResumeFlow = ai.defineFlow(
  {
    name: 'reviewResumeFlow',
    inputSchema: ReviewResumeInputSchema,
    outputSchema: z.union([ReviewResumeOutputSchema, z.object({ error: z.literal(true), message: z.string() })]),
  },
  async (input) => {
    try {
      const { output } = await prompt(input, { model: proModel });
      if (!output) {
        throw new Error('AI response was empty.');
      }
      return output;
    } catch (error: any) {
      console.error('AI Error:', error.message);
      const errorMessage = error.message || '';
      if (errorMessage.includes('429')) {
          return { error: true, message: 'You have exceeded the API rate limit. Please try again in a few moments.' };
      }
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          return { error: true, message: 'Our AI is currently busy. Please try again in a few moments.' };
      }
      return { error: true, message: 'An unexpected error occurred while communicating with the AI. Please try again.' };
    }
  }
);
