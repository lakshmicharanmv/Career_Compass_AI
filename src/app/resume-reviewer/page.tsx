
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, UploadCloud, FileCheck2, BookText } from 'lucide-react';
import * as mammoth from 'mammoth';

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

const FormSchema = z.object({
  resume: z
    .any()
    .refine((files) => files?.length > 0, 'Resume is required.')
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
  const [resumeContent, setResumeContent] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', 
  });
  
  const handleFileRead = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setResumeContent(null);

    try {
      const file = data.resume[0];
      if (file) {
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
          const arrayBuffer = await handleFileRead(file);
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setResumeContent(result.value);
        } else if (file.type === 'application/pdf') {
          setResumeContent('<p>PDF text extraction is not yet supported. Please upload a DOCX file.</p>');
        } else {
            toast({
                variant: 'destructive',
                title: 'Unsupported file type',
                description: 'Please upload a DOCX or PDF file.'
            });
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem reading your resume. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Resume Viewer</CardTitle>
        <CardDescription>
          Upload your resume (DOCX, max 5MB) to view its content directly in the browser.
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
                        onChange={(e) => {
                           field.onChange(e.target.files && e.target.files.length > 0 ? e.target.files : null);
                        }}
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                      >
                        {field.value?.[0]?.name ? (
                          <>
                            <FileCheck2 className="w-12 h-12 text-green-500 mb-2" />
                            <p className="font-semibold text-foreground">{field.value[0].name}</p>
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
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );


  const renderResult = () => {
    if (!resumeContent) return null;
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <BookText className="text-primary"/> Resume Content
                    </CardTitle>
                    <CardDescription>
                        This is the content extracted from your uploaded resume.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                      className="p-4 bg-secondary rounded-lg h-96 overflow-y-auto text-sm space-y-4 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: resumeContent }}
                    />
                </CardContent>
            </Card>
             <div className="text-center">
                <Button onClick={() => {setResumeContent(null); form.reset();}}>
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
            Resume Viewer
          </h1>
        </div>
        
        {isLoading ? (
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Processing Your Resume...</CardTitle>
                    <CardDescription>This may take a moment.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        ) : resumeContent ? renderResult() : renderForm()}

      </main>
    </div>
  );
}
