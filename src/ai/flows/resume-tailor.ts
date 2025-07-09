// use server'
'use server';

/**
 * @fileOverview This file defines a Genkit flow for tailoring resume bullet points to match job requirements.
 *
 * - resumeTailor - A function that takes a job description and resume text, and returns tailored resume bullet points.
 * - ResumeTailorInput - The input type for the resumeTailor function.
 * - ResumeTailorOutput - The return type for the resumeTailor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeTailorInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The full text of the job description.'),
  resumeText: z.string().describe('The text of the resume to tailor.'),
});
export type ResumeTailorInput = z.infer<typeof ResumeTailorInputSchema>;

const ResumeTailorOutputSchema = z.object({
  tailoredBulletPoints: z
    .string()
    .describe('Tailored resume bullet points to match the job description.'),
});
export type ResumeTailorOutput = z.infer<typeof ResumeTailorOutputSchema>;

export async function resumeTailor(input: ResumeTailorInput): Promise<ResumeTailorOutput> {
  return resumeTailorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeTailorPrompt',
  input: {schema: ResumeTailorInputSchema},
  output: {schema: ResumeTailorOutputSchema},
  prompt: `You are an expert resume writer. You will tailor the provided resume text to match the requirements of the provided job description.

Job Description: {{{jobDescription}}}

Resume Text: {{{resumeText}}}

Please provide tailored resume bullet points that highlight the candidate's qualifications for the job.  Focus on quantifiable achievements and use keywords from the job description.
`,
});

const resumeTailorFlow = ai.defineFlow(
  {
    name: 'resumeTailorFlow',
    inputSchema: ResumeTailorInputSchema,
    outputSchema: ResumeTailorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
