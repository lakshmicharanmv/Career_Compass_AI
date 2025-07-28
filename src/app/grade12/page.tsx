
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
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
  subject1: z.coerce.number().min(0).max(100),
  subject2: z.coerce.number().min(0).max(100),
  subject3: z.coerce.number().min(0).max(100),
  english: z.coerce.number().min(0).max(100),
  takeTest: z.enum(['yes', 'no']),
});

type FormValues = z.infer<typeof FormSchema>;

const STREAM_SUBJECTS = {
  Science: ['Physics', 'Chemistry', 'Math/Biology'],
  Commerce: ['Accounts', 'Business Studies', 'Economics'],
  Arts: ['History', 'Political Science', 'Sociology/Psychology'],
};

export default function Grade12Page() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [assessment, setAssessment] = React.useState<AssessmentQuestionsOutput | null>(null);
  const [recommendation, setRecommendation] = React.useState<RecommendDegreeCoursesOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [testScore, setTestScore] = React.useState<number | null>(null);
  const [formValues, setFormValues] = React.useState<FormValues | null>(null);
  const [twelfthPercentage, setTwelfthPercentage] = React.useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tenthPercentage: 0,
      subject1: 0,
      subject2: 0,
      subject3: 0,
      english: 0,
      takeTest: 'no',
    },
  });

  const stream = form.watch('twelfthStream');
  const s1 = form.watch('subject1');
  const s2 = form.watch('subject2');
  const s3 = form.watch('subject3');
  const eng = form.watch('english');

  React.useEffect(() => {
    const marks = [s1, s2, s3, eng].filter(v => !isNaN(v));
    if (marks.length > 0) {
        const total = marks.reduce((acc, mark) => acc + mark, 0);
        const avg = total / marks.length;
        setTwelfthPercentage(avg);
    } else {
        setTwelfthPercentage(0);
    }
  }, [s1, s2, s3, eng]);


  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setRecommendation(null);
    setAssessment(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestScore(null);
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
      } else {
        const result = await recommendDegreeCourses({
            tenthPercentage: data.tenthPercentage,
            twelfthStream: data.twelfthStream,
            twelfthMarks: {
                subject1: data.subject1,
                subject2: data.subject2,
                subject3: data.subject3,
                english: data.english,
            },
        });
        setRecommendation(result);
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
        if (newAnswers[i] === q.correctAnswer) {
          score++;
        }
      });
      const finalScore = (score / (assessment?.questions.length ?? 1)) * 100;
      setTestScore(finalScore);
      getRecommendationWithTestScore(finalScore);
    }
  };

  const getRecommendationWithTestScore = async (score: number) => {
    if (!formValues) return;
    setIsLoading(true);
    try {
      const result = await recommendDegreeCourses({
        tenthPercentage: formValues.tenthPercentage,
        twelfthStream: formValues.twelfthStream,
        twelfthMarks: {
            subject1: formValues.subject1,
            subject2: formValues.subject2,
            subject3: formValues.subject3,
            english: formValues.english,
        },
        aptitudeTestScore: score,
      });
      setRecommendation(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem getting your recommendation.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAssessment = () => {
    if (!assessment) return null;

    if (testScore !== null) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Complete!</CardTitle>
            <CardDescription>Your score: {testScore.toFixed(2)}%</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p>Generating your recommendation...</p>
              </div>
            ) : (
              <p>Now generating your degree recommendation based on your marks and test score.</p>
            )}
          </CardContent>
        </Card>
      );
    }

    const question = assessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

    return (
      <Form {...form}>
        <form>
          <Card>
            <CardHeader>
              <CardTitle>Aptitude Test</CardTitle>
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
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Top Degree Options for You:</h4>
            <ul className="list-disc list-inside text-muted-foreground mt-2">
              {recommendation.recommendedCourses.map((path, index) => (
                <li key={index}>{path}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={() => {
              setRecommendation(null);
              setAssessment(null);
              setTestScore(null);
              form.reset();
            }}>Start Over</Button>
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
                    <Input type="number" placeholder="0" {...field} />
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
                        {twelfthPercentage > 0 && <p className="text-sm text-muted-foreground">Calculated Percentage: {twelfthPercentage.toFixed(2)}%</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="subject1" render={({ field }) => (
                            <FormItem><FormLabel>{STREAM_SUBJECTS[stream][0]}</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="subject2" render={({ field }) => (
                            <FormItem><FormLabel>{STREAM_SUBJECTS[stream][1]}</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="subject3" render={({ field }) => (
                            <FormItem><FormLabel>{STREAM_SUBJECTS[stream][2]}</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="english" render={({ field }) => (
                            <FormItem><FormLabel>English</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl items-center">
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
            12th Grade - Find Your Major
          </h1>
        </div>
        <div className="max-w-4xl mx-auto">
          {recommendation 
            ? renderRecommendation()
            : (assessment && !isLoading && testScore === null)
              ? renderAssessment()
              : renderForm()
          }
        </div>
      </main>
    </div>
  );
}
