
'use server';

/**
 * @fileOverview An AI chatbot for providing career-related advice and guidance.
 *
 * - aiCareerChatbot - A function that handles the chatbot interactions.
 * - AICareerChatbotInput - The input type for the aiCareerChatbot function.
 * - AICareerChatbotOutput - The return type for the aiCareerChatbot function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
import {z} from 'genkit';

const AICareerChatbotInputSchema = z.object({
  query: z.string().describe('The user query related to career advice.'),
});
export type AICareerChatbotInput = z.infer<typeof AICareerChatbotInputSchema>;

const AICareerChatbotOutputSchema = z.object({
  response: z.string().describe('The response from the AI chatbot.'),
});
export type AICareerChatbotOutput = z.infer<typeof AICareerChatbotOutputSchema>;

export async function aiCareerChatbot(input: AICareerChatbotInput): Promise<AICareerChatbotOutput | { error: true; message: string }> {
  return aiCareerChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCareerChatbotPrompt',
  input: {schema: AICareerChatbotInputSchema},
  output: {schema: AICareerChatbotOutputSchema},
  prompt: `You are a helpful AI career counselor chatbot. A user is asking for career advice.

  Respond to the following query:
  {{query}}

  Provide clear, concise, and actionable advice.
  If the query is not career-related, politely decline to answer.
  If the query is about how to use the platform, provide guidance.`,
});

const aiCareerChatbotFlow = ai.defineFlow(
  {
    name: 'aiCareerChatbotFlow',
    inputSchema: AICareerChatbotInputSchema,
    outputSchema: z.union([AICareerChatbotOutputSchema, z.object({ error: z.literal(true), message: z.string() })]),
  },
  async (input) => {
    try {
      const { output } = await prompt(input, { model: proModel });
      if (!output) {
        throw new Error('AI response was empty.');
      }
      return output;
    } catch (error: any) {
      console.error('Error with proModel:', error.message);
      try {
        const { output } = await prompt(input, { model: flashModel });
        if (!output) {
          throw new Error('AI response was empty on fallback.');
        }
        return output;
      } catch (fallbackError: any) {
        console.error('Error with flashModel:', fallbackError.message);
        return { error: true, message: `An unexpected error occurred: ${fallbackError.message}` };
      }
    }
  }
);
