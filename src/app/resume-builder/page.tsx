
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
  techStack: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
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
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      professionalTitle: '',
      careerObjective: '',
      education: [],
      workExperience: [],
      projects: [],
      technicalSkills: '',
      softSkills: '',
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
      const defaultEducation = user.education || [{ degree: '', institution: '', year: '', score: '' }];

      form.reset({
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        professionalTitle: user.professionalTitle || (flowType === 'professional' ? 'Experienced Professional' : 'Aspiring Graduate'),
        careerObjective: user.careerObjective || 'Seeking a challenging role in a dynamic organization to leverage my skills.',
        education: defaultEducation.length > 0 ? defaultEducation : [{ degree: '', institution: '', year: '', score: '' }],
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
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = { 
        ...currentUser, 
        ...data, 
        skills: { technical: data.technicalSkills, soft: data.softSkills } 
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast({ title: 'Details Saved!', description: 'Your information has been successfully saved.' });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error Saving!', description: 'Could not save your details.' });
    }
  };

  // ----------------------- PDF GENERATOR -----------------------
  const generatePdf = (data: ResumeDetailsOutput) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = margin + 10; 

    const nameFontSize = 22;
    const headingFontSize = 12;
    const bodyFontSize = 10.5;
    const contactFontSize = 10;
    const lineHeight = 1.3;

    doc.setFont('helvetica');

    // --- HEADER ---
    doc.setFontSize(nameFontSize).setFont('helvetica', 'bold');
    doc.text(data.fullName.toUpperCase(), margin, y);

    // --- Contact info block ---
    const contactInfo = [
      data.email,
      data.phone ? `+91 ${data.phone}` : undefined,
      data.linkedin,
      data.github,
    ].filter(Boolean) as string[];
    
    doc.setFontSize(contactFontSize).setFont('helvetica', 'normal');
    let contactY = y - (contactFontSize * 0.5); 
    contactInfo.forEach((info) => {
        doc.text(info, pageWidth - margin, contactY, { align: 'right' });
        contactY += contactFontSize * lineHeight;
    });

    const headerHeight = Math.max(doc.getTextDimensions(data.fullName.toUpperCase()).h, contactInfo.length * contactFontSize * lineHeight);
    y += headerHeight;
    
    const addSection = (title: string) => {
        y += 10; // spacing before section
        if (y > doc.internal.pageSize.getHeight() - 80) { 
            doc.addPage();
            y = margin;
        }
        doc.setFontSize(headingFontSize).setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), margin, y);
        y += 3;
        doc.setDrawColor(0).setLineWidth(0.5).line(margin, y, pageWidth - margin, y);
        y += 15;
    };
    
    // --- CAREER OBJECTIVE ---
    if (data.careerObjective) {
        addSection('CAREER OBJECTIVE');
        doc.setFontSize(bodyFontSize).setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(data.careerObjective, contentWidth);
        doc.text(summaryLines, margin, y, { align: 'left', lineHeightFactor: 1.5 });
        const summaryHeight = doc.getTextDimensions(summaryLines).h * 1.15;
        y += summaryHeight + 5;
    }
    
    // --- EDUCATION ---
    if (data.education?.length) {
      addSection('EDUCATIONAL QUALIFICATIONS');
      doc.setFontSize(bodyFontSize).setFont('helvetica', 'normal');
      data.education.forEach(edu => {
        if (y > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); y = margin; }
        doc.setFont('helvetica', 'bold').text(edu.degree, margin, y);
        doc.setFont('helvetica', 'normal').text(edu.year, pageWidth - margin, y, { align: 'right' });
        y += bodyFontSize * lineHeight;
        
        doc.setFont('helvetica', 'normal').text(edu.institution, margin, y);
        y += bodyFontSize * lineHeight;

        if (edu.score) {
          doc.text(`Score: ${edu.score}`, margin, y);
          y += bodyFontSize * lineHeight;
        }
        y += 5; // Spacing after each entry
      });
    }

    // --- SKILLS ---
    if (data.technicalSkills || data.softSkills) {
        addSection('SKILLS');
        doc.setFontSize(bodyFontSize);

        if (data.technicalSkills) {
            doc.setFont('helvetica', 'bold').text('Technical Skills: ', margin, y);
            const tsX = margin + doc.getTextWidth('Technical Skills: ');
            const skillLines = doc.splitTextToSize(data.technicalSkills, contentWidth - doc.getTextWidth('Technical Skills: '));
            doc.setFont('helvetica', 'normal').text(skillLines, tsX, y);
            y += doc.getTextDimensions(skillLines).h;
        }
        if (data.softSkills) {
            if(data.technicalSkills) y += bodyFontSize * lineHeight * 0.5; // add a bit of space
            doc.setFont('helvetica', 'bold').text('Soft Skills: ', margin, y);
            const ssX = margin + doc.getTextWidth('Soft Skills: ');
            const softSkillLines = doc.splitTextToSize(data.softSkills, contentWidth - doc.getTextWidth('Soft Skills: '));
            doc.setFont('helvetica', 'normal').text(softSkillLines, ssX, y);
            y += doc.getTextDimensions(softSkillLines).h;
        }
         y += 5;
    }

    // --- PROJECTS ---
    if (data.projects?.length) {
      addSection('PROJECTS');
      data.projects.forEach(proj => {
        if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = margin; }
        doc.setFontSize(bodyFontSize).setFont('helvetica', 'bold').text(proj.name, margin, y);
        if (proj.url) {
            doc.setFontSize(bodyFontSize - 1).setTextColor(41, 128, 185).textWithLink('View Project', pageWidth - margin, y, { url: proj.url, align: 'right' });
            doc.setTextColor(0);
        }
        y += bodyFontSize * lineHeight;

        doc.setFont('helvetica', 'normal').setFontSize(bodyFontSize);
        const descLines = doc.splitTextToSize(proj.description, contentWidth);
        const descHeight = descLines.length * bodyFontSize * 1.5;
        doc.text(descLines, margin, y, { align: 'left', lineHeightFactor: 1.5 });
        y += descHeight;

        if (proj.techStack) {
            y += bodyFontSize * lineHeight * 0.5;
            doc.setFont('helvetica', 'bold').setFontSize(bodyFontSize - 1).text('Tech Stack: ', margin, y);
            const tsX = margin + doc.getTextWidth('Tech Stack: ');
            doc.setFont('helvetica', 'normal').text(proj.techStack, tsX, y);
            y += bodyFontSize * lineHeight;
        }
        y += 5;
      });
    }

    // --- WORK EXPERIENCE ---
    if (data.workExperience?.length) {
        addSection('WORK EXPERIENCE');
        doc.setFontSize(bodyFontSize).setFont('helvetica', 'normal');
        data.workExperience.forEach(exp => {
            if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = margin; }
            doc.setFont('helvetica', 'bold').text(exp.role, margin, y);
            doc.setFont('helvetica', 'normal').text(exp.duration, pageWidth - margin, y, { align: 'right' });
            y += bodyFontSize * lineHeight;

            doc.setFont('helvetica', 'bold').text(exp.company, margin, y);
            y += bodyFontSize * lineHeight;
            doc.setFont('helvetica', 'normal'); // Reset font to normal
            
            if (exp.achievements) {
                const achievementLines = doc.splitTextToSize(exp.achievements, contentWidth - 15); // Adjust width for bullet
                achievementLines.forEach((line: string) => {
                    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = margin; }
                    doc.text(`- ${line.replace(/^- /, '')}`, margin + 5, y, { align: 'left', lineHeightFactor: 1.5 });
                    y += (bodyFontSize * 1.15);
                });
            }
            y += 5; // Spacing after each experience
        });
    }

    // --- ACHIEVEMENTS ---
    if (data.extracurricular) {
        addSection('ACHIEVEMENTS & EXTRACURRICULAR ACTIVITIES');
        doc.setFont('helvetica', 'normal').setFontSize(bodyFontSize);
        const extracurricularLines = doc.splitTextToSize(data.extracurricular, contentWidth - 15);
        extracurricularLines.forEach((line: string) => {
            if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = margin; }
            doc.text(`- ${line.replace(/^- /, '')}`, margin + 5, y, { align: 'left', lineHeightFactor: 1.5 });
            y += (bodyFontSize * 1.15);
        });
    }

    doc.save(`${data.fullName.replace(/ /g, '_')}_Resume.pdf`);
  };


  // ----------------------- HANDLE PDF GENERATION -----------------------
  const handleGeneratePdf = async (data: FormValues) => {
    setIsLoading(true);
    saveDetails(data);
    toast({ title: 'Enhancing resume with AI...', description: 'Our expert AI is polishing your resume. Please wait.' });
    try {
      const enhancedData = await enhanceResumeDetails(data as ResumeDetailsInput);

      if (enhancedData) {
        const validatedData = formSchema.parse({ ...data, ...enhancedData });
        form.reset(validatedData);
        saveDetails(validatedData);
        generatePdf(validatedData);
        toast({ title: 'Resume Generated!', description: 'Your AI-enhanced PDF has been downloaded.' });
      } else {
        throw new Error("AI enhancement returned no data.");
      }
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate the resume. Please check the console for details.' });
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center" prefetch={false}><Bot className="h-6 w-6 text-primary" /><span className="ml-2 font-bold font-headline text-lg">Career Compass AI</span></Link>
        </div>
      </header>

      <main className="flex-1 container py-12 md:py-16">
        <div className="flex items-center mb-8">
          <Link href={flowType === 'professional' ? '/professional' : '/undergraduate'}>
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">Resume Builder</h1>
        </div>
        <Card className="max-w-5xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGeneratePdf)}>
              <CardHeader>
                <CardTitle>Finalize Your Details</CardTitle>
                <CardDescription>Review, enhance with AI, and download your ATS-friendly resume.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="linkedin" render={({ field }) => ( <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="github" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>GitHub URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                </div>
                <Separator />
                {/* Professional Title, Career Objective */}
                 <div className="space-y-4">
                  <FormField control={form.control} name="professionalTitle" render={({ field }) => ( <FormItem><FormLabel>Professional Title</FormLabel><FormControl><Input placeholder="e.g., Aspiring Software Engineer" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="careerObjective" render={({ field }) => ( <FormItem><FormLabel>Career Objective</FormLabel><FormControl><Textarea placeholder="A brief 2-3 sentence summary of your career goals." {...field} /></FormControl><FormMessage /></FormItem> )} />
                 </div>
                <Separator />
                {/* Education */}
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium">Education</h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ degree: '', institution: '', year: '', score: '' })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Education
                      </Button>
                   </div>
                    {educationFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeEducation(index)}><Trash2 className="h-4 w-4" /></Button>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => ( <FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => ( <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`education.${index}.year`} render={({ field }) => ( <FormItem><FormLabel>Year of Completion</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`education.${index}.score`} render={({ field }) => ( <FormItem><FormLabel>Score (CGPA/%)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                         </div>
                      </div>
                    ))}
                 </div>
                 <Separator />
                 {/* Skills */}
                 <div className="space-y-4">
                   <h3 className="text-lg font-medium">Skills</h3>
                    <FormField control={form.control} name="technicalSkills" render={({ field }) => ( <FormItem><FormLabel>Technical Skills</FormLabel><FormControl><Input placeholder="Comma-separated skills, e.g., Java, Python, SQL" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="softSkills" render={({ field }) => ( <FormItem><FormLabel>Soft Skills</FormLabel><FormControl><Input placeholder="Comma-separated skills, e.g., Communication, Teamwork" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 </div>
                <Separator />
                 {/* Projects */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium">Projects</h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => appendProject({ name: '', description: '', techStack: '', url: '' })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Project
                      </Button>
                   </div>
                    {projectFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeProject(index)}><Trash2 className="h-4 w-4" /></Button>
                         <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name={`projects.${index}.techStack`} render={({ field }) => ( <FormItem><FormLabel>Tech Stack</FormLabel><FormControl><Input placeholder="e.g., React, Node.js, Firebase" {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => ( <FormItem><FormLabel>Project URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                      </div>
                    ))}
                 </div>
                <Separator />
                 {/* Experience */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium">Work Experience</h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => appendExperience({ role: '', company: '', duration: '', achievements: '' })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Experience
                      </Button>
                   </div>
                    {experienceFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeExperience(index)}><Trash2 className="h-4 w-4" /></Button>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name={`workExperience.${index}.role`} render={({ field }) => ( <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                           <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                         </div>
                         <FormField control={form.control} name={`workExperience.${index}.duration`} render={({ field }) => ( <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name={`workExperience.${index}.achievements`} render={({ field }) => ( <FormItem><FormLabel>Achievements/Responsibilities</FormLabel><FormControl><Textarea placeholder="List achievements as bullet points, one per line." {...field} /></FormControl><FormMessage /></FormItem> )} />
                      </div>
                    ))}
                 </div>
                 <Separator />
                 {/* Achievements */}
                 <div className="space-y-4">
                    <FormField control={form.control} name="extracurricular" render={({ field }) => ( 
                      <FormItem>
                        <FormLabel>Achievements or Extracurricular Activities</FormLabel>
                        <FormControl><Textarea placeholder="List items one per line." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem> 
                    )} />
                 </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button type="button" variant="secondary" onClick={() => saveDetails(form.getValues())} disabled={isLoading}>
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

    