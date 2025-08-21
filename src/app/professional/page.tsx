
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, Sparkles, Plus, Trash2, Briefcase, BookOpen, GitBranch, AlertTriangle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateAssessmentQuestions, AssessmentQuestionsOutput } from '@/ai/flows/ai-assessment-generation';
import { getProfessionalAdvice, ProfessionalCareerAdvisorOutput } from '@/ai/flows/professional-career-advisor';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const workExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  duration: z.string().min(1, 'Duration is required'),
  achievements: z.string().min(1, 'Please list at least one achievement.'),
});

const formSchema = z.object({
  workExperience: z.array(workExperienceSchema).min(1, "Please add at least one work experience."),
  currentIndustry: z.string().min(1, 'Please select your industry.'),
  careerGoals: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one career goal.',
  }),
});

type FormValues = z.infer<typeof formSchema>;
type Step = 'form' | 'assessmentChoice' | 'assessment' | 'loading' | 'results';
type RecommendationOutput = ProfessionalCareerAdvisorOutput & { error?: boolean; message?: string };


const industries = [ "Information Technology", "Healthcare", "Finance", "Education", "Manufacturing", "Retail", "Arts & Entertainment", "Legal", "Public Sector", "Engineering", "Construction & Trades" ];
const goals = [
  { id: 'promotion', label: 'Get a promotion in my current field' },
  { id: 'switch', label: 'Switch to a different career or industry' },
  { id: 'upskill', label: 'Upskill and learn new technologies/methodologies' },
];

