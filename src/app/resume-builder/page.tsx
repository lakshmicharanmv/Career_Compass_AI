
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

const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  year: z.string().min(1, 'Year of completion is required'),
  score: z.string().optional(),
});

const workExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  duration: z.string().min(1, 'Duration is required'),
  achievements: z.string().min(1, 'Please list at least one achievement.'),
});

const projectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Description is required'),
    url: z.string().url().optional().or(z.literal('')),
});

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  
  careerObjective: z.string().min(1, 'A career objective or summary is required.'),
  
  education: z.array(educationSchema).min(1, 'At least one education entry is required.'),
  workExperience: z.array(workExperienceSchema).optional(),
  projects: z.array(projectSchema).optional(),

  technicalSkills: z.string().optional(),
  softSkills: z.string().optional(),

});

type FormValues = z.infer<typeof formSchema>;

export default function ResumeBuilderPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const flowType = Cookies.get('resumeFlow'); 

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      education: [],
      workExperience: [],
      projects: [],
      careerObjective: '',
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control: form.control, name: "education" });
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control: form.control, name: "workExperience" });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control: form.control, name: "projects" });

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user && user.email) {
      const education = [];
      if (user.academics?.degreeName) {
        education.push({
            degree: `${user.academics.degreeName} in ${user.academics.specialization}`,
            institution: 'My College/University', // Placeholder
            year: 'Expected Graduation Year', // Placeholder
            score: `Current Grade: ${user.academics.currentGrade}`
        })
      }
       if (user.academics?.twelfthPercentage) {
        education.push({
            degree: `Class XII (${user.academics.twelfthStream})`,
            institution: 'My School', // Placeholder
            year: 'Completion Year', // Placeholder
            score: `Percentage: ${user.academics.twelfthPercentage}%`
        })
      }
       if (user.academics?.tenthPercentage) {
        education.push({
            degree: `Class X`,
            institution: 'My School', // Placeholder
            year: 'Completion Year', // Placeholder
            score: `Percentage: ${user.academics.tenthPercentage}%`
        })
      }

      form.reset({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        careerObjective: user.careerObjective || 'Seeking a challenging role in a dynamic organization to leverage my skills in [Your Key Skill] and contribute to organizational growth.',
        education: user.education && user.education.length > 0 ? user.education : (education.length > 0 ? education : [{ degree: '', institution: '', year: '', score: '' }]),
        workExperience: user.workExperience && user.workExperience.length > 0 ? user.workExperience : [],
        projects: user.projects && user.projects.length > 0 ? user.projects : [],
        technicalSkills: user.skills?.technical || '',
        softSkills: user.skills?.soft || '',
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
      careerObjective: data.careerObjective,
      education: data.education,
      workExperience: data.workExperience,
      projects: data.projects,
      skills: {
        ...currentUser.skills,
        technical: data.technicalSkills,
        soft: data.softSkills,
      },
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };


  const handleGeneratePdf = (data: FormValues) => {
    setIsLoading(true);
    saveDetails(data);

    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 36; // 0.5 inch
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;
      let y = margin + 10;

      // --- Helper Functions ---
      const checkPageBreak = (spaceNeeded: number) => {
        if (y + spaceNeeded > doc.internal.pageSize.getHeight() - margin) {
            // This is a simple single-page resume generator, so we won't add a new page.
            // In a more complex scenario, you would add doc.addPage() and reset y here.
        }
      };

      const addSection = (title: string, contentRenderer: () => void) => {
        checkPageBreak(40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(title.toUpperCase(), margin, y);
        y += 8;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 20;
        contentRenderer();
      };
      
      // --- Header ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text(data.fullName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 20;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('PROFESSIONAL TITLE', pageWidth / 2, y, { align: 'center'});
      y += 15;
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      const contactInfo = [data.phone, data.email].filter(Boolean).join('  |  ');
      doc.text(contactInfo, pageWidth / 2, y, { align: 'center' });
      const socialLinks = [data.linkedin, data.github].filter(Boolean).join('  |  ');
      if(socialLinks) {
          y += 15;
          doc.text(socialLinks, pageWidth / 2, y, { align: 'center' });
      }
      y += 25;


      // --- Professional Summary ---
      addSection('Professional Summary', () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(data.careerObjective, contentWidth);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 12 + 10;
      });

      // --- Work Experience ---
      if (data.workExperience && data.workExperience.length > 0 && data.workExperience.some(e => e.role)) {
        addSection('Work Experience', () => {
          data.workExperience?.forEach(exp => {
              if(!exp.role) return;

              checkPageBreak(50);
              doc.setFontSize(11);
              doc.setFont('helvetica', 'bold');
              doc.text(exp.company, margin, y);
              
              doc.setFont('helvetica', 'normal');
              doc.text(exp.duration, pageWidth - margin, y, { align: 'right' });
              y += 15;

              doc.setFont('helvetica', 'italic');
              doc.text(exp.role, margin, y);
              y += 15;
              
              doc.setFontSize(10);
              const achievements = exp.achievements.split('\n').filter((line:string) => line.trim() !== '');
              achievements.forEach((ach: string) => {
                  checkPageBreak(12);
                  doc.circle(margin + 5, y - 4, 1.5, 'F');
                  const lines = doc.splitTextToSize(ach, contentWidth - 15);
                  doc.text(lines, margin + 15, y);
                  y += lines.length * 12;
              });
              y += 10;
          });
        });
      }

      // --- Projects ---
      if (data.projects && data.projects.length > 0 && data.projects.some(p => p.name)) {
        addSection('Projects', (proj) => {
            data.projects?.forEach(proj => {
              if(!proj.name) return;

              checkPageBreak(40);
              doc.setFontSize(11);
              doc.setFont('helvetica', 'bold');
              doc.text(proj.name, margin, y);

              if (proj.url) {
                  doc.setFont('helvetica', 'normal');
                  doc.setTextColor(0, 0, 255);
                  doc.textWithLink('Link', pageWidth - margin, y, { align: 'right', url: proj.url });
                  doc.setTextColor(0, 0, 0);
              }
              y += 15;
              
              doc.setFontSize(10);
              const descriptionLines = proj.description.split('\n').filter((line: string) => line.trim() !== '');
              descriptionLines.forEach((desc: string) => {
                  checkPageBreak(12);
                  doc.circle(margin + 5, y - 4, 1.5, 'F');
                  const lines = doc.splitTextToSize(desc, contentWidth - 15);
                  doc.text(lines, margin + 15, y);
                  y += lines.length * 12;
              });
              y += 10;
          });
        });
      }

      // --- Education ---
      addSection('Education', () => {
          data.education.forEach(edu => {
              checkPageBreak(30);
              doc.setFontSize(11);
              doc.setFont('helvetica', 'bold');
              doc.text(edu.degree, margin, y);

              doc.setFont('helvetica', 'normal');
              doc.text(edu.year, pageWidth - margin, y, { align: 'right' });
              y += 15;

              doc.setFont('helvetica', 'italic');
              doc.text(edu.institution, margin, y);
              if (edu.score) {
                  doc.setFont('helvetica', 'normal');
                  doc.text(edu.score, pageWidth - margin, y, { align: 'right' });
              }
              y += 15;
          });
      });
      
      // --- Skills ---
      addSection('Skills', () => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          let skillsText = '';
          if (data.technicalSkills) skillsText += `Technical: ${data.technicalSkills.split(',').map(s => s.trim()).join(' | ')}`;
          if (data.technicalSkills && data.softSkills) skillsText += '\n';
          if (data.softSkills) skillsText += `Soft Skills: ${data.softSkills.split(',').map(s => s.trim()).join(' | ')}`;
          const skillLines = doc.splitTextToSize(skillsText, contentWidth);
          doc.text(skillLines, margin, y);
      });
      
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
                        
                        <div className="space-y-4">
                           <h3 className="text-xl font-semibold">Personal Information</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="fullName" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField name="email" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input disabled {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField name="phone" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField name="linkedin" control={form.control} render={({ field }) => ( <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField name="github" control={form.control} render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>GitHub URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                           </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Career Objective / Summary</h3>
                             <FormField name="careerObjective" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Objective</FormLabel><FormControl><Textarea placeholder="e.g., A highly motivated individual seeking a challenging role..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>

                        <Separator />
                        
                         <div>
                            <h3 className="text-xl font-semibold mb-4">Education</h3>
                            <div className="space-y-6">
                                {educationFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Degree / Qualification</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => ( <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`education.${index}.year`} render={({ field }) => ( <FormItem><FormLabel>Year</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`education.${index}.score`} render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Score (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(index)}> <Trash2 className="h-4 w-4" /> </Button>
                                </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ degree: '', institution: '', year: '', score: '' })} className="mt-4"> <Plus className="mr-2 h-4 w-4" /> Add Education </Button>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
                            <div className="space-y-6">
                                {experienceFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`workExperience.${index}.role`} render={({ field }) => ( <FormItem><FormLabel>Role / Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`workExperience.${index}.duration`} render={({ field }) => ( <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`workExperience.${index}.achievements`} render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Key Achievements (one per line)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExperience(index)}> <Trash2 className="h-4 w-4" /> </Button>
                                </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendExperience({ role: '', company: '', duration: '', achievements: '' })} className="mt-4"> <Plus className="mr-2 h-4 w-4" /> Add Experience </Button>
                        </div>

                         <Separator />

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Projects</h3>
                            <div className="space-y-6">
                                {projectFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                         <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => ( <FormItem><FormLabel>Project URL (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Description (one achievement per line)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeProject(index)}> <Trash2 className="h-4 w-4" /> </Button>
                                </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendProject({ name: '', description: '', url: '' })} className="mt-4"> <Plus className="mr-2 h-4 w-4" /> Add Project </Button>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Skills</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="technicalSkills" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Technical Skills (comma-separated)</FormLabel><FormControl><Textarea placeholder="e.g., Java, Python, React" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField name="softSkills" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Soft Skills (comma-separated)</FormLabel><FormControl><Textarea placeholder="e.g., Communication, Leadership" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
