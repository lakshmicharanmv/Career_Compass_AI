
'use server';

/**
 * @fileOverview Provides a comprehensive career advisory for professionals based on their work experience, goals, and optional assessment.
 * This flow is designed to be industry-agnostic.
 *
 * - getProfessionalAdvice - A function that takes a professional's profile and returns a tailored career roadmap.
 * - ProfessionalCareerAdvisorInput - The input type for the getProfessionalAdvice function.
 * - ProfessionalCareerAdvisorOutput - The return type for the getProfessionalAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const ProfessionalCareerAdvisorInputSchema = z.object({
  workExperience: z.array(z.object({
    role: z.string().describe('The job title.'),
    company: z.string().describe('The company or organization name.'),
    duration: z.string().describe('The duration of employment in this role (e.g., "2018 - 2022").'),
    achievements: z.string().describe('Key responsibilities and achievements in this role.'),
  })).describe("An array of the user's work experiences."),
  currentIndustry: z.string().describe("The user's current industry (e.g., Healthcare, Technology, Law)."),
  careerGoals: z.array(z.string()).describe("The user's career goals (e.g., 'promotion', 'switch', 'upskill')."),
  assessmentScore: z.number().optional().describe("Score from the career assessment test (percentage), if taken."),
});
export type ProfessionalCareerAdvisorInput = z.infer<typeof ProfessionalCareerAdvisorInputSchema>;

const ProfessionalCareerAdvisorOutputSchema = z.object({
  nextRoles: z.array(z.object({
    role: z.string().describe("Recommended next-level job role."),
    reason: z.string().describe("Reason for recommending this role based on the user's profile and goals."),
  })).describe("A list of recommended job roles for promotion or advancement."),
  certifications: z.array(z.object({
    name: z.string().describe("Recommended higher studies course or certification."),
    reason: z.string().describe("Reason for recommending this course for upskilling."),
  })).describe("A list of recommended certifications or courses."),
    careerSwitches: z.array(z.object({
    newRole: z.string().describe("A potential new role in a different industry."),
    newIndustry: z.string().describe("The new industry for the career switch."),
    reason: z.string().describe("Reason for suggesting this career switch, highlighting transferable skills."),
  })).describe("A list of potential career switch opportunities."),
});
export type ProfessionalCareerAdvisorOutput = z.infer<typeof ProfessionalCareerAdvisorOutputSchema>;


export async function getProfessionalAdvice(input: ProfessionalCareerAdvisorInput): Promise<ProfessionalCareerAdvisorOutput> {
  return professionalCareerAdvisorFlow(input);
}

const professionalCareerAdvisorPrompt = ai.definePrompt({
  name: 'professionalCareerAdvisorPrompt',
  input: {schema: ProfessionalCareerAdvisorInputSchema},
  output: {schema: ProfessionalCareerAdvisorOutputSchema},
  prompt: `You are an expert career advisor and strategist for professionals across ALL industries in India (e.g., IT, Healthcare, Law, Arts, Engineering, Education, Finance, etc.).
  Your task is to provide a personalized and actionable career roadmap based on the user's detailed profile.

  USER'S PROFILE:
  - Current Industry: {{{currentIndustry}}}

  - Work Experience:
  {{#each workExperience}}
  - Role: {{{this.role}}} at {{{this.company}}} ({{{this.duration}}})
    Achievements: {{{this.achievements}}}
  {{/each}}
  
  - Stated Career Goals: {{{careerGoals}}}

  {{#if assessmentScore}}
  - Professional Skills Assessment Score: {{{assessmentScore}}}%
  This test evaluated their general aptitude and knowledge of industry trends. A higher score indicates strong potential.
  {{/if}}

  INSTRUCTIONS:
  Analyze the user's entire profile and generate a tailored roadmap. Your recommendations must be specific, actionable, and directly relevant to the user's industry and goals.

  1.  **Recommended Next Roles**: If the user wants a promotion, suggest 2-3 logical next-level roles in their current career path. For each role, provide a concise reason.
      - Example for a Civil Engineer: "Senior Project Engineer" or "Structural Design Manager".
      - Example for a Teacher: "Head of Department" or "Academic Coordinator".

  2.  **Recommended Certifications & Courses**: If the user wants to upskill, suggest 2-3 specific, valuable certifications or courses. For each, explain how it aligns with their goals.
      - Example for a Graphic Designer: "Google UX Design Professional Certificate to transition into UI/UX."
      - Example for an Accountant: "Certified Public Accountant (CPA) or Financial Modeling & Valuation Analyst (FMVA) to move into financial analysis."

  3.  **Potential Career Switches**: If the user wants a career change, suggest 1-2 realistic career switches. For each, specify the new role and industry, and explain why it's a good fit based on their transferable skills.
      - Example for a Journalist: "Content Strategist in the Marketing industry, leveraging your storytelling and research skills."
      - Example for a Lawyer: "Policy Advisor for a non-profit, using your legal analysis and advocacy skills."

  Be extremely practical and avoid generic advice. The output must be a structured JSON object. If a particular section isn't relevant to the user's goals, return an empty array for it.
  `,
});


const professionalCareerAdvisorFlow = ai.defineFlow(
  {
    name: 'professionalCareerAdvisorFlow',
    inputSchema: ProfessionalCareerAdvisorInputSchema,
    outputSchema: ProfessionalCareerAdvisorOutputSchema,
  },
  async (input) => {
    const primaryModel = googleAI.model('gemini-pro');
    const fallbackModel = googleAI.model('gemini-1.5-flash');
    
    try {
      console.log('Attempting to use primary model: gemini-pro');
      const { output } = await professionalCareerAdvisorPrompt(input, { model: primaryModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        console.warn('Primary model failed. Switching to fallback model: gemini-1.5-flash');
        try {
           const { output } = await professionalCareerAdvisorPrompt(input, { model: fallbackModel });
           return output!;
        } catch (fallbackError: any) {
            console.error("Fallback model also failed:", fallbackError);
            throw fallbackError;
        }
      } else {
         console.error("An unexpected error occurred:", error);
         throw error;
      }
    }
  }
);
    
