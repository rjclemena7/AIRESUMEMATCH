
"use client";

import React, { useState, useTransition, useEffect, useRef, useActionState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { handleResumeTailor, handleJobMatch, handleSkillsGap, handleCareerPath } from './actions';
import type { JobMatcherOutput } from '@/ai/flows/job-matcher';
import type { ResumeTailorOutput } from '@/ai/flows/resume-tailor';
import type { SkillsGapOutput } from '@/ai/flows/skills-gap';
import type { CareerPathOutput } from '@/ai/flows/career-path';
import { Sparkles, Target, Lightbulb, GraduationCap, Briefcase, FileText, Bot, X } from 'lucide-react';

const CareerCompassLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
    <path d="m12 15-4-4 1.5-3 5 1 1.5 3z" />
    <path d="M12 12v.01" />
  </svg>
);

export default function CareerCompassPage() {
    const { toast } = useToast();
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeFileUri, setResumeFileUri] = useState<string | null>(null);
    const [resumeFileName, setResumeFileName] = useState<string | null>(null);

    const [tailorState, tailorAction] = useActionState(handleResumeTailor, { data: null, error: null });
    const [matchState, matchAction] = useActionState(handleJobMatch, { data: null, error: null });
    const [skillsState, skillsAction] = useActionState(handleSkillsGap, { data: null, error: null });
    const [pathState, pathAction] = useActionState(handleCareerPath, { data: null, error: null });

    const [isTailorPending, startTailorTransition] = useTransition();
    const [isMatchPending, startMatchTransition] = useTransition();
    const [isSkillsPending, startSkillsTransition] = useTransition();
    const [isPathPending, startPathTransition] = useTransition();
    
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const states = [tailorState, matchState, skillsState, pathState];
        states.forEach(state => {
            if (state.error) {
                toast({ variant: "destructive", title: "Error", description: state.error });
            }
        });
    }, [tailorState, matchState, skillsState, pathState, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUri = e.target?.result as string;
                setResumeFileUri(dataUri);
                setResumeFileName(file.name);
                setResume(''); // Clear the textarea when a file is uploaded
            };
            reader.readAsDataURL(file);
        }
    };

    const clearResumeFile = () => {
        setResumeFileUri(null);
        setResumeFileName(null);
        const fileInput = document.getElementById('resume-file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleAction = (action: (formData: FormData) => void, startTransition: React.TransitionStartFunction) => {
        if (!formRef.current) return;
        startTransition(() => {
            const formData = new FormData(formRef.current!);
            action(formData);
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <CareerCompassLogo className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">CareerCompass</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-6">
                <form ref={formRef} className="grid md:grid-cols-2 gap-6">
                    <input type="hidden" name="resumeFileUri" value={resumeFileUri || ''} />
                    {/* Left Column: Inputs */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText /> Your Resume</CardTitle>
                                <CardDescription>Paste your resume content below or upload a file. The AI will examine the content.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    id="resume-file-input"
                                    type="file"
                                    name="resumeFile"
                                    onChange={handleFileChange}
                                    className="text-sm"
                                    accept=".pdf,.doc,.docx,.txt"
                                />

                                {resumeFileName && (
                                    <div className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                                        <span className="truncate">{resumeFileName}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearResumeFile}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                <div className="relative flex py-1 items-center">
                                    <div className="flex-grow border-t border-muted-foreground/20"></div>
                                    <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
                                    <div className="flex-grow border-t border-muted-foreground/20"></div>
                                </div>

                                <Textarea
                                    name="resume"
                                    placeholder="Paste your full resume here..."
                                    className="h-60 resize-none"
                                    value={resume}
                                    onChange={(e) => {
                                        setResume(e.target.value);
                                        if (resumeFileName) {
                                           clearResumeFile();
                                        }
                                    }}
                                    disabled={!!resumeFileUri}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Briefcase /> Job Description</CardTitle>
                                <CardDescription>Paste the job description for the role you're interested in.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    name="jobDescription"
                                    placeholder="Paste the job description here..."
                                    className="h-80 resize-none"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: AI Outputs */}
                    <div className="flex flex-col gap-6">
                         <Tabs defaultValue="tailor" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="tailor"><Sparkles className="mr-2 h-4 w-4"/>Tailor</TabsTrigger>
                                <TabsTrigger value="match"><Target className="mr-2 h-4 w-4"/>Match</TabsTrigger>
                                <TabsTrigger value="skills"><Lightbulb className="mr-2 h-4 w-4"/>Skills Gap</TabsTrigger>
                                <TabsTrigger value="path"><GraduationCap className="mr-2 h-4 w-4"/>Career Path</TabsTrigger>
                            </TabsList>
                            <TabsContent value="tailor" asChild>
                                <Card className="mt-2">
                                    <CardHeader>
                                        <CardTitle>AI Resume Tailor</CardTitle>
                                        <CardDescription>Get AI-powered suggestions to align your resume with the job description.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isTailorPending && (
                                            <div className="flex items-center justify-center p-8 space-x-2">
                                                <Bot className="h-6 w-6 animate-bounce" />
                                                <p>Tailoring your resume...</p>
                                            </div>
                                        )}
                                        {!isTailorPending && tailorState.data && (
                                            <div className="p-4 bg-secondary/50 rounded-lg border">
                                                <h4 className="font-semibold mb-2">Tailored Bullet Points:</h4>
                                                <p className="whitespace-pre-wrap text-sm">{tailorState.data.tailoredBulletPoints}</p>
                                            </div>
                                        )}
                                        {!isTailorPending && !tailorState.data && (
                                             <div className="text-center text-muted-foreground p-8">
                                                <Sparkles className="mx-auto h-12 w-12 mb-4" />
                                                <p>Your tailored resume points will appear here.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                        <Button type="button" onClick={() => handleAction(tailorAction, startTailorTransition)} disabled={isTailorPending || !(resume || resumeFileUri) || !jobDescription} className="w-full">
                                            <Sparkles className="mr-2 h-4 w-4"/> {isTailorPending ? "Tailoring..." : "Tailor My Resume"}
                                        </Button>
                                    </div>
                                </Card>
                            </TabsContent>
                            <TabsContent value="match" asChild>
                                <Card className="mt-2">
                                    <CardHeader>
                                        <CardTitle>Job Matching Engine</CardTitle>
                                        <CardDescription>See how well your resume matches the job requirements and get feedback.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                         {isMatchPending && (
                                            <div className="flex items-center justify-center p-8 space-x-2">
                                                <Bot className="h-6 w-6 animate-spin" />
                                                <p>Analyzing job match...</p>
                                            </div>
                                        )}
                                        {!isMatchPending && matchState.data && (
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <h4 className="font-semibold">Match Score</h4>
                                                        <span className="font-bold text-primary">{matchState.data.jobMatchScore}%</span>
                                                    </div>
                                                    <Progress value={matchState.data.jobMatchScore} />
                                                </div>
                                                <div className="p-4 bg-secondary/50 rounded-lg border">
                                                    <h4 className="font-semibold mb-2">AI Feedback:</h4>
                                                    <p className="text-sm">{matchState.data.feedback}</p>
                                                </div>
                                            </div>
                                        )}
                                        {!isMatchPending && !matchState.data && (
                                            <div className="text-center text-muted-foreground p-8">
                                                <Target className="mx-auto h-12 w-12 mb-4" />
                                                <p>Your job match score and feedback will appear here.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                        <Button type="button" onClick={() => handleAction(matchAction, startMatchTransition)} disabled={isMatchPending || !(resume || resumeFileUri) || !jobDescription} className="w-full">
                                            <Target className="mr-2 h-4 w-4"/> {isMatchPending ? "Analyzing..." : "Check Job Match"}
                                        </Button>
                                    </div>
                                </Card>
                            </TabsContent>
                             <TabsContent value="skills">
                                <Card className="mt-2">
                                    <CardHeader>
                                        <CardTitle>Skills Gap Analysis</CardTitle>
                                        <CardDescription>Identify key skills you might be missing and get language suggestions.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 min-h-[20rem] flex flex-col justify-center">
                                        {isSkillsPending && (
                                            <div className="flex items-center justify-center p-8 space-x-2">
                                                <Bot className="h-6 w-6 animate-spin" />
                                                <p>Analyzing skills gap...</p>
                                            </div>
                                        )}
                                        {!isSkillsPending && skillsState.data && (
                                            <div className="space-y-4">
                                                <div className="p-4 border rounded-lg bg-secondary/50">
                                                    <h4 className="font-semibold mb-2">Matching Skills</h4>
                                                    {skillsState.data.matchingSkills.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {skillsState.data.matchingSkills.map((skill, i) => <Badge key={i} variant="secondary">{skill}</Badge>)}
                                                        </div>
                                                    ) : <p className="text-sm text-muted-foreground">No direct skill matches found.</p>}
                                                </div>
                                                <div className="p-4 border rounded-lg bg-secondary/50">
                                                    <h4 className="font-semibold mb-2">Potential Missing Skills</h4>
                                                    {skillsState.data.missingSkills.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {skillsState.data.missingSkills.map((skill, i) => <Badge key={i} variant="destructive">{skill}</Badge>)}
                                                        </div>
                                                    ) : <p className="text-sm text-muted-foreground">Great news! No major skill gaps detected.</p>}
                                                </div>
                                                <div className="p-4 border rounded-lg bg-secondary/50">
                                                    <h4 className="font-semibold mb-2">ATS-Friendly Language Tips</h4>
                                                    <p className="text-sm whitespace-pre-wrap">{skillsState.data.atsSuggestions}</p>
                                                </div>
                                            </div>
                                        )}
                                        {!isSkillsPending && !skillsState.data && (
                                            <div className="text-center text-muted-foreground p-8">
                                                <Lightbulb className="mx-auto h-12 w-12 mb-4" />
                                                <p>Your skills gap analysis will appear here.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                        <Button type="button" onClick={() => handleAction(skillsAction, startSkillsTransition)} disabled={isSkillsPending || !(resume || resumeFileUri) || !jobDescription} className="w-full">
                                            <Lightbulb className="mr-2 h-4 w-4"/> {isSkillsPending ? "Analyzing..." : "Analyze Skills Gap"}
                                        </Button>
                                    </div>
                                </Card>
                            </TabsContent>
                            <TabsContent value="path">
                                <Card className="mt-2">
                                    <CardHeader>
                                        <CardTitle>Career Path Recommendations</CardTitle>
                                        <CardDescription>Explore skills and certifications to advance your career, based on market trends.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 min-h-[20rem] flex flex-col justify-center">
                                        {isPathPending && (
                                            <div className="flex items-center justify-center p-8 space-x-2">
                                                <Bot className="h-6 w-6 animate-spin" />
                                                <p>Generating career path...</p>
                                            </div>
                                        )}
                                        {!isPathPending && pathState.data && (
                                             <div className="space-y-4">
                                                <div className="flex items-start gap-4 p-4 border rounded-lg">
                                                    <GraduationCap className="h-8 w-8 text-primary mt-1" />
                                                    <div>
                                                        <h4 className="font-semibold">In-Demand Certifications</h4>
                                                        <p className="text-sm text-muted-foreground">Boost your profile with these AI-suggested certifications.</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {pathState.data.suggestedCertifications.map((cert, i) => <Badge key={i} variant="secondary">{cert}</Badge>)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 p-4 border rounded-lg">
                                                    <Lightbulb className="h-8 w-8 text-primary mt-1" />
                                                    <div>
                                                        <h4 className="font-semibold">Top Skills to Learn</h4>
                                                        <p className="text-sm text-muted-foreground">Stay competitive by acquiring these AI-recommended skills.</p>
                                                         <div className="flex flex-wrap gap-2 mt-2">
                                                            {pathState.data.suggestedSkills.map((skill, i) => <Badge key={i} variant="secondary">{skill}</Badge>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {!isPathPending && !pathState.data && (
                                            <div className="text-center text-muted-foreground p-8">
                                                <GraduationCap className="mx-auto h-12 w-12 mb-4" />
                                                <p>Your career path recommendations will appear here.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                         <Button type="button" onClick={() => handleAction(pathAction, startPathTransition)} disabled={isPathPending || !(resume || resumeFileUri) || !jobDescription} className="w-full">
                                            <GraduationCap className="mr-2 h-4 w-4"/> {isPathPending ? "Recommending..." : "Recommend Career Path"}
                                        </Button>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </form>
            </main>
        </div>
    );
}