export default function ProfessionalPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = React.useState<Step>('form');
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormValues | null>(null);
  const [assessment, setAssessment] = React.useState<AssessmentQuestionsOutput | null>(null);
  const [recommendation, setRecommendation] = React.useState<RecommendationOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [testScore, setTestScore] = React.useState<number | null>(null);
  const [rawScore, setRawScore] = React.useState<number | null>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workExperience: [{ role: '', company: '', duration: '', achievements: '' }],
      currentIndustry: '',
      careerGoals: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'workExperience',
  });
  
  async function onSubmit(data: FormValues) {
    setApiError(null);
    setFormData(data);
    setStep('assessmentChoice');
  }

  const handleAssessmentChoice = async (choice: 'yes' | 'no') => {
    if (!formData) return;
    setIsLoading(true);
    if (choice === 'yes') {
      try {
        const assessmentData = await generateAssessmentQuestions({
          level: 'Pro',
          topic: `General aptitude and industry trends for a professional in the ${formData.currentIndustry} sector.`,
          numberOfQuestions: 15,
        });
        setAssessment(assessmentData);
        setStep('assessment');
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate assessment questions.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      await getRecommendations(null);
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
      setRawScore(score);
      setTestScore(finalScore);
      getRecommendations(finalScore);
    }
  };

  const getRecommendations = async (score: number | null) => {
    if (!formData) return;
    setStep('loading');
    setIsLoading(true);
    setApiError(null);
    try {
      // Save data to localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        workExperience: formData.workExperience,
        currentIndustry: formData.currentIndustry,
        careerGoals: formData.careerGoals,
        assessmentScore: score,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      const result: RecommendationOutput = await getProfessionalAdvice({
        ...formData,
        assessmentScore: score ?? undefined,
      });

      if(result.error) {
        setApiError(result.message || "Our AI is currently busy and both our primary and backup systems are overloaded. We apologize for the inconvenience. Please try again in a few moments.");
        setRecommendation(null);
      } else {
        setRecommendation(result);
      }
      setStep('results');
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      setApiError("An unexpected error occurred. Please try again.");
      setStep('results');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResume = () => {
    Cookies.set('resumeFlow', 'professional');
    router.push('/resume-builder');
  };

  const startOver = () => {
    setStep('form');
    setFormData(null);
    setAssessment(null);
    setRecommendation(null);
    setTestScore(null);
    setRawScore(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setApiError(null);
    form.reset();
  };
  
  const renderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Professional Background & Goals</CardTitle>
        <CardDescription>Tell us about your experience and aspirations to receive tailored career advice.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Work Experience</h3>
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name={`workExperience.${index}.role`} render={({ field }) => (
                        <FormItem><FormLabel>Role / Job Title</FormLabel><FormControl><Input placeholder="e.g., Senior Accountant" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => (
                        <FormItem><FormLabel>Company / Organization</FormLabel><FormControl><Input placeholder="e.g., Acme Corp" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`workExperience.${index}.duration`} render={({ field }) => (
                        <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g., 2018 - Present" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`workExperience.${index}.achievements`} render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Key Achievements</FormLabel><FormControl><Textarea placeholder="Describe your key achievements in this role..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ role: '', company: '', duration: '', achievements: '' })} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Experience
              </Button>
               <FormMessage>{form.formState.errors.workExperience?.message}</FormMessage>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
               <h3 className="text-lg font-medium">Industry & Goals</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="currentIndustry" render={({ field }) => (
                    <FormItem><FormLabel>Current Industry</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger></FormControl><SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="careerGoals" render={() => (
                  <FormItem>
                    <FormLabel>Primary Career Goals</FormLabel>
                    {goals.map((item) => (
                      <FormField key={item.id} control={form.control} name="careerGoals" render={({ field }) => (
                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                            return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                          }} /></FormControl>
                          <FormLabel className="font-normal">{item.label}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                    <FormMessage />
                  </FormItem>
                )} />
               </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Get Career Advice
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderAssessmentChoice = () => (
      <Card>
          <CardHeader>
              <CardTitle>Optional: Professional Skills Assessment</CardTitle>
              <CardDescription>A short test can help us provide more accurate recommendations. Would you like to take one?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => handleAssessmentChoice('yes')} className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Test...</> : 'Yes, Start Assessment'}
              </Button>
              <Button variant="secondary" onClick={() => handleAssessmentChoice('no')} className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Advice...</> : 'No, Skip to Recommendations'}
              </Button>
          </CardContent>
           <CardFooter>
              <Button variant="outline" onClick={() => setStep('form')}>Back</Button>
           </CardFooter>
      </Card>
  );

  const renderAssessment = () => {
    if (!assessment) return null;
    const question = assessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

    return (
      <Form {...form}>
        <form>
          <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">Professional Skills Assessment</CardTitle>
              <CardDescription>Question {currentQuestionIndex + 1} of {assessment.questions.length}</CardDescription>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg font-semibold mb-6 leading-relaxed">{question.question}</p>
              <RadioGroup onValueChange={handleAnswerSubmit} key={currentQuestionIndex} className="space-y-4">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                    <FormLabel htmlFor={`q${currentQuestionIndex}-o${index}`} className="text-base font-normal flex-1 cursor-pointer">{option}</FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </form>
      </Form>
    );
  };

  const renderLoading = () => (
    <Card>
      <CardHeader>
        {testScore !== null ? (
            <CardTitle>Assessment Complete!</CardTitle>
        ) : (
            <CardTitle>Generating Your Career Progression Plan...</CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-8">
        {testScore !== null && rawScore !== null && assessment ? (
             <div className="text-center">
                <p>Your score: <strong className="text-primary">{rawScore}/{assessment.questions.length} ({testScore.toFixed(2)}%)</strong></p>
                <p className="mt-4 text-muted-foreground">Our AI is analyzing your profile to forge the best path forward.</p>
             </div>
        ): (
            <p className="text-muted-foreground">Our AI is analyzing your profile to forge the best path forward.</p>
        )}
        <Loader2 className="h-12 w-12 animate-spin text-primary mt-4" />
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (apiError) {
      return (
        <Card className="border-destructive/50">
           <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle /> Service Temporarily Unavailable
              </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{apiError}</p>
          </CardContent>
          <CardFooter>
              <Button onClick={startOver}>Start Over</Button>
          </CardFooter>
        </Card>
      );
    }
    
    if (!recommendation) return null;


    return (
      <Card className="bg-primary/5">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-primary font-headline">Your AI-Powered Career Roadmap</CardTitle>
            </div>
            {testScore !== null ? (
              <CardDescription>
                  Based on your experience, goals, and assessment score, here is your tailored advice.
              </CardDescription>
            ) : (
               <CardDescription>
                  Based on your experience and goals, here is your tailored advice.
              </CardDescription>
            )}
        </CardHeader>
        <CardContent className="space-y-8">
           {testScore !== null && rawScore !== null && assessment && (
              <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-center">Professional Skills Assessment Result</h4>
                  <p className="text-center text-muted-foreground text-sm mt-1">
                      You scored <strong className="text-primary">{rawScore}/{assessment.questions.length}</strong> which is <strong className="text-primary">{testScore.toFixed(2)}%</strong>.
                  </p>
              </div>
            )}
          {recommendation.nextRoles?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Briefcase className="text-accent" /> Recommended Next Roles</h3>
              <div className="space-y-4">
                  {recommendation.nextRoles.map((item, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border">
                          <h4 className="font-semibold">{item.role}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                      </div>
                  ))}
              </div>
            </div>
          )}
          {recommendation.certifications?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><BookOpen className="text-accent"/> Recommended Certifications & Courses</h3>
              <div className="space-y-4">
                  {recommendation.certifications.map((item, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                      </div>
                  ))}
              </div>
            </div>
          )}
          {recommendation.careerSwitches?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><GitBranch className="text-accent" /> Potential Career Switches</h3>
              <div className="space-y-4">
                  {recommendation.careerSwitches.map((item, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border">
                          <h4 className="font-semibold">{item.newRole} in {item.newIndustry}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
            <div className="flex gap-4">
              <Button onClick={startOver}>Start Over</Button>
              <Button onClick={handleGenerateResume}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Resume
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                You can now generate a resume based on the information you've provided.
            </p>
        </CardFooter>
      </Card>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'form': return renderForm();
      case 'assessmentChoice': return renderAssessmentChoice();
      case 'assessment': return renderAssessment();
      case 'loading': return renderLoading();
      case 'results': return renderResults();
      default: return null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container py-12 md:py-16">
        <div className="flex items-center mb-8">
          <Link href="/" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">
            Professional Career Advancement
          </h1>
        </div>
        <div className="max-w-5xl mx-auto">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
