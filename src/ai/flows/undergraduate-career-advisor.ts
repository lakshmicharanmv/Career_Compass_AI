'use server';

/**
 * @fileOverview Recommends job roles and higher study options for undergraduate students.
 *
 * - recommendUndergraduateOptions - A function that provides career and academic recommendations.
 * - UndergraduateOptionsInput - The input type for the recommendUndergraduateOptions function.
 * - UndergraduateOptionsOutput - The return type for the recommendUndergraduateOptions function.
 */

import {ai, proModel, flashModel} from '@/ai/genkit';
import {z} from 'genkit';

const UndergraduateOptionsInputSchema = z.object({
  academics: z.object({
    tenthPercentage: z.number().describe("Percentage in 10th grade."),
    twelfthPercentage: z.number().describe("Percentage in 12th grade."),
    twelfthStream: z.enum(['Science', 'Commerce', 'Arts']).describe("Stream in 12th grade."),
    degreeName: z.string().describe("The name of the undergraduate degree (e.g., B.Tech, MBBS, BA)."),
    specialization: z.string().describe("The specialization or major in the degree."),
    currentGrade: z.number().describe("Current CGPA or Percentage in the degree."),
  }),
  skills: z.object({
    technical: z.string().describe("Comma-separated list of technical skills."),
    soft: z.string().describe("Comma-separated list of soft skills."),
  }),
  assessmentScore: z.number().optional().describe("Score from the career assessment test (percentage)."),
});
export type UndergraduateOptionsInput = z.infer<typeof UndergraduateOptionsInputSchema>;

const UndergraduateOptionsOutputSchema = z.object({
  jobRoles: z.array(z.object({
    role: z.string().describe("Recommended job role."),
    reason: z.string().describe("Reason for recommending this role based on the user's profile."),
  })).describe("A list of recommended job roles suitable for the user."),
  higherStudies: z.array(z.object({
    course: z.string().describe("Recommended higher studies course or certification."),
    reason: z.string().describe("Reason for recommending this course based on the user's profile."),
  })).describe("A list of recommended higher studies or certification options."),
});
export type UndergraduateOptionsOutput = z.infer<typeof UndergraduateOptionsOutputSchema>;


export async function recommendUndergraduateOptions(input: UndergraduateOptionsInput): Promise<UndergraduateOptionsOutput | { error: true; message: string }> {
  return recommendUndergraduateOptionsFlow(input);
}

const recommendUndergraduateOptionsPrompt = ai.definePrompt({
  name: 'recommendUndergraduateOptionsPrompt',
  input: {schema: UndergraduateOptionsInputSchema},
  output: {schema: UndergraduateOptionsOutputSchema},
  prompt: `You are an expert career counselor for undergraduate students from all domains in India (including Engineering, Medicine, Arts, Commerce, Law, Design, etc.).
  Your task is to recommend suitable job roles and higher study/certification options based on the student's complete academic profile, skills, and assessment test score (if available).

  Student's Profile:
  - 10th Grade Percentage: {{{academics.tenthPercentage}}}%
  - 12th Grade Percentage: {{{academics.twelfthPercentage}}}% (Stream: {{{academics.twelfthStream}}})
  - Degree: {{{academics.degreeName}}} in {{{academics.specialization}}}
  - Current Degree Score: {{{academics.currentGrade}}} (CGPA or %)

  Skills:
  - Technical: {{{skills.technical}}}
  - Soft: {{{skills.soft}}}

  {{#if assessmentScore}}
  - Career Assessment Test Score: {{{assessmentScore}}}%
  This test evaluated their core-subject knowledge and general aptitude. A higher score indicates strong potential in their field.
  {{/if}}

  Analyze the complete profile to provide two sets of recommendations:
  1.  **Job Roles**: Suggest 3-5 specific, domain-relevant job roles. For each role, provide a concise reason explaining why it's a good fit, considering their degree, specialization, skills, and academic performance.
  2.  **Higher Studies / Certifications**: Suggest 3-5 relevant options for further education or professional certification. For each option, provide a concise reason. Consider master's degrees (e.g., M.Tech, MBA, MS), professional exams (e.g., UPSC, PG Medical Entrance), or certifications that would add value to their profile.

  Your recommendations must be diverse and not limited to the IT field. Cover a wide range of possibilities relevant to the user's specific domain.
  `,
});


const recommendUndergraduateOptionsFlow = ai.defineFlow(
  {
    name: 'recommendUndergraduateOptionsFlow',
    inputSchema: UndergraduateOptionsInputSchema,
    outputSchema: z.union([UndergraduateOptionsOutputSchema, z.object({ error: z.literal(true), message: z.string() })]),
  },
  async (input) => {
    try {
      console.log('Attempting to use primary model for undergraduate options: gemini-1.5-pro');
      const { output } = await recommendUndergraduateOptionsPrompt(input, { model: proModel });
      return output!;
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('429')) {
        console.warn('Primary undergraduate options model failed or was rate-limited. Switching to fallback model: gemini-1.5-flash');
        try {
           const { output } = await recommendUndergraduateOptionsPrompt(input, { model: flashModel });
           return output!;
        } catch (fallbackError: any) {
            const fallbackMessage = (fallbackError.message || '') as string;
            console.error("Fallback undergraduate options model also failed:", fallbackError);
             if (fallbackMessage.includes('503') || fallbackMessage.includes('overloaded') || fallbackMessage.includes('429')) {
                return { error: true, message: 'Our AI is currently busy. Please try again in a few moments.' };
            }
            throw fallbackError;
        }
      } else {
         console.error("An unexpected error occurred during undergraduate options generation:", error);
         throw error;
      }
    }
  }
);
