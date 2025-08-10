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

export async function aiCareerChatbot(input: AICareerChatbotInput): Promise<AICareerChatbotOutput> {
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
    outputSchema: AICareerChatbotOutputSchema,
  },
  async (input) => {
    try {
      console.log('Attempting to use primary model for chatbot: gemini-1.5-pro');
      const { output } = await prompt(input, { model: proModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('429')) {
        console.warn('Primary chatbot model failed or was rate-limited. Switching to fallback model: gemini-1.5-flash');
        try {
           const { output } = await prompt(input, { model: flashModel });
           return output!;
        } catch (fallbackError: any) {
            console.error("Fallback chatbot model also failed:", fallbackError);
            throw fallbackError;
        }
      } else {
         console.error("An unexpected error occurred during chatbot response generation:", error);
         throw error;
      }
    }
  }
);
