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
  resumeText: z.string().optional().describe('The text of the resume to tailor.'),
  resumeFileUri: z.string().optional().describe("A resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
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

{{#if resumeText}}
Resume Text: {{{resumeText}}}
{{else}}
The user has uploaded their resume as a file. Analyze the content of this file as the resume.
Resume File: {{media url=resumeFileUri}}
{{/if}}

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
