'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, Save, Wand2, Plus, Trash2 } from 'lucide-react';
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
import { enhanceResumeDetails, ResumeDetailsInput, ResumeDetailsOutput } from '@/ai/flows/ai-resume-enhancer';

// ----------------------- SCHEMAS -----------------------
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
  achievements: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().optional(),
});

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  professionalTitle: z.string().min(1, 'A professional title is required.'),
  careerObjective: z.string().min(1, 'A career objective is required.'),
  education: z.array(educationSchema).min(1, 'At least one education entry is required.'),
  technicalSkills: z.string().optional(),
  softSkills: z.string().optional(),
  projects: z.array(projectSchema).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  extracurricular: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ----------------------- MAIN COMPONENT -----------------------
export default function ResumeBuilderPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const flowType = Cookies.get('resumeFlow');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      education: [{ degree: '', institution: '', year: '', score: '' }],
      workExperience: [],
      projects: [],
      extracurricular: '',
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control: form.control, name: "education" });
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control: form.control, name: "workExperience" });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control: form.control, name: "projects" });

  // ----------------------- PREFILL DATA -----------------------
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user && user.email) {
      form.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        professionalTitle: user.professionalTitle || (flowType === 'professional' ? 'Experienced Professional' : 'Aspiring Graduate'),
        careerObjective: user.careerObjective || 'Seeking a challenging role in a dynamic organization...',
        education: user.education || [{ degree: '', institution: '', year: '', score: '' }],
        workExperience: user.workExperience || [],
        projects: user.projects || [],
        technicalSkills: user.skills?.technical || '',
        softSkills: user.skills?.soft || '',
        extracurricular: user.extracurricular || '',
      });
      setIsDataLoaded(true);
    } else {
      router.push('/signin');
    }
  }, [form, router, flowType]);

  // ----------------------- SAVE DETAILS -----------------------
  const saveDetails = (data: FormValues) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = { ...currentUser, ...data, skills: { technical: data.technicalSkills, soft: data.softSkills } };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // ----------------------- PDF GENERATOR -----------------------
  const generatePdf = (data: ResumeDetailsOutput) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const addSection = (title: string) => {
      y += 15;
      doc.setFont('helvetica', 'bold').setFontSize(11);
      doc.text(title.toUpperCase(), margin, y);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 15;
    };

    // HEADER
    doc.setFont('helvetica', 'bold').setFontSize(22);
    doc.text(data.fullName.toUpperCase(), margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal').setFontSize(10);
    doc.text(data.professionalTitle, margin, y);
    y += 14;

    const contactInfo: any[] = [];
    if (data.phone) contactInfo.push(`+91 ${data.phone}`);
    if (data.email) contactInfo.push(data.email);
    if (data.linkedin) contactInfo.push(data.linkedin);
    if (data.github) contactInfo.push(data.github);
    doc.text(contactInfo.join(' | '), margin, y);
    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // CAREER OBJECTIVE
    addSection('Career Objective');
    const summaryLines = doc.splitTextToSize(data.careerObjective, contentWidth);
    doc.text(summaryLines, margin, y, { align: 'justify' });
    y += summaryLines.length * 12;

    // EDUCATION
    if (data.education?.length) {
      addSection('Education');
      data.education.forEach(edu => {
        doc.setFont('helvetica', 'bold').setFontSize(10).text(edu.degree, margin, y);
        doc.setFont('helvetica', 'normal').setFontSize(10).text(edu.year, pageWidth - margin, y, { align: 'right' });
        y += 12;
        doc.text(edu.institution, margin, y);
        if (edu.score) doc.text(edu.score, pageWidth - margin, y, { align: 'right' });
        y += 18;
      });
    }

    // SKILLS
    if (data.technicalSkills || data.softSkills) {
      addSection('Skills');
      if (data.technicalSkills) doc.text(`Technical: ${data.technicalSkills}`, margin, y);
      y += 12;
      if (data.softSkills) doc.text(`Soft: ${data.softSkills}`, margin, y);
      y += 15;
    }

    // PROJECTS
    if (data.projects?.length) {
      addSection('Projects');
      data.projects.forEach(proj => {
        doc.setFont('helvetica', 'bold').setFontSize(10).text(proj.name, margin, y);
        if (proj.url) doc.setTextColor(41, 128, 185).textWithLink('Link', pageWidth - margin, y, { url: proj.url });
        doc.setTextColor(0, 0, 0);
        y += 12;
        const descLines = doc.splitTextToSize(proj.description, contentWidth);
        doc.setFont('helvetica', 'normal').text(descLines, margin, y, { align: 'justify' });
        y += descLines.length * 12 + 5;
      });
    }

    // WORK EXPERIENCE
    if (data.workExperience?.length) {
      addSection('Work Experience');
      data.workExperience.forEach(exp => {
        doc.setFont('helvetica', 'bold').text(exp.role, margin, y);
        doc.text(exp.duration, pageWidth - margin, y, { align: 'right' });
        y += 12;
        doc.setFont('helvetica', 'normal').text(exp.company, margin, y);
        y += 12;
        exp.achievements?.split('\n').forEach(ach => {
          doc.circle(margin + 2, y - 3, 1.5, 'F');
          doc.text(doc.splitTextToSize(ach, contentWidth - 15), margin + 10, y);
          y += 12;
        });
        y += 5;
      });
    }

    // ACHIEVEMENTS
    if (data.extracurricular) {
      addSection('Achievements & Extracurricular');
      data.extracurricular.split('\n').forEach(item => {
        doc.circle(margin + 2, y - 3, 1.5, 'F');
        doc.text(doc.splitTextToSize(item, contentWidth - 15), margin + 10, y);
        y += 12;
      });
    }

    doc.save(`${data.fullName.replace(/ /g, '_')}_Resume.pdf`);
  };

  // ----------------------- HANDLE PDF GENERATION -----------------------
  const handleGeneratePdf = async (data: FormValues) => {
    setIsLoading(true);
    saveDetails(data);
    toast({ title: 'Enhancing resume with AI...', description: 'Please wait.' });
    try {
      const enhancedDataRaw = await enhanceResumeDetails({
        ...data,
        instruction: "Correct false/missing info, make ATS-friendly, justify text, add missing achievements."
      } as ResumeDetailsInput);

      const enhancedData = formSchema.parse({ ...data, ...enhancedDataRaw });
      form.reset(enhancedData);
      saveDetails(enhancedData);
      generatePdf(enhancedData);
      toast({ title: 'Resume Generated!', description: 'Your AI-enhanced PDF has been downloaded.' });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate resume.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------- UI -----------------------
  if (!isDataLoaded) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-14 max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center"><Bot className="h-6 w-6 text-primary" /><span className="ml-2 font-bold">Career Compass AI</span></Link>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="flex items-center mb-8">
          <Link href={flowType === 'professional' ? '/professional' : '/undergraduate'}>
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Resume Builder</h1>
        </div>
        <Card className="max-w-5xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGeneratePdf)}>
              <CardHeader>
                <CardTitle>Finalize Your Details</CardTitle>
                <CardDescription>Review, enhance with AI, and download your ATS-friendly resume.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Your existing input fields here, unchanged for brevity */}
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button type="button" variant="secondary" onClick={form.handleSubmit(saveDetails)} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" /> Save Details
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Enhance & Generate PDF
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
}
