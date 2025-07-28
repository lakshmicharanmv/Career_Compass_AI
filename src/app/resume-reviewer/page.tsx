
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, Sparkles, UploadCloud, FileCheck2, Clipboard, Check, BookText, MessageSquare } from 'lucide-react';

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { reviewResume, ReviewResumeOutput } from '@/ai/flows/ai-resume-reviewer';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const FormSchema = z.object({
  resume: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Resume is required.')
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(
      (files) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(files?.[0]?.type),
      '.pdf and .docx files are accepted.'
    ),
});

type FormValues = z.infer<typeof FormSchema>;

export default function ResumeReviewerPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ReviewResumeOutput | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);


  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const fileRef = form.register('resume');

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setResult(null);

    try {
      const file = data.resume[0];
      const resumeDataUri = await readFileAsDataURL(file);
      const aiResult = await reviewResume({ resumeDataUri });
      setResult(aiResult);
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
  
  const handleCopy = () => {
    if (result?.improvedResume) {
      navigator.clipboard.writeText(result.improvedResume);
      setCopied(true);
      toast({ title: "Copied to clipboard!"});
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Resume Reviewer</CardTitle>
        <CardDescription>
          Upload your resume (PDF or DOCX, max 5MB) to get AI-powered feedback and an improved, ATS-friendly version.
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
                        accept=".pdf,.docx"
                        {...fileRef}
                        onChange={(e) => {
                            field.onChange(e.target.files);
                            setFileName(e.target.files?.[0]?.name ?? null)
                        }}
                      />
                      <label 
                        htmlFor="resume-upload" 
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                      >
                         {fileName ? (
                            <>
                                <FileCheck2 className="w-12 h-12 text-green-500 mb-2"/>
                                <p className="font-semibold text-foreground">{fileName}</p>
                                <p className="text-xs text-muted-foreground">Click again to change file</p>
                            </>
                         ) : (
                            <>
                                <UploadCloud className="w-12 h-12 text-muted-foreground mb-2"/>
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
            <Button type="submit" disabled={isLoading || !fileName} className="w-full">
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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <Badge variant="secondary" className="text-lg py-2 px-4">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    AI Review Complete
                </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <BookText className="text-primary"/> Improved Resume
                        </CardTitle>
                        <CardDescription>
                            An ATS-friendly version of your resume. Copy the text and paste it into a new document.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Textarea
                                readOnly
                                value={result.improvedResume}
                                className="h-96 text-sm"
                            />
                             <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopy}
                                className="absolute top-2 right-2"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                <span className="sr-only">Copy</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                           <MessageSquare className="text-primary"/> AI Feedback
                        </CardTitle>
                        <CardDescription>
                           Suggestions on formatting, keyword gaps, and grammar.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="p-4 bg-secondary rounded-lg h-96 overflow-y-auto text-sm space-y-4">
                            {result.feedback.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="text-center">
                <Button onClick={() => {setResult(null); setFileName(null); form.reset()}}>
                    Review Another Resume
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
        
        {result ? renderResult() : renderForm()}

      </main>
    </div>
  );
}
