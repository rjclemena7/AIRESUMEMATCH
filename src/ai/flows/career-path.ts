'use server';
/**
 * @fileOverview A career path recommendation AI agent.
 *
 * - careerPath - A function that handles the career path recommendation process.
 * - CareerPathInput - The input type for the careerPath function.
 * - CareerPathOutput - The return type for the careerPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerPathInputSchema = z.object({
  resumeText: z.string().describe("The text content of the user's resume."),
  jobDescription: z.string().describe('The text from a job description that represents the target role.'),
});
export type CareerPathInput = z.infer<typeof CareerPathInputSchema>;

const CareerPathOutputSchema = z.object({
  suggestedCertifications: z.array(z.string()).describe('A list of relevant certifications to pursue for career advancement based on the target job.'),
  suggestedSkills: z.array(z.string()).describe('A list of skills to learn to become a stronger candidate for the target role and similar positions.'),
});
export type CareerPathOutput = z.infer<typeof CareerPathOutputSchema>;

export async function careerPath(input: CareerPathInput): Promise<CareerPathOutput> {
  return careerPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerPathPrompt',
  input: {schema: CareerPathInputSchema},
  output: {schema: CareerPathOutputSchema},
  prompt: `You are an expert career advisor. Based on the user's resume and a target job description, recommend a career path.
Suggest specific, in-demand certifications that would be valuable for this career trajectory.
Also, suggest the most important technical or soft skills to learn to advance in this field.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}`,
});

const careerPathFlow = ai.defineFlow(
  {
    name: 'careerPathFlow',
    inputSchema: CareerPathInputSchema,
    outputSchema: CareerPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
