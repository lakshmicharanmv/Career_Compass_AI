
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateAssessmentQuestions, AssessmentQuestionsOutput } from '@/ai/flows/ai-assessment-generation';
import { recommendDegreeCourses, RecommendDegreeCoursesOutput } from '@/ai/flows/recommend-degree-courses';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  tenthPercentage: z.coerce.number().min(0).max(100),
  twelfthStream: z.enum(['Science', 'Commerce', 'Arts']),
  // Science
  physics: z.coerce.number().min(0).max(100).optional(),
  chemistry: z.coerce.number().min(0).max(100).optional(),
  math: z.coerce.number().min(0).max(100).optional(),
  biology: z.coerce.number().min(0).max(100).optional(),
  // Commerce
  accounts: z.coerce.number().min(0).max(100).optional(),
  business_studies: z.coerce.number().min(0).max(100).optional(),
  economics: z.coerce.number().min(0).max(100).optional(),
  // Arts
  history: z.coerce.number().min(0).max(100).optional(),
  political_science: z.coerce.number().min(0).max(100).optional(),
  sociology_psychology: z.coerce.number().min(0).max(100).optional(),
  // Common
  english: z.coerce.number().min(0).max(100),
  takeTest: z.enum(['yes', 'no']),
});

type FormValues = z.infer<typeof FormSchema>;

