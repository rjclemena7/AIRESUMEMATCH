'use server';
/**
 * @fileOverview A skills gap analysis AI agent.
 *
 * - skillsGap - A function that handles the skills gap analysis process.
 * - SkillsGapInput - The input type for the skillsGap function.
 * - SkillsGapOutput - The return type for the skillsGap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillsGapInputSchema = z.object({
  resumeText: z.string().describe("The text content of the user's resume."),
  jobDescription: z.string().describe('The text from a job description to compare to the resume.'),
});
export type SkillsGapInput = z.infer<typeof SkillsGapInputSchema>;

const SkillsGapOutputSchema = z.object({
  missingSkills: z.array(z.string()).describe('A list of key skills mentioned in the job description that are missing from the resume.'),
  matchingSkills: z.array(z.string()).describe('A list of key skills from the resume that are also mentioned in the job description.'),
  atsSuggestions: z.string().describe('Suggestions on how to phrase skills and experiences to be more friendly for Applicant Tracking Systems (ATS).'),
});
export type SkillsGapOutput = z.infer<typeof SkillsGapOutputSchema>;

export async function skillsGap(input: SkillsGapInput): Promise<SkillsGapOutput> {
  return skillsGapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillsGapPrompt',
  input: {schema: SkillsGapInputSchema},
  output: {schema: SkillsGapOutputSchema},
  prompt: `You are an expert career coach and resume writer. Analyze the provided resume and job description.
Identify the key skills required by the job description that are NOT present in the resume.
Also, identify the key skills that ARE present in both the resume and the job description.
Finally, provide concise, actionable advice on how to improve the resume's language to be more compatible with Applicant Tracking Systems (ATS), using examples based on the provided texts.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}`,
});

const skillsGapFlow = ai.defineFlow(
  {
    name: 'skillsGapFlow',
    inputSchema: SkillsGapInputSchema,
    outputSchema: SkillsGapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
