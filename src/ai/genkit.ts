import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
});

export const proModel = googleAI.model('gemini-2.5-pro');
export const flashModel = googleAI.model('gemini-2.5-flash');
