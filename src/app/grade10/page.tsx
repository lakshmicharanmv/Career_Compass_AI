
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
import { recommendStream, RecommendStreamOutput } from '@/ai/flows/recommend-stream';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  math: z.coerce.number().min(0).max(100),
  science: z.coerce.number().min(0).max(100),
  english: z.coerce.number().min(0).max(100),
  social_studies: z.coerce.number().min(0).max(100),
  optional_subject: z.string().optional(),
  optional_marks: z.coerce.number().min(0).max(100).optional(),
  takeTest: z.enum(['yes', 'no']),
});

type FormValues = z.infer<typeof FormSchema>;

export default function Grade10Page() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [assessment, setAssessment] = React.useState<AssessmentQuestionsOutput | null>(null);
  const [recommendation, setRecommendation] = React.useState<RecommendStreamOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [testScore, setTestScore] = React.useState<number | null>(null);
  const [rawScore, setRawScore] = React.useState<number | null>(null);
  const [formValues, setFormValues] = React.useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      math: '' as any,
      science: '' as any,
      english: '' as any,
      social_studies: '' as any,
      optional_subject: "",
      optional_marks: '' as any,
      takeTest: 'no',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setRecommendation(null);
    setAssessment(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestScore(null);
    setRawScore(null);
    setFormValues(data);

    try {
      if (data.takeTest === 'yes') {
        const assessmentData = await generateAssessmentQuestions({
          level: '10th',
          topic: 'General Aptitude for 10th Grade covering Math, Science, English, and Social Studies',
          numberOfQuestions: 20,
        });
        setAssessment(assessmentData);
      } else {
        const result = await recommendStream({
          marks: {
            math: data.math,
            science: data.science,
            english: data.english,
            social_studies: data.social_studies,
            optional_subject: data.optional_subject,
            optional_marks: data.optional_marks,
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
      // Test finished, calculate score and get recommendation
      let score = 0;
      assessment?.questions.forEach((q, i) => {
        if (newAnswers[i] === q.correctAnswer) {
          score++;
        }
      });
      const finalScore = (score / (assessment?.questions.length ?? 1)) * 100;
      setRawScore(score);
      setTestScore(finalScore);
      getRecommendationWithTestScore(finalScore);
    }
  };

  const getRecommendationWithTestScore = async (score: number) => {
    if (!formValues) return;
    setIsLoading(true);
    try {
      const result = await recommendStream({
        marks: {
          math: formValues.math,
          science: formValues.science,
          english: formValues.english,
          social_studies: formValues.social_studies,
          optional_subject: formValues.optional_subject,
          optional_marks: formValues.optional_marks,
        },
        testScore: score,
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
            <CardDescription>
              Your score: {rawScore}/{assessment.questions.length} ({testScore.toFixed(2)}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p>Generating your recommendation...</p>
              </div>
            ) : (
              <p>Now generating your stream recommendation based on your marks and test score.</p>
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
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">Assessment Test</CardTitle>
              <CardDescription>Question {currentQuestionIndex + 1} of {assessment.questions.length}</CardDescription>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg font-semibold mb-6 leading-relaxed">{question.question}</p>
              <RadioGroup onValueChange={handleAnswerSubmit} key={currentQuestionIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  
  const renderRecommendation = () => {
    if (!recommendation) return null;
    return (
      <Card className="bg-primary/10 border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-primary font-headline">AI-Powered Recommendation</CardTitle>
          </div>
          {testScore !== null && (
            <CardDescription>Based on your input and assessment score, here is our suggestion.</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {testScore !== null && (
            <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-semibold text-center">Assessment Result</h4>
                <p className="text-center text-muted-foreground text-sm mt-1">
                    You scored <strong className="text-primary">{rawScore}/{assessment?.questions.length}</strong> which is <strong className="text-primary">{testScore.toFixed(2)}%</strong>.
                </p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-accent">{recommendation.recommendedStream}</h3>
              <p className="text-muted-foreground mt-1">{recommendation.reasoning}</p>
            </div>
            <div>
              <h4 className="font-semibold">Top Career Paths for this Stream:</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-2">
                {recommendation.careerPaths.map((path, index) => (
                  <li key={index}>{path}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={() => {
              setRecommendation(null)
              form.reset();
            }}>Start Over</Button>
        </CardFooter>
      </Card>
    );
  };

  const renderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Stream & Subject Selection</CardTitle>
        <CardDescription>
          Enter your 10th grade marks to get a personalized stream recommendation. You can also take an optional assessment test for a more accurate result.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="math"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Math Marks (out of 100)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder=" " {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="science"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Science Marks (out of 100)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder=" " {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="english"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Marks (out of 100)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder=" " {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="social_studies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Studies Marks (out of 100)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder=" " {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="optional_subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Optional Subject (Name)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="optional_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Optional Subject Marks</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder=" " {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="takeTest"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do you want to take an assessment test?</FormLabel>
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
                        <FormLabel className="font-normal">
                          Yes, help me get a more accurate recommendation.
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          No, just use my marks.
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Recommendation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

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
            10th Grade Stream Selector
          </h1>
        </div>
        <div className="max-w-5xl mx-auto">
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
