
'use client';

import Link from 'next/link';
import * as React from 'react';
import { Bot, ArrowLeft, Loader2, Sparkles, User, Briefcase, BookOpen, GitBranch, AlertTriangle, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FormLabel } from '@/components/ui/form';

import Grade10Form from '@/app/grade10/page';
import Grade12Form from '@/app/grade12/page';
import UndergraduateForm from '@/app/undergraduate/page';
import ProfessionalForm from '@/app/professional/page';

type Stage = '10th' | '12th' | 'UG' | 'Pro' | null;

export default function AICareerAdvisorPage() {
    const [stage, setStage] = React.useState<Stage>(null);

    const renderContent = () => {
        if (stage === null) {
            return (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Select Your Current Stage</CardTitle>
                        <CardDescription>To give you the best advice, please tell us where you are in your career journey.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup onValueChange={(value) => setStage(value as Stage)} className="space-y-4">
                            <div className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                <RadioGroupItem value="10th" id="s-10th" />
                                <FormLabel htmlFor="s-10th" className="text-base font-normal flex-1 cursor-pointer">
                                    I am a 10th Grade Student
                                    <p className="text-sm text-muted-foreground">Get help choosing your academic stream (Science, Commerce, Arts).</p>
                                </FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                <RadioGroupItem value="12th" id="s-12th" />
                                <FormLabel htmlFor="s-12th" className="text-base font-normal flex-1 cursor-pointer">
                                    I am a 12th Grade Student
                                     <p className="text-sm text-muted-foreground">Find the right degree and career path after school.</p>
                                </FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                <RadioGroupItem value="UG" id="s-ug" />
                                <FormLabel htmlFor="s-ug" className="text-base font-normal flex-1 cursor-pointer">
                                    I am an Undergraduate Student
                                     <p className="text-sm text-muted-foreground">Prepare for jobs, internships, and higher studies.</p>
                                </FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                <RadioGroupItem value="Pro" id="s-pro" />
                                <FormLabel htmlFor="s-pro" className="text-base font-normal flex-1 cursor-pointer">
                                    I am a Working Professional
                                     <p className="text-sm text-muted-foreground">Get advice on career growth, upskilling, and switching roles.</p>
                                </FormLabel>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            );
        }

        switch (stage) {
            case '10th': return <Grade10Form />;
            case '12th': return <Grade12Form />;
            case 'UG': return <UndergraduateForm />;
            case 'Pro': return <ProfessionalForm />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-xl items-center justify-between">
                    <Link href="/" className="flex items-center" prefetch={false}>
                        <Bot className="h-6 w-6 text-primary" />
                        <span className="ml-2 font-bold font-headline text-lg">
                            Career Compass AI
                        </span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 container py-12 md:py-16">
                <div className="flex items-center mb-8">
                     <Button variant="outline" size="icon" onClick={() => setStage(null)}>
                         <ArrowLeft className="h-4 w-4" />
                     </Button>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">
                        AI Career Advisor
                    </h1>
                </div>
                {renderContent()}
            </main>
        </div>
    );
}

    