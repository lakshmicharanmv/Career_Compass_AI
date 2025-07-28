
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, Sparkles, User, BookOpen, Brain, Briefcase } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateAssessmentQuestions, AssessmentQuestionsOutput } from '@/ai/flows/ai-assessment-generation';
import { recommendUndergraduateOptions, UndergraduateOptionsOutput } from '@/ai/flows/undergraduate-career-advisor';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

const degreeData = {
  Science: {
    'B.Tech/B.E.': ['Computer Science', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Information Technology'],
    'MBBS': ['General Medicine', 'Surgery'],
    'B.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Biotechnology', 'Agriculture', 'Computer Science'],
    'B.Pharm': ['Pharmacy'],
    'BDS': ['Dental Surgery'],
  },
  Commerce: {
    'B.Com': ['Accounting and Finance', 'Taxation', 'Banking and Insurance', 'General Commerce'],
    'BBA': ['Marketing', 'Finance', 'Human Resources', 'International Business'],
    'BMS': ['Management Studies'],
  },
  Arts: {
    'B.A.': ['History', 'Psychology', 'Sociology', 'Political Science', 'English Literature', 'Journalism'],
    'B.Des': ['Fashion Design', 'Graphic Design', 'Interior Design'],
    'LLB': ['Corporate Law', 'Criminal Law', 'Civil Law'],
  },
};


const academicSchema = z.object({
  tenthPercentage: z.coerce.number().min(0).max(100),
  twelfthPercentage: z.coerce.number().min(0).max(100),
  twelfthStream: z.enum(['Science', 'Commerce', 'Arts']),
  degreeName: z.string().min(1, 'Degree name is required.'),
  specialization: z.string().min(1, 'Specialization is required.'),
  currentGrade: z.coerce.number().min(0).max(100),
});

const skillsSchema = z.object({
    technical: z.string().min(1, 'Please list at least one technical skill.'),
    soft: z.string().min(1, 'Please list at least one soft skill.'),
});

type AcademicFormValues = z.infer<typeof academicSchema>;
type SkillsFormValues = z.infer<typeof skillsSchema>;

