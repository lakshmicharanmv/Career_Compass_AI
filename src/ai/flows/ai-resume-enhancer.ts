
'use server';

/**
 * @fileOverview An AI flow to enhance and complete resume details.
 *
 * - enhanceResumeDetails - A function that takes user-provided resume data and returns an enhanced version.
 * - ResumeDetailsInput - The input type for the enhanceResumeDetails function.
 * - ResumeDetailsOutput - The return type for the enhanceResumeDetails function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const educationSchema = z.object({
  degree: z.string().describe('Degree or qualification name'),
  institution: z.string().describe('Name of the school or university'),
  year: z.string().describe('Year of completion or expected completion'),
  score: z.string().optional().describe('Marks, percentage, or CGPA'),
});

const workExperienceSchema = z.object({
  role: z.string().describe('Job title or role'),
  company: z.string().describe('Company name'),
  duration: z.string().describe('Employment duration (e.g., "2020-Present")'),
  achievements: z.string().describe('Key responsibilities and achievements, preferably in bullet points.'),
});

const projectSchema = z.object({
    name: z.string().describe('Project name'),
    description: z.string().describe('A brief paragraph describing the project'),
    url: z.string().optional().describe('URL to the project if available'),
});

const ResumeDetailsInputSchema = z.object({
  fullName: z.string().describe("User's full name"),
  email: z.string().describe("User's email address"),
  phone: z.string().describe("User's 10-digit phone number"),
  linkedin: z.string().optional().describe('LinkedIn profile URL'),
  github: z.string().optional().describe('GitHub profile URL'),
  professionalTitle: z.string().describe('A professional title summarizing their role (e.g., "Software Engineer")'),
  careerObjective: z.string().describe('A 2-3 sentence career summary or objective'),
  education: z.array(educationSchema).describe('List of educational qualifications'),
  technicalSkills: z.string().optional().describe('Comma-separated list of technical skills'),
  softSkills: z.string().optional().describe('Comma-separated list of soft skills'),
  projects: z.array(projectSchema).optional().describe('List of projects'),
  workExperience: z.array(workExperienceSchema).optional().describe('List of work experiences'),
  extracurricular: z.string().optional().describe('List of achievements or extracurricular activities, one per line'),
});
export type ResumeDetailsInput = z.infer<typeof ResumeDetailsInputSchema>;

const ResumeDetailsOutputSchema = ResumeDetailsInputSchema;
export type ResumeDetailsOutput = z.infer<typeof ResumeDetailsOutputSchema>;


export async function enhanceResumeDetails(input: ResumeDetailsInput): Promise<ResumeDetailsOutput> {
  return enhanceResumeDetailsFlow(input);
}

const enhanceResumePrompt = ai.definePrompt({
  name: 'enhanceResumePrompt',
  input: {schema: ResumeDetailsInputSchema},
  output: {schema: ResumeDetailsOutputSchema},
  prompt: `You are an expert resume writer and ATS optimization expert. Your task is to take the provided resume data and enhance it to create a professional, polished, and complete resume.

  USER'S RESUME DATA:
  - Full Name: {{{fullName}}}
  - Email: {{{email}}}
  - Phone: {{{phone}}}
  - LinkedIn: {{{linkedin}}}
  - GitHub: {{{github}}}
  - Professional Title: {{{professionalTitle}}}
  - Career Objective: {{{careerObjective}}}
  
  - Education:
  {{#each education}}
  - Degree: {{{this.degree}}}, Institution: {{{this.institution}}}, Year: {{{this.year}}}, Score: {{{this.score}}}
  {{/each}}
  
  - Work Experience:
  {{#each workExperience}}
  - Role: {{{this.role}}}, Company: {{{this.company}}}, Duration: {{{this.duration}}}, Achievements: {{{this.achievements}}}
  {{/each}}

  - Projects:
  {{#each projects}}
  - Name: {{{this.name}}}, Description: {{{this.description}}}, URL: {{{this.url}}}
  {{/each}}

  - Skills:
    - Technical: {{{technicalSkills}}}
    - Soft: {{{softSkills}}}

  - Achievements/Extracurricular:
    {{{extracurricular}}}

  INSTRUCTIONS:
  1.  **Review All Sections**: Carefully analyze all the provided data.
  2.  **Identify and Fill Gaps**: If any information is missing, incomplete, or looks like a placeholder (e.g., "My School," "My College/University," "Completion Year"), fill it in with reasonable, professional-sounding, and relevant details.
  3.  **Correct and Refine**: Rewrite sentences to be more professional and impactful. For the 'achievements' field in work experience, ensure each point starts with a strong action verb. Ensure the career objective is concise and tailored. For achievements/extracurriculars, format them as clear, impactful bullet points.
  4.  **Refine Skills**: Critically review the technical and soft skills provided by the user. Correct any misspellings or formatting issues. **Do not add any new skills that the user has not provided.** Your role is to polish the existing list, not expand it.
  5.  **Do Not Remove Data**: Do not remove any data the user has provided. Your goal is to enhance, not delete.
  6.  **Return Full Object**: Return a complete JSON object in the specified output format, including both the original and the newly generated information. Ensure all fields are populated correctly. The output structure must exactly match the input structure.
  `,
});

const enhanceResumeDetailsFlow = ai.defineFlow(
  {
    name: 'enhanceResumeDetailsFlow',
    inputSchema: ResumeDetailsInputSchema,
    outputSchema: ResumeDetailsOutputSchema,
  },
  async (input) => {
    const primaryModel = googleAI.model('gemini-1.5-pro');
    const fallbackModel = googleAI.model('gemini-1.5-flash');

    try {
      console.log('Attempting to use primary model for resume enhancement: gemini-1.5-pro');
      const { output } = await enhanceResumePrompt(input, { model: primaryModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('429')) {
        console.warn('Primary resume enhancement model failed or was rate-limited. Switching to fallback model: gemini-1.5-flash');
        try {
           const { output } = await enhanceResumePrompt(input, { model: fallbackModel });
           return output!;
        } catch (fallbackError: any) {
            console.error("Fallback resume enhancement model also failed:", fallbackError);
            throw fallbackError;
        }
      } else {
         console.error("An unexpected error occurred during resume enhancement:", error);
         throw error;
      }
    }
  }
);
