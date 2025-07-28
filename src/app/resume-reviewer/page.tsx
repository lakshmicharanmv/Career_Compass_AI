'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, UploadCloud, FileCheck2, Wand2, CheckCircle } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { reviewResume, ReviewResumeOutput } from '@/ai/flows/ai-resume-reviewer';
import { Progress } from '@/components/ui/progress';

const FormSchema = z.object({
  resume: z
    .any()
    .refine((files) => files?.length === 1, 'Resume is required.')
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(
      (files) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(files?.[0]?.type),
      'Only .pdf, .doc, and .docx files are accepted.'
    ),
});

type FormValues = z.infer<typeof FormSchema>;

export default function ResumeReviewerPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ReviewResumeOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
  });

  const fileRef = form.register('resume');

  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        resolve(dataUri);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setResult(null);

    try {
      const file = data.resume[0];
      if (file) {
        const resumeDataUri = await handleFileRead(file);
        const aiResult = await reviewResume({ resumeDataUri });
        setResult(aiResult);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem analyzing your resume. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const resumeFile = form.watch('resume');
  const fileName = resumeFile?.[0]?.name;


  const renderForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Resume Reviewer</CardTitle>
        <CardDescription>
          Upload your resume (PDF or DOCX, max 5MB) to get AI-powered feedback on how to improve it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Resume</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        {...fileRef}
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                      >
                        {fileName ? (
                          <>
                            <FileCheck2 className="w-12 h-12 text-green-500 mb-2" />
                            <p className="font-semibold text-foreground">{fileName}</p>
                            <p className="text-xs text-muted-foreground">Click again to change file</p>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-12 h-12 text-muted-foreground mb-2" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 5MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Analyzing Your Resume...' : 'Get Feedback'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderResult = () => {
    if (!result) return null;
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="text-primary" /> ATS Score & Analysis
            </CardTitle>
            <CardDescription>
              Your resume has been scored based on its compatibility with Applicant Tracking Systems.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">Your ATS Score</p>
              <p className="text-6xl font-bold text-primary">{result.atsScore.toFixed(1)} <span className="text-2xl text-muted-foreground">/ 10</span></p>
              <Progress value={result.atsScore * 10} className="mt-4" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Key Improvements:</h3>
              <ul className="space-y-2 list-inside">
                {result.improvements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={() => { setResult(null); form.reset(); }}>
            Upload Another Resume
          </Button>
        </div>
      </div>
    );
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
          <Link href="/" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">
            AI Resume Reviewer
          </h1>
        </div>
        
        {isLoading ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Analyzing Your Resume...</CardTitle>
              <CardDescription>Our AI is working its magic. This may take a moment.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : result ? renderResult() : renderForm()}
      </main>
    </div>
  );
}
