
'use server';

/**
 * @fileOverview Provides a career progression map with upskilling suggestions and potential cross-industry shifts.
 *
 * - getCareerProgressionMap - A function that takes a current role and skills and returns a career progression map.
 * - CareerProgressionInput - The input type for the getCareerProgressionMap function.
 * - CareerProgressionOutput - The return type for the getCareerProgressionMap function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
import {z} from 'genkit';

const CareerProgressionInputSchema = z.object({
  currentRole: z.string().describe('Your current job title.'),
  skills: z.string().describe('A comma-separated list of your skills.'),
});
export type CareerProgressionInput = z.infer<typeof CareerProgressionInputSchema>;

const CareerProgressionOutputSchema = z.object({
  careerPath: z.array(
    z.object({
      role: z.string().describe('The next potential role in your career path.'),
      upskilling: z
        .array(z.string())
        .describe('Skills to acquire to move to the next role.'),
      crossIndustryShift: z
        .string()
        .optional()
        .describe('Potential cross-industry shift opportunities.'),
    })
  ).describe('A list of potential career paths, with upskilling suggestions and potential cross-industry shifts.'),
});
export type CareerProgressionOutput = z.infer<typeof CareerProgressionOutputSchema>;

export async function getCareerProgressionMap(input: CareerProgressionInput): Promise<CareerProgressionOutput | { error: true; message: string }> {
  return careerProgressionFlow(input);
}

const careerProgressionPrompt = ai.definePrompt({
  name: 'careerProgressionPrompt',
  input: {schema: CareerProgressionInputSchema},
  output: {schema: CareerProgressionOutputSchema},
  prompt: `You are an AI career advisor. Given the current role and skills of a professional, you will provide a career progression map with suggested upskilling and potential cross-industry shifts.

Current Role: {{{currentRole}}}
Skills: {{{skills}}}

Provide the career progression map in a structured format, suggesting specific skills to acquire for each potential role and highlighting any relevant cross-industry shift opportunities.
`,
});

const careerProgressionFlow = ai.defineFlow(
  {
    name: 'careerProgressionFlow',
    inputSchema: CareerProgressionInputSchema,
    outputSchema: z.union([CareerProgressionOutputSchema, z.object({ error: z.literal(true), message: z.string() })]),
  },
  async (input) => {
    try {
      const { output } = await careerProgressionPrompt(input, { model: proModel });
      return output!;
    } catch (error: any) {
      console.error('Error with proModel:', error.message);
      try {
        const { output } = await careerProgressionPrompt(input, { model: flashModel });
        return output!;
      } catch (fallbackError: any) {
        console.error('Error with flashModel:', fallbackError.message);
        return { error: true, message: `An unexpected error occurred: ${fallbackError.message}` };
      }
    }
  }
);
