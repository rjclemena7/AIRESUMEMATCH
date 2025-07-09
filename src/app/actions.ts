'use server';

import { jobMatcher, type JobMatcherOutput } from '@/ai/flows/job-matcher';
import { resumeTailor, type ResumeTailorOutput } from '@/ai/flows/resume-tailor';
import { skillsGap, type SkillsGapOutput } from '@/ai/flows/skills-gap';
import { careerPath, type CareerPathOutput } from '@/ai/flows/career-path';
import { z } from 'zod';

const ActionSchema = z.object({
  resume: z.string().min(50, { message: 'Resume must be at least 50 characters.' }),
  jobDescription: z.string().min(50, { message: 'Job description must be at least 50 characters.' }),
});

export async function handleResumeTailor(
  prevState: { data: ResumeTailorOutput | null; error: string | null },
  formData: FormData
): Promise<{ data: ResumeTailorOutput | null; error: string | null }> {
  const validatedFields = ActionSchema.safeParse({
    resume: formData.get('resume'),
    jobDescription: formData.get('jobDescription'),
  });

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message;
    return { data: null, error: firstError };
  }
  
  try {
    const result = await resumeTailor({
      resumeText: validatedFields.data.resume,
      jobDescription: validatedFields.data.jobDescription,
    });
    return { data: result, error: null };
  } catch(e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to tailor resume: ${errorMessage}` };
  }
}

export async function handleJobMatch(
  prevState: { data: JobMatcherOutput | null; error: string | null },
  formData: FormData
): Promise<{ data: JobMatcherOutput | null; error: string | null }> {
  const validatedFields = ActionSchema.safeParse({
    resume: formData.get('resume'),
    jobDescription: formData.get('jobDescription'),
  });

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message;
    return { data: null, error: firstError };
  }
  
  try {
    const result = await jobMatcher({
      resumeText: validatedFields.data.resume,
      jobBoardText: validatedFields.data.jobDescription,
    });
    return { data: result, error: null };
  } catch(e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to match job: ${errorMessage}` };
  }
}

export async function handleSkillsGap(
  prevState: { data: SkillsGapOutput | null; error: string | null },
  formData: FormData
): Promise<{ data: SkillsGapOutput | null; error: string | null }> {
  const validatedFields = ActionSchema.safeParse({
    resume: formData.get('resume'),
    jobDescription: formData.get('jobDescription'),
  });

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message;
    return { data: null, error: firstError };
  }
  
  try {
    const result = await skillsGap({
      resumeText: validatedFields.data.resume,
      jobDescription: validatedFields.data.jobDescription,
    });
    return { data: result, error: null };
  } catch(e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to analyze skills gap: ${errorMessage}` };
  }
}

export async function handleCareerPath(
  prevState: { data: CareerPathOutput | null; error: string | null },
  formData: FormData
): Promise<{ data: CareerPathOutput | null; error: string | null }> {
  const validatedFields = ActionSchema.safeParse({
    resume: formData.get('resume'),
    jobDescription: formData.get('jobDescription'),
  });

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message;
    return { data: null, error: firstError };
  }
  
  try {
    const result = await careerPath({
      resumeText: validatedFields.data.resume,
      jobDescription: validatedFields.data.jobDescription,
    });
    return { data: result, error: null };
  } catch(e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to get career path: ${errorMessage}` };
  }
}