export default function UndergraduatePage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [academicData, setAcademicData] = React.useState<AcademicFormValues | null>(null);
  const [skillsData, setSkillsData] = React.useState<SkillsFormValues | null>(null);
  const [assessment, setAssessment] = React.useState<AssessmentQuestionsOutput | null>(null);
  const [recommendation, setRecommendation] = React.useState<UndergraduateOptionsOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [testScore, setTestScore] = React.useState<number | null>(null);

  const academicForm = useForm<AcademicFormValues>({ 
    resolver: zodResolver(academicSchema),
    defaultValues: {
        degreeName: '',
        specialization: '',
    }
  });
  const skillsForm = useForm<SkillsFormValues>({ resolver: zodResolver(skillsSchema) });

  const watchedStream = academicForm.watch('twelfthStream');
  const watchedDegree = academicForm.watch('degreeName');

  React.useEffect(() => {
    if (watchedStream) {
        academicForm.resetField('degreeName', { defaultValue: '' });
        academicForm.resetField('specialization', { defaultValue: '' });
    }
  }, [watchedStream, academicForm]);

  React.useEffect(() => {
    if (watchedDegree) {
        academicForm.resetField('specialization', { defaultValue: '' });
    }
  }, [watchedDegree, academicForm]);


  const handleAcademicSubmit = (data: AcademicFormValues) => {
    setAcademicData(data);
    setCurrentStep(2);
  };

  const handleSkillsSubmit = (data: SkillsFormValues) => {
    setSkillsData(data);
    setCurrentStep(3);
  };

  const handleAssessmentChoice = async (choice: 'yes' | 'no') => {
    if (choice === 'yes') {
      setIsLoading(true);
      try {
        const assessmentData = await generateAssessmentQuestions({
          level: 'UG',
          topic: `Core concepts and aptitude for ${academicData?.degreeName} in ${academicData?.specialization}`,
          numberOfQuestions: 20,
        });
        setAssessment(assessmentData);
        setCurrentStep(4);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate assessment questions.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      getRecommendations(null);
    }
  };

  const handleAnswerSubmit = (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < (assessment?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let score = 0;
      assessment?.questions.forEach((q, i) => {
        if (newAnswers[i] === q.correctAnswer) score++;
      });
      const finalScore = (score / (assessment?.questions.length ?? 1)) * 100;
      setTestScore(finalScore);
      getRecommendations(finalScore);
    }
  };

  const getRecommendations = async (score: number | null) => {
    if (!academicData || !skillsData) return;
    setCurrentStep(5);
    setIsLoading(true);
    try {
      const result = await recommendUndergraduateOptions({
        academics: academicData,
        skills: skillsData,
        assessmentScore: score ?? undefined,
      });
      setRecommendation(result);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not get recommendations.' });
    } finally {
      setIsLoading(false);
    }
  };

  const startOver = () => {
    setCurrentStep(1);
    setAcademicData(null);
    setSkillsData(null);
    setAssessment(null);
    setRecommendation(null);
    setTestScore(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    academicForm.reset();
    skillsForm.reset();
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderAcademicForm();
      case 2: return renderSkillsForm();
      case 3: return renderAssessmentChoice();
      case 4: return renderAssessment();
      case 5: return renderRecommendations();
      default: return null;
    }
  }

  const renderAcademicForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Academic Information</CardTitle>
        <CardDescription>Let's start with your academic background.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...academicForm}>
          <form onSubmit={academicForm.handleSubmit(handleAcademicSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="tenthPercentage" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>10th Percentage</FormLabel><FormControl><Input type="number" placeholder="e.g., 85" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="twelfthPercentage" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>12th Percentage</FormLabel><FormControl><Input type="number" placeholder="e.g., 90" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="twelfthStream" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>12th Stream</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Science">Science</SelectItem><SelectItem value="Commerce">Commerce</SelectItem><SelectItem value="Arts">Arts</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              
              <FormField name="degreeName" control={academicForm.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Degree Name</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedStream}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {watchedStream && Object.keys(degreeData[watchedStream]).map(degree => (
                                <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )} />
              
              <FormField name="specialization" control={academicForm.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Specialization</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDegree}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {watchedStream && watchedDegree && degreeData[watchedStream][watchedDegree] &&
                                degreeData[watchedStream][watchedDegree].map(spec => (
                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )} />

              <FormField name="currentGrade" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>Current CGPA / Percentage</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 8.5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Button type="submit">Next: Skills</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderSkillsForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Your Skills</CardTitle>
        <CardDescription>List your technical and soft skills, separated by commas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...skillsForm}>
          <form onSubmit={skillsForm.handleSubmit(handleSkillsSubmit)} className="space-y-6">
            <FormField name="technical" control={skillsForm.control} render={({ field }) => (
              <FormItem><FormLabel>Technical Skills</FormLabel><FormControl><Textarea placeholder="e.g., Java, Python, CAD, Legal Research" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="soft" control={skillsForm.control} render={({ field }) => (
                <FormItem><FormLabel>Soft Skills</FormLabel><FormControl><Textarea placeholder="e.g., Communication, Leadership, Teamwork" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button type="submit">Next: Assessment</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
  
  const renderAssessmentChoice = () => (
      <Card>
          <CardHeader>
              <CardTitle>Step 3: Career Assessment</CardTitle>
              <CardDescription>A quick test can help us provide more accurate recommendations. Would you like to take one?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => handleAssessmentChoice('yes')} className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Test...</> : 'Yes, Start Test'}
              </Button>
              <Button variant="secondary" onClick={() => handleAssessmentChoice('no')} className="w-full md:w-auto">
                  No, Skip to Recommendations
              </Button>
          </CardContent>
           <CardFooter>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
           </CardFooter>
      </Card>
  );

  const renderAssessment = () => {
    if (!assessment) return null;
    const question = assessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Test</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {assessment.questions.length}</CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <p className="font-semibold mb-4">{question.question}</p>
          <RadioGroup onValueChange={handleAnswerSubmit} key={currentQuestionIndex}>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                <FormLabel htmlFor={`q${currentQuestionIndex}-o${index}`}>{option}</FormLabel>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    );
  };

  const renderRecommendations = () => {
    if (isLoading) {
      return (
        <Card>
          <CardHeader><CardTitle>Generating Your Future Path...</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Our AI is analyzing your profile to find the best opportunities for you.</p>
          </CardContent>
        </Card>
      );
    }
    if (!recommendation) return null;

    return (
      <Card className="bg-primary/5">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-primary font-headline">Your Personalized Recommendations</CardTitle>
            </div>
            <CardDescription>
                Based on your academics, skills, {testScore !== null && `and assessment score of ${testScore.toFixed(2)}%, `}
                here are some tailored suggestions for your career journey.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Briefcase className="text-accent" /> Recommended Job Roles</h3>
              <div className="space-y-4">
                  {recommendation.jobRoles.map((job, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border">
                          <h4 className="font-semibold">{job.role}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{job.reason}</p>
                      </div>
                  ))}
              </div>
          </div>
          <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-accent"/> Higher Studies & Certifications</h3>
              <div className="space-y-4">
                  {recommendation.higherStudies.map((study, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border">
                          <h4 className="font-semibold">{study.course}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{study.reason}</p>
                      </div>
                  ))}
              </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={startOver}>Start Over</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Link href="/" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">
            Undergraduate Career Guide
          </h1>
        </div>
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
