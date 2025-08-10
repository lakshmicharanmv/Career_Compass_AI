
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, Save, Download, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const workExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  duration: z.string().min(1, 'Duration is required'),
  achievements: z.string().min(1, 'Please list at least one achievement.'),
});

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  
  // UG fields
  degreeName: z.string().optional(),
  specialization: z.string().optional(),
  currentGrade: z.coerce.number().optional(),
  technicalSkills: z.string().optional(),
  softSkills: z.string().optional(),

  // Professional fields
  workExperience: z.array(workExperienceSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ResumeBuilderPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const flowType = Cookies.get('resumeFlow'); // 'undergraduate' or 'professional'

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workExperience: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'workExperience',
  });

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user && user.email) {
      form.reset({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        degreeName: user.academics?.degreeName || '',
        specialization: user.academics?.specialization || '',
        currentGrade: user.academics?.currentGrade || undefined,
        technicalSkills: user.skills?.technical || '',
        softSkills: user.skills?.soft || '',
        workExperience: user.workExperience || [{ role: '', company: '', duration: '', achievements: '' }],
      });
      setIsDataLoaded(true);
    } else {
      router.push('/signin');
    }
  }, [form, router]);

  const saveDetails = (data: FormValues) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = {
      ...currentUser,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      github: data.github,
      academics: {
        ...currentUser.academics,
        degreeName: data.degreeName,
        specialization: data.specialization,
        currentGrade: data.currentGrade,
      },
      skills: {
        ...currentUser.skills,
        technical: data.technicalSkills,
        soft: data.softSkills,
      },
      workExperience: data.workExperience,
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };


  const handleGeneratePdf = (data: FormValues) => {
    setIsLoading(true);
    saveDetails(data);

    try {
      const doc = new jsPDF();
      let y = 15; // Vertical position in PDF

      // --- Header ---
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(data.fullName, 105, y, { align: 'center' });
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactInfo = [data.email, data.phone, data.linkedin, data.github].filter(Boolean).join(' | ');
      doc.text(contactInfo, 105, y, { align: 'center' });
      y += 10;
      doc.line(20, y, 190, y); // Horizontal line
      y += 10;

      // --- Education (For Undergraduates) ---
      if (flowType === 'undergraduate' && data.degreeName) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', 20, y);
        y += 7;

        doc.setFontSize(12);
        doc.text(data.degreeName, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Specialization: ${data.specialization}`, 22, y + 5);
        doc.text(`Current Grade: ${data.currentGrade}`, 22, y + 10);
        y += 20;
      }
      
      // --- Work Experience (For Professionals) ---
       if (flowType === 'professional' && data.workExperience && data.workExperience.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('WORK EXPERIENCE', 20, y);
        y += 7;

        data.workExperience.forEach(exp => {
            if (exp.role) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(exp.role, 20, y);
                doc.setFont('helvetica', 'italic');
                doc.text(`${exp.company} | ${exp.duration}`, 190, y, { align: 'right' });
                y += 6;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const achievements = doc.splitTextToSize(`- ${exp.achievements.replace(/\n/g, '\n- ')}`, 160);
                doc.text(achievements, 25, y);
                y += achievements.length * 4 + 5;
            }
        });
      }


      // --- Skills ---
      if (data.technicalSkills || data.softSkills) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', 20, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (data.technicalSkills) {
           doc.setFont('helvetica', 'bold');
           doc.text('Technical:', 25, y);
           doc.setFont('helvetica', 'normal');
           doc.text(data.technicalSkills, 45, y);
           y+= 6;
        }
        if (data.softSkills) {
           doc.setFont('helvetica', 'bold');
           doc.text('Soft:', 25, y);
           doc.setFont('helvetica', 'normal');
           doc.text(data.softSkills, 45, y);
           y+= 6;
        }
      }

      doc.save(`${data.fullName.replace(' ', '_')}_Resume.pdf`);

      toast({
        title: 'Resume Generated!',
        description: 'Your PDF has been downloaded.',
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error Generating PDF',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    saveDetails(data);
    toast({
      title: 'Details Saved!',
      description: "Your information has been updated. You can now generate your resume."
    });
  };

  if (!isDataLoaded) {
    return (
       <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    )
  }

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
          <Link href={flowType === 'professional' ? '/professional' : '/undergraduate'} passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">
            Resume Builder
          </h1>
        </div>
        <Card className="max-w-5xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGeneratePdf)}>
                    <CardHeader>
                        <CardTitle>Finalize Your Details</CardTitle>
                        <CardDescription>Review and edit your information below. Click "Save" to update your details, or "Generate PDF" to download your resume.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-4">
                           <h3 className="text-xl font-semibold">Personal Information</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="fullName" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="email" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input disabled {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="phone" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="linkedin" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="github" control={form.control} render={({ field }) => (
                                    <FormItem className="md:col-span-2"><FormLabel>GitHub URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                           </div>
                        </div>

                        <Separator />

                        {/* Education - UG Flow */}
                        {flowType === 'undergraduate' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Education</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="degreeName" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Degree Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name="specialization" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Specialization</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name="currentGrade" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Current Grade (CGPA/%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>
                        )}
                        
                        {/* Work Experience - Professional Flow */}
                        {flowType === 'professional' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
                                <div className="space-y-6">
                                    {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg relative">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`workExperience.${index}.role`} render={({ field }) => (
                                            <FormItem><FormLabel>Role / Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => (
                                            <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`workExperience.${index}.duration`} render={({ field }) => (
                                            <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`workExperience.${index}.achievements`} render={({ field }) => (
                                            <FormItem className="md:col-span-2"><FormLabel>Key Achievements</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ role: '', company: '', duration: '', achievements: '' })} className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" /> Add Experience
                                </Button>
                            </div>
                        )}

                        <Separator />

                        {/* Skills */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Skills</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="technicalSkills" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Technical Skills</FormLabel><FormControl><Textarea placeholder="e.g., Java, Python, React" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="softSkills" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Soft Skills</FormLabel><FormControl><Textarea placeholder="e.g., Communication, Leadership" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button type="button" variant="secondary" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Details
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Generate PDF
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      </main>
    </div>
  );
}
