import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
});

export const proModel = googleAI.model('gemini-pro');
export const flashModel = googleAI.model('gemini-1.5-flash');