export default function Grade12Page() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [assessment, setAssessment] = React.useState<AssessmentQuestionsOutput | null>(null);
  const [recommendation, setRecommendation] = React.useState<RecommendDegreeCoursesOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [testScore, setTestScore] = React.useState<number | null>(null);
  const [rawScore, setRawScore] = React.useState<number | null>(null);
  const [formValues, setFormValues] = React.useState<FormValues | null>(null);
  const [view, setView] = React.useState<'form' | 'assessment' | 'loading' | 'results'>('form');

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tenthPercentage: '' as any,
      english: '' as any,
      physics: '' as any,
      chemistry: '' as any,
      math: '' as any,
      biology: '' as any,
      accounts: '' as any,
      business_studies: '' as any,
      economics: '' as any,
      history: '' as any,
      political_science: '' as any,
      sociology_psychology: '' as any,
      takeTest: 'no',
    },
  });

  const stream = form.watch('twelfthStream');

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setFormValues(data);

    try {
      if (data.takeTest === 'yes') {
        let topic = '';
        if (data.twelfthStream === 'Science') topic = 'Physics, Chemistry basics & logical aptitude.';
        if (data.twelfthStream === 'Commerce') topic = 'Accounts, Business basics & number reasoning.';
        if (data.twelfthStream === 'Arts') topic = 'GK, History basics & critical thinking.';
        
        const assessmentData = await generateAssessmentQuestions({
          level: '12th',
          topic: topic,
          numberOfQuestions: 20,
        });
        setAssessment(assessmentData);
        setView('assessment');
      } else {
        await getRecommendationWithTestScore(null);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerSubmit = (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < (assessment?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let score = 0;
      assessment?.questions.forEach((q, i) => {
        if (newAnswers[i].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          score++;
        }
      });
      
      const finalScore = (score / (assessment?.questions.length ?? 1)) * 100;
      setRawScore(score);
      setTestScore(finalScore);
      getRecommendationWithTestScore(finalScore);
    }
  };

  const getRecommendationWithTestScore = async (score: number | null) => {
    if (!formValues) return;
    setView('loading');
    setIsLoading(true);
    try {
      const result = await recommendDegreeCourses({
        tenthPercentage: formValues.tenthPercentage,
        twelfthStream: formValues.twelfthStream,
        twelfthMarks: {
            physics: formValues.physics,
            chemistry: formValues.chemistry,
            math: formValues.math,
            biology: formValues.biology,
            accounts: formValues.accounts,
            business_studies: formValues.business_studies,
            economics: formValues.economics,
            history: formValues.history,
            political_science: formValues.political_science,
            sociology_psychology: formValues.sociology_psychology,
            english: formValues.english,
        },
        aptitudeTestScore: score ?? undefined,
      });
      setRecommendation(result);
      setView('results');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem getting your recommendation.',
      });
      setView('form');
    } finally {
      setIsLoading(false);
    }
  };

  const startOver = () => {
    setView('form');
    setIsLoading(false);
    setAssessment(null);
    setRecommendation(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestScore(null);
    setRawScore(null);
    setFormValues(null);
    form.reset();
  }

  const renderAssessment = () => {
    if (!assessment) return null;
    const question = assessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

    return (
      <Form {...form}>
        <form>
          <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">Aptitude Test</CardTitle>
              <CardDescription>Question {currentQuestionIndex + 1} of {assessment.questions.length}</CardDescription>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg font-semibold mb-6 leading-relaxed">{question.question}</p>
              <RadioGroup onValueChange={(val) => handleAnswerSubmit(val)} key={currentQuestionIndex} className="space-y-4">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                  >
                    <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                    <FormLabel
                      htmlFor={`q${currentQuestionIndex}-o${index}`}
                      className="text-base font-normal flex-1 cursor-pointer"
                    >
                      {option}
                    </FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </form>
      </Form>
    );
  };
  
  const renderRecommendation = () => {
    if (!recommendation) return null;
    return (
      <Card className="bg-primary/10 border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-primary font-headline">AI-Powered Degree Recommendations</CardTitle>
          </div>
          <CardDescription>{recommendation.reasoning}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {testScore !== null && rawScore !== null && assessment && (
            <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-semibold text-center">Assessment Result</h4>
                <p className="text-center text-muted-foreground text-sm mt-1">
                    You scored <strong className="text-primary">{rawScore}/{assessment.questions.length}</strong> which is <strong className="text-primary">{testScore.toFixed(2)}%</strong>.
                </p>
            </div>
          )}
          <div className="space-y-4">
            <h4 className="font-semibold">Top Degree Options for You:</h4>
            <ul className="list-disc list-inside text-muted-foreground mt-2">
              {recommendation.recommendedCourses.map((path, index) => (
                <li key={index}>{path}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={startOver}>Start Over</Button>
        </CardFooter>
      </Card>
    );
  };

  const renderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>College & Major Selection</CardTitle>
        <CardDescription>
          Enter your academic details to get personalized degree recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tenthPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>10th Grade Percentage (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder=" " {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="twelfthStream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>12th Grade Stream</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your stream" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {stream && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="font-medium">12th Grade Marks (out of 100)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stream === 'Science' && (
                            <>
                                <FormField control={form.control} name="physics" render={({ field }) => (
                                    <FormItem><FormLabel>Physics</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="chemistry" render={({ field }) => (
                                    <FormItem><FormLabel>Chemistry</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="math" render={({ field }) => (
                                    <FormItem><FormLabel>Math</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="biology" render={({ field }) => (
                                    <FormItem><FormLabel>Biology</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </>
                        )}
                        {stream === 'Commerce' && (
                            <>
                                <FormField control={form.control} name="accounts" render={({ field }) => (
                                    <FormItem><FormLabel>Accounts</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="business_studies" render={({ field }) => (
                                    <FormItem><FormLabel>Business Studies</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="economics" render={({ field }) => (
                                    <FormItem><FormLabel>Economics</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </>
                        )}
                        {stream === 'Arts' && (
                            <>
                                <FormField control={form.control} name="history" render={({ field }) => (
                                    <FormItem><FormLabel>History</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="political_science" render={({ field }) => (
                                    <FormItem><FormLabel>Political Science</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="sociology_psychology" render={({ field }) => (
                                    <FormItem><FormLabel>Sociology/Psychology</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </>
                        )}
                         <FormField control={form.control} name="english" render={({ field }) => (
                            <FormItem><FormLabel>English</FormLabel><FormControl><Input type="number" placeholder=" " {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </>
            )}

            <Separator />

            <FormField
              control={form.control}
              name="takeTest"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do you want to take a stream-based aptitude test?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes, for a more accurate recommendation.</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No, just use my marks.</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || !stream} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Recommendations
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderLoading = () => (
     <Card>
      <CardHeader>
        {testScore !== null ? (
            <CardTitle>Assessment Complete!</CardTitle>
        ) : (
            <CardTitle>Generating your recommendation...</CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-8">
        {testScore !== null && rawScore !== null && assessment ? (
             <div className="text-center">
                <p>Your score: <strong className="text-primary">{rawScore}/{assessment.questions.length} ({testScore.toFixed(2)}%)</strong></p>
                <p className="mt-4 text-muted-foreground">Now generating your degree recommendation based on your marks and test score.</p>
             </div>
        ): (
            <p className="text-muted-foreground">Please wait while our AI analyzes your profile.</p>
        )}
        <Loader2 className="h-12 w-12 animate-spin text-primary mt-4" />
      </CardContent>
    </Card>
  );
  
  const renderContent = () => {
    switch (view) {
        case 'form': return renderForm();
        case 'assessment': return renderAssessment();
        case 'loading': return renderLoading();
        case 'results': return renderRecommendation();
        default: return renderForm();
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
            12th Grade - Find Your Major
          </h1>
        </div>
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
