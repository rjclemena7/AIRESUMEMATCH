// src/ai/flows/job-matcher.ts
'use server';
/**
 * @fileOverview A job matching AI agent.
 *
 * - jobMatcher - A function that handles the job matching process.
 * - JobMatcherInput - The input type for the jobMatcher function.
 * - JobMatcherOutput - The return type for the jobMatcher function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobMatcherInputSchema = z.object({
  resumeText: z.string().optional().describe('The text content of the user\'s resume.'),
  resumeFileUri: z.string().optional().describe("A resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  jobBoardText: z.string().describe('The text from a job board to compare to the resume.'),
});
export type JobMatcherInput = z.infer<typeof JobMatcherInputSchema>;

const JobMatcherOutputSchema = z.object({
  jobMatchScore: z.number().describe('A score representing how well the job matches the resume. Higher is better.'),
  feedback: z.string().describe('Feedback on why the job was scored the way it was.'),
});
export type JobMatcherOutput = z.infer<typeof JobMatcherOutputSchema>;

export async function jobMatcher(input: JobMatcherInput): Promise<JobMatcherOutput> {
  return jobMatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jobMatcherPrompt',
  input: {schema: JobMatcherInputSchema},
  output: {schema: JobMatcherOutputSchema},
  prompt: `You are an expert career coach. You will be provided with a resume and a job description. You will compare the two and provide a score from 0 to 100 representing how well the job matches the resume. You will also provide feedback on why the job was scored the way it was.

{{#if resumeText}}
Resume:
{{{resumeText}}}
{{else}}
The user has uploaded their resume as a file. Analyze the content of this file as the resume.
Resume File: {{media url=resumeFileUri}}
{{/if}}

Job Description:
{{{jobBoardText}}}`,
});

const jobMatcherFlow = ai.defineFlow(
  {
    name: 'jobMatcherFlow',
    inputSchema: JobMatcherInputSchema,
    outputSchema: JobMatcherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
