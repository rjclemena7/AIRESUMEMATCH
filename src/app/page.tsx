"use client";

import React, { useState, useTransition, useEffect, useRef, useActionState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { handleResumeTailor, handleJobMatch } from './actions';
import type { JobMatcherOutput } from '@/ai/flows/job-matcher';
import type { ResumeTailorOutput } from '@/ai/flows/resume-tailor';
import { Sparkles, Target, Lightbulb, GraduationCap, Briefcase, FileText, Bot, AlertCircle } from 'lucide-react';

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


function SubmitButton({ children, icon }: { children: React.ReactNode, icon: React.ReactNode }) {
    // This hook is not available in this react version.
    // const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" >
            {icon}
            {children}
        </Button>
    );
}

export default function CareerCompassPage() {
    const { toast } = useToast();
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    const [tailorState, tailorAction] = useActionState(handleResumeTailor, { data: null, error: null });
    const [matchState, matchAction] = useActionState(handleJobMatch, { data: null, error: null });
    
    const [isTailorPending, startTailorTransition] = useTransition();
    const [isMatchPending, startMatchTransition] = useTransition();
    
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (tailorState.error) {
            toast({ variant: "destructive", title: "Error", description: tailorState.error });
        }
    }, [tailorState, toast]);

    useEffect(() => {
        if (matchState.error) {
            toast({ variant: "destructive", title: "Error", description: matchState.error });
        }
    }, [matchState, toast]);

    const handleTailorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startTailorTransition(() => {
            const formData = new FormData(e.currentTarget);
            tailorAction(formData);
        });
    };
    
    const handleMatchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startMatchTransition(() => {
            const formData = new FormData(e.currentTarget);
            matchAction(formData);
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
                    {/* Left Column: Inputs */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText /> Your Resume</CardTitle>
                                <CardDescription>Paste your resume content below. The more detailed, the better the AI can assist you.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    name="resume"
                                    placeholder="Paste your full resume here..."
                                    className="h-80 resize-none"
                                    value={resume}
                                    onChange={(e) => setResume(e.target.value)}
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
                                    <form onSubmit={handleTailorSubmit}>
                                        <input type="hidden" name="resume" value={resume} />
                                        <input type="hidden" name="jobDescription" value={jobDescription} />
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
                                            <Button type="submit" disabled={isTailorPending || !resume || !jobDescription} className="w-full">
                                                <Sparkles className="mr-2 h-4 w-4"/> {isTailorPending ? "Tailoring..." : "Tailor My Resume"}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </TabsContent>
                            <TabsContent value="match" asChild>
                                <Card className="mt-2">
                                    <form onSubmit={handleMatchSubmit}>
                                        <input type="hidden" name="resume" value={resume} />
                                        <input type="hidden" name="jobDescription" value={jobDescription} />
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
                                            <Button type="submit" disabled={isMatchPending || !resume || !jobDescription} className="w-full">
                                                <Target className="mr-2 h-4 w-4"/> {isMatchPending ? "Analyzing..." : "Check Job Match"}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </TabsContent>
                             <TabsContent value="skills">
                                <Card className="mt-2">
                                    <CardHeader>
                                        <CardTitle>Skills Gap Analysis</CardTitle>
                                        <CardDescription>Identify key skills you might be missing and get language suggestions.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 border rounded-lg bg-secondary/50">
                                            <h4 className="font-semibold mb-2">Potential Missing Skills</h4>
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                <li>Cloud Technologies (AWS, Azure, GCP)</li>
                                                <li>Project Management Software (Jira, Asana)</li>
                                                <li>Data Visualization Tools (Tableau, PowerBI)</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 border rounded-lg bg-secondary/50">
                                            <h4 className="font-semibold mb-2">ATS-Friendly Language Tips</h4>
                                            <p className="text-sm">Instead of "helped with projects," try "Led cross-functional teams in the successful execution of 3 major projects, resulting in a 15% increase in efficiency." Use action verbs and quantifiable results.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="path">
                                <Card className="mt-2">
                                    <CardHeader>
                                        <CardTitle>Career Path Recommendations</CardTitle>
                                        <CardDescription>Explore skills and certifications to advance your career, based on market trends.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                                            <GraduationCap className="h-8 w-8 text-primary mt-1" />
                                            <div>
                                                <h4 className="font-semibold">In-Demand Certifications</h4>
                                                <p className="text-sm text-muted-foreground">Boost your profile with these trending certifications.</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge variant="secondary">Certified ScrumMaster (CSM)</Badge>
                                                    <Badge variant="secondary">Google Analytics IQ</Badge>
                                                    <Badge variant="secondary">AWS Certified Solutions Architect</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                                            <Lightbulb className="h-8 w-8 text-primary mt-1" />
                                            <div>
                                                <h4 className="font-semibold">Top Skills to Learn in 2024</h4>
                                                <p className="text-sm text-muted-foreground">Stay competitive by acquiring these skills.</p>
                                                 <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge variant="secondary">AI/Machine Learning</Badge>
                                                    <Badge variant="secondary">Cybersecurity</Badge>
                                                    <Badge variant="secondary">UI/UX Design</Badge>
                                                    <Badge variant="secondary">Data Science</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </form>
            </main>
        </div>
    );
}
