'use server';

/**
 * @fileOverview Recommends degree courses for a 12th-grade student based on their academic performance and stream.
 *
 * - recommendDegreeCourses - A function that takes 10th/12th marks and an optional test score and returns degree recommendations.
 * - RecommendDegreeCoursesInput - The input type for the recommendDegreeCourses function.
 * - RecommendDegreeCoursesOutput - The return type for the recommendDegreeCourses function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const RecommendDegreeCoursesInputSchema = z.object({
  tenthPercentage: z.number().min(0).max(100).describe('Percentage obtained in 10th grade.'),
  twelfthStream: z.enum(['Science', 'Commerce', 'Arts']).describe('The academic stream taken in 12th grade.'),
  twelfthMarks: z.object({
    physics: z.number().optional().describe('Marks for Physics (Science stream).'),
    chemistry: z.number().optional().describe('Marks for Chemistry (Science stream).'),
    math: z.number().optional().describe('Marks for Math (Science/Commerce stream).'),
    biology: z.number().optional().describe('Marks for Biology (Science stream).'),
    accounts: z.number().optional().describe('Marks for Accounts (Commerce stream).'),
    business_studies: z.number().optional().describe('Marks for Business Studies (Commerce stream).'),
    economics: z.number().optional().describe('Marks for Economics (Commerce stream).'),
    history: z.number().optional().describe('Marks for History (Arts stream).'),
    political_science: z.number().optional().describe('Marks for Political Science (Arts stream).'),
    sociology_psychology: z.number().optional().describe('Marks for Sociology/Psychology (Arts stream).'),
    english: z.number().describe('Marks for English.'),
  }).describe('Marks obtained in 12th-grade subjects for the selected stream.'),
  aptitudeTestScore: z.number().optional().describe('The score from the stream-based aptitude test (percentage).'),
});
export type RecommendDegreeCoursesInput = z.infer<typeof RecommendDegreeCoursesInputSchema>;

const RecommendDegreeCoursesOutputSchema = z.object({
  recommendedCourses: z.array(z.string()).describe('A list of 3-5 recommended degree courses.'),
  reasoning: z.string().describe('The reasoning behind the recommendations, based on the provided academic data.'),
});
export type RecommendDegreeCoursesOutput = z.infer<typeof RecommendDegreeCoursesOutputSchema>;


export async function recommendDegreeCourses(input: RecommendDegreeCoursesInput): Promise<RecommendDegreeCoursesOutput> {
  return recommendDegreeCoursesFlow(input);
}

const recommendDegreeCoursesPrompt = ai.definePrompt({
  name: 'recommendDegreeCoursesPrompt',
  input: {schema: RecommendDegreeCoursesInputSchema},
  output: {schema: RecommendDegreeCoursesOutputSchema},
  prompt: `You are an expert career counselor for 12th-grade students in India. Your task is to recommend suitable degree courses based on the student's academic performance.

  Student's Academic Data:
  - 10th Grade Percentage: {{{tenthPercentage}}}%
  - 12th Grade Stream: {{{twelfthStream}}}
  - 12th Grade Marks (out of 100):
    {{#if twelfthMarks.physics}} - Physics: {{{twelfthMarks.physics}}}{{/if}}
    {{#if twelfthMarks.chemistry}} - Chemistry: {{{twelfthMarks.chemistry}}}{{/if}}
    {{#if twelfthMarks.math}} - Math: {{{twelfthMarks.math}}}{{/if}}
    {{#if twelfthMarks.biology}} - Biology: {{{twelfthMarks.biology}}}{{/if}}
    {{#if twelfthMarks.accounts}} - Accounts: {{{twelfthMarks.accounts}}}{{/if}}
    {{#if twelfthMarks.business_studies}} - Business Studies: {{{twelfthMarks.business_studies}}}{{/if}}
    {{#if twelfthMarks.economics}} - Economics: {{{twelfthMarks.economics}}}{{/if}}
    {{#if twelfthMarks.history}} - History: {{{twelfthMarks.history}}}{{/if}}
    {{#if twelfthMarks.political_science}} - Political Science: {{{twelfthMarks.political_science}}}{{/if}}
    {{#if twelfthMarks.sociology_psychology}} - Sociology/Psychology: {{{twelfthMarks.sociology_psychology}}}{{/if}}
    - English: {{{twelfthMarks.english}}}

  {{#if aptitudeTestScore}}
  - Aptitude Test Score: {{{aptitudeTestScore}}}%
  This test evaluated their aptitude in their chosen stream.
  {{/if}}

  Analyze the provided data and recommend 3-5 suitable degree courses.
  
  General Guidelines for Recommendations:
  - **Science Stream**: 
    - If performance is strong in Math, Physics, and Chemistry, suggest Engineering courses (B.E./B.Tech) in relevant fields.
    - If performance is strong in Biology, Physics, and Chemistry, suggest Medical courses (MBBS, BDS), Pharmacy (B.Pharm), or Biotechnology.
    - If performance is balanced, suggest pure sciences (B.Sc.).
  - **Commerce Stream**: If performance is strong in Accounts, Business Studies, and Economics, suggest courses like B.Com, BBA, BMS, or preparations for professional exams like CA Foundation.
  - **Arts/Humanities Stream**: If performance is strong in History, Political Science, English, etc., suggest courses like B.A. in various specializations, B.Ed (for teaching), Journalism (BJMC), or Design.

  Your response must include:
  1.  **recommendedCourses**: A list of 3-5 suitable degree courses.
  2.  **reasoning**: A clear, concise explanation for your recommendations, referencing the student's academic performance.
  `,
});


const recommendDegreeCoursesFlow = ai.defineFlow(
  {
    name: 'recommendDegreeCoursesFlow',
    inputSchema: RecommendDegreeCoursesInputSchema,
    outputSchema: RecommendDegreeCoursesOutputSchema,
  },
  async input => {
    const {output} = await recommendDegreeCoursesPrompt(input, {
      model: googleAI.model('gemini-1.5-flash'),
    });
    return output!;
  }
);
