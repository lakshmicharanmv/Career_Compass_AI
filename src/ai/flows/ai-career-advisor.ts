
'use server';

/**
 * @fileOverview AI-powered career path suggestion flow based on academic stage and interests.
 *
 * - aiCareerSuggestions - A function that suggests career paths.
 * - AICareerSuggestionsInput - The input type for the aiCareerSuggestions function.
 * - AICareerSuggestionsOutput - The return type for the aiCareerSuggestions function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
import {z} from 'genkit';

const AICareerSuggestionsInputSchema = z.object({
  academicStage: z
    .enum(['10th', '12th', 'UG'])
    .describe('The current academic stage of the user.'),
  interests: z
    .string()
    .describe('The interests of the user, comma separated if multiple.'),
});
export type AICareerSuggestionsInput = z.infer<
  typeof AICareerSuggestionsInputSchema
>;

const AICareerSuggestionsOutputSchema = z.object({
  careerPaths: z
    .string()
    .describe('Suggested career paths based on the input.'),
  relevantFieldsOfStudy: z
    .string()
    .describe('Relevant fields of study for the suggested career paths.'),
});
export type AICareerSuggestionsOutput = z.infer<
  typeof AICareerSuggestionsOutputSchema
>;

export async function aiCareerSuggestions(
  input: AICareerSuggestionsInput
): Promise<AICareerSuggestionsOutput | { error: true; message: string }> {
  return aiCareerSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCareerSuggestionsPrompt',
  input: {schema: AICareerSuggestionsInputSchema},
  output: {schema: AICareerSuggestionsOutputSchema},
  prompt: `You are an AI career advisor. Based on the student's academic stage and interests, suggest potential career paths and relevant fields of study.

Academic Stage: {{{academicStage}}}
Interests: {{{interests}}}

Respond in a structured JSON format with "careerPaths" and "relevantFieldsOfStudy" fields. Be concise and specific.
`,
});

const aiCareerSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiCareerSuggestionsFlow',
    inputSchema: AICareerSuggestionsInputSchema,
    outputSchema: z.union([AICareerSuggestionsOutputSchema, z.object({ error: z.literal(true), message: z.string() })]),
  },
  async (input) => {
    try {
      const { output } = await prompt(input, { model: proModel });
      return output!;
    } catch (error: any) {
      console.error('Error with proModel:', error.message);
      try {
        const { output } = await prompt(input, { model: flashModel });
        return output!;
      } catch (fallbackError: any) {
        console.error('Error with flashModel:', fallbackError.message);
        return { error: true, message: `An unexpected error occurred: ${fallbackError.message}` };
      }
    }
  }
);
