'use server';

/**
 * @fileOverview Recommends an academic stream (Science, Commerce, Arts) for a 10th-grade student
 * based on their marks and an optional assessment test score.
 *
 * - recommendStream - A function that takes marks and an optional test score and returns a stream recommendation.
 * - RecommendStreamInput - The input type for the recommendStream function.
 * - RecommendStreamOutput - The return type for the recommendStream function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendStreamInputSchema = z.object({
  marks: z.object({
    math: z.number().describe('Marks in Mathematics (out of 100).'),
    science: z.number().describe('Marks in Science (out of 100).'),
    english: z.number().describe('Marks in English (out of 100).'),
    social_studies: z.number().describe('Marks in Social Studies (out of 100).'),
    optional_subject: z.string().optional().describe('Name of the optional subject.'),
    optional_marks: z.number().optional().describe('Marks in the optional subject (out of 100).'),
  }),
  testScore: z.number().optional().describe('The score from the assessment test (percentage).'),
});
export type RecommendStreamInput = z.infer<typeof RecommendStreamInputSchema>;

const RecommendStreamOutputSchema = z.object({
  recommendedStream: z.enum(['Science', 'Commerce', 'Arts']).describe('The recommended academic stream.'),
  reasoning: z.string().describe('The reasoning behind the recommendation.'),
  careerPaths: z.array(z.string()).describe('A list of potential career paths for the recommended stream.'),
});
export type RecommendStreamOutput = z.infer<typeof RecommendStreamOutputSchema>;


export async function recommendStream(input: RecommendStreamInput): Promise<RecommendStreamOutput | { error: true; message: string }> {
  return recommendStreamFlow(input);
}

const recommendStreamPrompt = ai.definePrompt({
  name: 'recommendStreamPrompt',
  input: {schema: RecommendStreamInputSchema},
  output: {schema: RecommendStreamOutputSchema},
  prompt: `You are an expert career counselor for 10th-grade students in India. Your task is to recommend a suitable academic stream (Science, Commerce, or Arts) based on the student's marks and, if available, their assessment test score.

  Student's Marks (out of 100):
  - Math: {{{marks.math}}}
  - Science: {{{marks.science}}}
  - English: {{{marks.english}}}
  - Social Studies: {{{marks.social_studies}}}
  {{#if marks.optional_subject}}
  - {{marks.optional_subject}}: {{{marks.optional_marks}}}
  {{/if}}

  {{#if testScore}}
  Assessment Test Score: {{{testScore}}}%
  This test evaluated general aptitude in Math, Science, English, and Social Studies.
  {{/if}}

  Analyze the provided data and recommend the most suitable stream.
  
  General Guidelines:
  - **Science Stream**: Recommend if the student has high scores in Math and Science (typically > 80). Strong performance in these subjects is crucial for engineering, medicine, and pure sciences.
  - **Commerce Stream**: Recommend if the student shows good aptitude in Math and Social Studies. This stream leads to careers in finance, accounting, business, and management.
  - **Arts/Humanities Stream**: Recommend if the student excels in English, Social Studies, and shows creative or analytical thinking. This stream opens up diverse careers in law, journalism, public service, design, and academia.

  Your response must include:
  1.  **recommendedStream**: The single best stream ('Science', 'Commerce', or 'Arts').
  2.  **reasoning**: A clear, concise explanation for your recommendation, referencing the student's marks and test score (if provided).
  3.  **careerPaths**: A list of 3-5 promising career paths suitable for the recommended stream.
  `,
});


const recommendStreamFlow = ai.defineFlow(
  {
    name: 'recommendStreamFlow',
    inputSchema: RecommendStreamInputSchema,
    outputSchema: z.union([RecommendStreamOutputSchema, z.object({ error: z.literal(true), message: z.string() })]),
  },
  async (input) => {
    try {
      const { output } = await recommendStreamPrompt(input, { model: proModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('429')) {
        try {
           const { output } = await recommendStreamPrompt(input, { model: flashModel });
           return output!;
        } catch (fallbackError: any) {
            const fallbackMessage = (fallbackError.message || '') as string;
            if (fallbackMessage.includes('503') || fallbackMessage.includes('overloaded') || fallbackMessage.includes('429')) {
                return { error: true, message: 'Our AI is currently busy. Please try again in a few moments.' };
            }
            throw fallbackError;
        }
      } else {
         throw error;
      }
    }
  }
);
