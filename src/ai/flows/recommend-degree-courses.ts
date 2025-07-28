'use server';

/**
 * @fileOverview Recommends degree courses for a 12th-grade student based on their academic performance and stream.
 *
 * - recommendDegreeCourses - A function that takes 10th/12th marks and an optional test score and returns degree recommendations.
 * - RecommendDegreeCoursesInput - The input type for the recommendDegreeCourses function.
 * - RecommendDegreeCoursesOutput - The return type for the recommendDegreeCourses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendDegreeCoursesInputSchema = z.object({
  tenthPercentage: z.number().min(0).max(100).describe('Percentage obtained in 10th grade.'),
  twelfthStream: z.enum(['Science', 'Commerce', 'Arts']).describe('The academic stream taken in 12th grade.'),
  twelfthMarks: z.object({
    subject1: z.number().describe('Marks for the first main subject.'),
    subject2: z.number().describe('Marks for the second main subject.'),
    subject3: z.number().describe('Marks for the third main subject.'),
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
  - 12th Grade Marks:
    - Subject 1: {{{twelfthMarks.subject1}}}/100
    - Subject 2: {{{twelfthMarks.subject2}}}/100
    - Subject 3: {{{twelfthMarks.subject3}}}/100
    - English: {{{twelfthMarks.english}}}/100

  {{#if aptitudeTestScore}}
  - Aptitude Test Score: {{{aptitudeTestScore}}}%
  This test evaluated their aptitude in their chosen stream.
  {{/if}}

  Analyze the provided data and recommend 3-5 suitable degree courses.
  
  General Guidelines for Recommendations:
  - **Science Stream**: If performance is strong (especially in Math/Biology, Physics, Chemistry), suggest courses like Engineering (B.E./B.Tech), Medical (MBBS), Pharmacy (B.Pharm), or pure sciences (BSc).
  - **Commerce Stream**: If performance is strong (especially in Accounts, Business Studies, Economics), suggest courses like B.Com, BBA, BMS, or preparations for professional exams like CA Foundation.
  - **Arts/Humanities Stream**: If performance is strong (especially in History, Political Science, English), suggest courses like B.A. in various specializations, B.Ed (for teaching), Journalism (BJMC), or Design.

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
    const {output} = await recommendDegreeCoursesPrompt(input);
    return output!;
  }
);
