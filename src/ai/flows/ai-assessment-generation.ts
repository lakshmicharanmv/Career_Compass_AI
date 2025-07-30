'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic multiple-choice questions (MCQs)
 * based on the user's level (student/professional) to assess their knowledge and provide personalized recommendations.
 *
 * @exports generateAssessmentQuestions - The main function to trigger the assessment question generation flow.
 * @exports AssessmentQuestionsInput - The input type for the generateAssessmentQuestions function.
 * @exports AssessmentQuestionsOutput - The output type for the generateAssessmentQuestions function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AssessmentQuestionsInputSchema = z.object({
  level: z
    .enum(['10th', '12th', 'UG', 'Pro'])
    .describe('The user\u2019s level of education or professional standing.'),
  topic: z.string().describe('The topic for which questions should be generated.'),
  numberOfQuestions: z
    .number()
    .min(10)
    .max(30)
    .default(20)
    .describe('The number of questions to generate (between 10 and 30).'),
});
export type AssessmentQuestionsInput = z.infer<typeof AssessmentQuestionsInputSchema>;

const AssessmentQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The multiple-choice question.'),
      options: z.array(z.string()).describe('The options for the multiple-choice question.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('An array of multiple-choice questions with options and correct answers.'),
});
export type AssessmentQuestionsOutput = z.infer<typeof AssessmentQuestionsOutputSchema>;

export async function generateAssessmentQuestions(input: AssessmentQuestionsInput): Promise<AssessmentQuestionsOutput> {
  return generateAssessmentQuestionsFlow(input);
}

const assessmentQuestionsPrompt = ai.definePrompt({
  name: 'assessmentQuestionsPrompt',
  input: {schema: AssessmentQuestionsInputSchema},
  output: {schema: AssessmentQuestionsOutputSchema},
  prompt: `You are an expert in creating multiple-choice questions for various levels of students and professionals.

  Based on the user's level and the topic, generate {{numberOfQuestions}} multiple-choice questions.
  Each question should have 4 options, with one correct answer.

  Level: {{{level}}}
  Topic: {{{topic}}}

  Format the output as a JSON object with a 'questions' array. Each object in the array must have the keys 'question', 'options' and 'correctAnswer'. The 'options' key is an array of strings.
  Ensure that the questions are relevant and appropriate for the specified level.`,
});

const generateAssessmentQuestionsFlow = ai.defineFlow(
  {
    name: 'generateAssessmentQuestionsFlow',
    inputSchema: AssessmentQuestionsInputSchema,
    outputSchema: AssessmentQuestionsOutputSchema,
  },
  async (input) => {
    const primaryModel = googleAI.model('gemini-1.5-pro');
    const fallbackModel = googleAI.model('gemini-1.5-flash');

    try {
      console.log('Attempting to use primary model for assessment: gemini-1.5-pro');
      const { output } = await assessmentQuestionsPrompt(input, { model: primaryModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('429')) {
        console.warn('Primary assessment model failed or was rate-limited. Switching to fallback model: gemini-1.5-flash');
        try {
           const { output } = await assessmentQuestionsPrompt(input, { model: fallbackModel });
           return output!;
        } catch (fallbackError: any) {
            console.error("Fallback assessment model also failed:", fallbackError);
            throw fallbackError;
        }
      } else {
         console.error("An unexpected error occurred during assessment generation:", error);
         throw error;
      }
    }
  }
);
