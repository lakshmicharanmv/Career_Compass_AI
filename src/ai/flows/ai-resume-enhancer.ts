
'use server';

/**
 * @fileOverview An AI flow to enhance and complete resume details.
 *
 * - enhanceResumeDetails - A function that takes user-provided resume data and returns an enhanced version.
 * - ResumeDetailsInput - The input type for the enhanceResumeDetails function.
 * - ResumeDetailsOutput - The return type for the enhanceResumeDetails function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
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
    techStack: z.string().optional().describe('Comma-separated list of technologies used'),
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
  prompt: `You are an expert resume writer and ATS optimization specialist. Your task is to take the provided raw resume data and transform it into a professional, polished, and complete resume, ready for job applications. The final resume should be concise enough to fit on a single page.

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
  - Name: {{{this.name}}}, Description: {{{this.description}}}, Tech Stack: {{{this.techStack}}}, URL: {{{this.url}}}
  {{/each}}

  - Skills:
    - Technical: {{{technicalSkills}}}
    - Soft: {{{softSkills}}}

  - Achievements/Extracurricular:
    {{{extracurricular}}}

  INSTRUCTIONS (Follow these strictly):

  1.  **Content Validation & Enhancement**:
      - **Correct**: If you find any obvious errors (e.g., "B.Tch" instead of "B.Tech"), correct them.
      - **Expand for Completeness**: If the overall resume feels sparse or a section is too brief, expand upon it with realistic, industry-appropriate details.
        - **Career Objective**: If the objective is short, expand it to be a compelling 2-3 sentence summary that highlights the user's key strengths and career ambitions.
        - **Project Description**: If a project description is brief, elaborate on it. Describe the project's purpose, what the user's role was, and the outcome. **Limit the description to a maximum of 4-5 lines.**
      - **Fill Gaps**: If any key information looks like a placeholder (e.g., "My University," "My Project Name"), replace it with professional-sounding and relevant examples that fit the user's profile.

  2.  **ATS Optimization & Formatting**:
      - **Keywords**: Ensure the resume includes relevant keywords for the user's professional title and industry.
      - **Formatting**: Use clear, standard section headings. 
      - **Bullet Points**: For 'achievements' in work experience, 'description' in projects, and 'extracurricular' activities, rewrite them as impactful bullet points. Each bullet point should start with a strong action verb (e.g., "Led," "Engineered," "Accelerated," "Implemented").
      - **Quantify**: Where possible, add measurable outcomes to achievements (e.g., "Increased user engagement by 25%," "Reduced server costs by 10%").
      - **Alignment**: Ensure that all bullet points and paragraphs are neatly aligned. If a line starts at a certain position, the next line should start directly below it.

  3.  **Readability and Professional Tone**:
      - Rewrite sentences to be concise, professional, and action-oriented.
      - Ensure the career objective is sharp and tailored to the user's profile.

  4.  **Skills Refinement**:
      - **Technical Skills**: Review the user-provided technical skills. Correct any misspellings or formatting issues (e.g., ensure they are neatly comma-separated). **Crucially, do not add any new skills.** Your role is to polish the existing list provided by the user, not to invent new skills they may not have.
      - **Tech Stack**: For each project, **only use the tech stack provided by the user**. Do not invent or add a tech stack if it is not provided. Simply format the provided list cleanly.

  5.  **Final Output**:
      - Return a complete JSON object in the specified output format.
      - Ensure every field is populated correctly, including both the original and the newly enhanced information.
      - The output structure must exactly match the input structure. Do not remove any fields, even if they were empty in the input.
  `,
});

const enhanceResumeDetailsFlow = ai.defineFlow(
  {
    name: 'enhanceResumeDetailsFlow',
    inputSchema: ResumeDetailsInputSchema,
    outputSchema: ResumeDetailsOutputSchema,
  },
  async (input) => {
    try {
      console.log('Attempting to use primary model for resume enhancement: gemini-1.5-pro');
      const { output } = await enhanceResumePrompt(input, { model: proModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('429')) {
        console.warn('Primary resume enhancement model failed or was rate-limited. Switching to fallback model: gemini-1.5-flash');
        try {
           const { output } = await enhanceResumePrompt(input, { model: flashModel });
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
