
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, ArrowLeft, Loader2, Sparkles, User, BookOpen, Brain, Briefcase, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateAssessmentQuestions, AssessmentQuestionsOutput } from '@/ai/flows/ai-assessment-generation';
import { recommendUndergraduateOptions, UndergraduateOptionsOutput } from '@/ai/flows/undergraduate-career-advisor';
import { Progress } from '@/components/ui/progress';

const degreeData: Record<string, Record<string, Record<string, { skills: string[] }>>> = {
  Science: {
    'B.Tech/B.E.': {
      'Computer Science': { skills: ['Java', 'Python', 'C++', 'Data Structures', 'Algorithms', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'] },
      'Mechanical Engineering': { skills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Thermodynamics', 'Fluid Mechanics', 'CATIA'] },
      'Civil Engineering': { skills: ['AutoCAD', 'STAAD.Pro', 'Surveying', 'Structural Analysis', 'Concrete Technology'] },
      'Electrical Engineering': { skills: ['MATLAB', 'PSpice', 'VHDL', 'Circuit Design', 'Power Systems'] },
      'Electronics & Communication': { skills: ['VHDL', 'Verilog', 'Embedded C', 'DSP', 'Microcontrollers'] },
      'Information Technology': { skills: ['Java', 'Python', 'SQL', 'JavaScript', 'Networking', 'Cybersecurity'] },
    },
    'MBBS': {
      'General Medicine': { skills: ['Clinical Diagnosis', 'Pharmacology', 'Anatomy', 'Physiology', 'Patient Care'] },
      'Surgery': { skills: ['Surgical Procedures', 'Anatomy', 'Sterilization Techniques', 'Post-operative Care'] },
    },
    'B.Sc': {
      'Physics': { skills: ['Quantum Mechanics', 'Electromagnetism', 'MATLAB', 'Experimental Physics'] },
      'Chemistry': { skills: ['Organic Chemistry', 'Inorganic Chemistry', 'Lab Techniques', 'Spectroscopy'] },
      'Mathematics': { skills: ['Calculus', 'Linear Algebra', 'Statistics', 'R', 'Python'] },
      'Biology': { skills: ['Genetics', 'Microbiology', 'Molecular Biology', 'Lab Techniques'] },
      'Biotechnology': { skills: ['Genetic Engineering', 'PCR', 'Cell Culture', 'Bioinformatics'] },
      'Agriculture': { skills: ['Soil Science', 'Horticulture', 'Crop Management', 'Agri-business'] },
      'Computer Science': { skills: ['C++', 'Java', 'Web Development', 'Database Management', 'Networking'] },
    },
    'B.Pharm': {
      'Pharmacy': { skills: ['Pharmacology', 'Pharmaceutical Chemistry', 'Dispensing', 'Regulatory Affairs'] },
    },
    'BDS': {
      'Dental Surgery': { skills: ['Oral Diagnosis', 'Prosthodontics', 'Periodontics', 'Dental Materials'] },
    },
  },
  Commerce: {
    'B.Com': {
      'Accounting and Finance': { skills: ['Tally', 'GST', 'Financial Accounting', 'Auditing', 'MS Excel'] },
      'Taxation': { skills: ['Direct Tax', 'Indirect Tax', 'GST', 'Tally'] },
      'Banking and Insurance': { skills: ['Financial Products', 'Risk Management', 'Customer Service'] },
      'General Commerce': { skills: ['MS Office', 'Business Communication', 'Basic Accounting'] },
    },
    'BBA': {
      'Marketing': { skills: ['Digital Marketing', 'SEO', 'Market Research', 'Salesforce'] },
      'Finance': { skills: ['Financial Modeling', 'MS Excel', 'Capital Markets', 'Valuation'] },
      'Human Resources': { skills: ['Recruitment', 'HR Policies', 'Performance Management'] },
      'International Business': { skills: ['Export-Import', 'Global Strategy', 'Foreign Trade Policy'] },
    },
    'BMS': {
      'Management Studies': { skills: ['Project Management', 'Business Analytics', 'MS Office Suite'] },
    },
  },
  Arts: {
    'B.A.': {
      'History': { skills: ['Archival Research', 'Critical Analysis', 'Historiography'] },
      'Psychology': { skills: ['SPSS', 'Counseling', 'Research Methods', 'Cognitive Assessment'] },
      'Sociology': { skills: ['Qualitative Research', 'Quantitative Analysis', 'Social Theory'] },
      'Political Science': { skills: ['Public Policy Analysis', 'Comparative Politics', 'International Relations'] },
      'English Literature': { skills: ['Creative Writing', 'Critical Reading', 'Editing', 'Content Creation'] },
      'Journalism': { skills: ['Reporting', 'Video Editing', 'Content Management Systems (CMS)', 'Social Media'] },
    },
    'B.Des': {
      'Fashion Design': { skills: ['Adobe Illustrator', 'Pattern Making', 'Draping', 'Textile Knowledge'] },
      'Graphic Design': { skills: ['Adobe Photoshop', 'Illustrator', 'InDesign', 'UI/UX Principles'] },
      'Interior Design': { skills: ['AutoCAD', 'SketchUp', '3ds Max', 'Space Planning'] },
    },
    'LLB': {
      'Corporate Law': { skills: ['Contract Drafting', 'Legal Research', 'Due Diligence', 'M&A'] },
      'Criminal Law': { skills: ['Legal Research', 'Mooting', 'Drafting Pleadings', 'IPC/CrPC'] },
      'Civil Law': { skills: ['Drafting', 'Legal Notice', 'Client Counseling', 'CPC'] },
    },
  },
};


const academicSchema = z.object({
  tenthPercentage: z.coerce.number().min(0).max(100),
  twelfthPercentage: z.coerce.number().min(0).max(100),
  twelfthStream: z.enum(['Science', 'Commerce', 'Arts']),
  degreeName: z.string().min(1, 'Degree name is required.'),
  specialization: z.string().min(1, 'Specialization is required.'),
  currentGrade: z.coerce.number().min(0).max(100),
});

const skillsSchema = z.object({
    technical: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one technical skill.",
    }),
    soft: z.string().min(1, 'Please list at least one soft skill.'),
});

type AcademicFormValues = z.infer<typeof academicSchema>;
type SkillsFormValues = z.infer<typeof skillsSchema>;
type View = 'academic' | 'skills' | 'assessmentChoice' | 'assessment' | 'loading' | 'results';

export default function UndergraduatePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [view, setView] = React.useState<View>('academic');
  const [isLoading, setIsLoading] = React.useState(false);
  const [academicData, setAcademicData] = React.useState<AcademicFormValues | null>(null);
  const [skillsData, setSkillsData] = React.useState<SkillsFormValues | null>(null);
  const [assessment, setAssessment] = React.useState<AssessmentQuestionsOutput | null>(null);
  const [recommendation, setRecommendation] = React.useState<UndergraduateOptionsOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [testScore, setTestScore] = React.useState<number | null>(null);
  const [rawScore, setRawScore] = React.useState<number | null>(null);

  const academicForm = useForm<AcademicFormValues>({ 
    resolver: zodResolver(academicSchema),
    defaultValues: {
        tenthPercentage: '' as any,
        twelfthPercentage: '' as any,
        degreeName: '',
        specialization: '',
        currentGrade: '' as any,
    }
  });
  const skillsForm = useForm<SkillsFormValues>({ 
      resolver: zodResolver(skillsSchema),
      defaultValues: {
        technical: [],
        soft: '',
      }
   });

  const watchedStream = academicForm.watch('twelfthStream');
  const watchedDegree = academicForm.watch('degreeName');
  const watchedSpecialization = academicForm.watch('specialization');

  React.useEffect(() => {
    if (watchedStream) {
        academicForm.resetField('degreeName', { defaultValue: '' });
        academicForm.resetField('specialization', { defaultValue: '' });
    }
  }, [watchedStream, academicForm]);

  React.useEffect(() => {
    if (watchedDegree) {
        academicForm.resetField('specialization', { defaultValue: '' });
    }
  }, [watchedDegree, academicForm]);


  const handleAcademicSubmit = (data: AcademicFormValues) => {
    setAcademicData(data);
    setView('skills');
  };

  const handleSkillsSubmit = (data: SkillsFormValues) => {
    setSkillsData({
      technical: data.technical.join(', '),
      soft: data.soft,
    });
    setView('assessmentChoice');
  };

  const handleAssessmentChoice = async (choice: 'yes' | 'no') => {
    setIsLoading(true);
    if (choice === 'yes') {
      try {
        const assessmentData = await generateAssessmentQuestions({
          level: 'UG',
          topic: `Core concepts and aptitude for ${academicData?.degreeName} in ${academicData?.specialization}`,
          numberOfQuestions: 20,
        });
        setAssessment(assessmentData);
        setView('assessment');
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate assessment questions.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      await getRecommendations(null);
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < (assessment?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let score = 0;
      assessment?.questions.forEach((q, i) => {
        if (newAnswers[i].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) score++;
      });
      const finalScore = (score / (assessment?.questions.length ?? 1)) * 100;
      setRawScore(score);
      setTestScore(finalScore);
      getRecommendations(finalScore);
    }
  };

  const getRecommendations = async (score: number | null) => {
    if (!academicData || !skillsData) return;
    setView('loading');
    setIsLoading(true);
    try {
      // Save all data to localStorage before getting recommendations
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        academics: academicData,
        skills: skillsData,
        assessmentScore: score,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      const result = await recommendUndergraduateOptions({
        academics: academicData,
        skills: skillsData,
        assessmentScore: score ?? undefined,
      });
      setRecommendation(result);
      setView('results');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not get recommendations.' });
      setView('assessmentChoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResume = () => {
    Cookies.set('resumeFlow', 'undergraduate');
    router.push('/resume-builder');
  };

  const startOver = () => {
    setView('academic');
    setAcademicData(null);
    setSkillsData(null);
    setAssessment(null);
    setRecommendation(null);
    setTestScore(null);
    setRawScore(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    academicForm.reset();
    skillsForm.reset();
  };
  
  const renderStep = () => {
    switch (view) {
      case 'academic': return renderAcademicForm();
      case 'skills': return renderSkillsForm();
      case 'assessmentChoice': return renderAssessmentChoice();
      case 'assessment': return renderAssessment();
      case 'loading': return renderLoading();
      case 'results': return renderRecommendations();
      default: return null;
    }
  }

  const renderAcademicForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Academic Information</CardTitle>
        <CardDescription>Let's start with your academic background.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...academicForm}>
          <form onSubmit={academicForm.handleSubmit(handleAcademicSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="tenthPercentage" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>10th Percentage</FormLabel><FormControl><Input type="number" placeholder="e.g., 85" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="twelfthPercentage" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>12th Percentage</FormLabel><FormControl><Input type="number" placeholder="e.g., 90" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="twelfthStream" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>12th Stream</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Science">Science</SelectItem><SelectItem value="Commerce">Commerce</SelectItem><SelectItem value="Arts">Arts</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              
              <FormField name="degreeName" control={academicForm.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Degree Name</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchedStream}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {watchedStream && degreeData[watchedStream] && Object.keys(degreeData[watchedStream]).map(degree => (
                                <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )} />
              
              <FormField name="specialization" control={academicForm.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Specialization</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchedDegree}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {watchedStream && watchedDegree && degreeData[watchedStream]?.[watchedDegree] &&
                                Object.keys(degreeData[watchedStream][watchedDegree]).map(spec => (
                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )} />

              <FormField name="currentGrade" control={academicForm.control} render={({ field }) => (
                <FormItem><FormLabel>Current CGPA / Percentage</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 8.5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Button type="submit">Next: Skills</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderSkillsForm = () => {
    const technicalSkillsOptions = academicData?.twelfthStream && academicData.degreeName && academicData.specialization
      ? degreeData[academicData.twelfthStream]?.[academicData.degreeName]?.[academicData.specialization]?.skills || []
      : [];
    
    return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Your Skills</CardTitle>
        <CardDescription>
          List your skills based on your degree. Please separate each skill with a comma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...skillsForm}>
          <form onSubmit={skillsForm.handleSubmit(handleSkillsSubmit)} className="space-y-6">
            <FormField
              control={skillsForm.control}
              name="technical"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technical Skills</FormLabel>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        {field.value?.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {field.value.map((skill) => <Badge key={skill}>{skill}</Badge>)}
                          </div>
                        ) : 'Select your technical skills'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuLabel>Suggested Skills</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {technicalSkillsOptions.map((skill) => (
                        <DropdownMenuCheckboxItem
                          key={skill}
                          checked={field.value?.includes(skill)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), skill])
                              : field.onChange(field.value?.filter((value) => value !== skill))
                          }}
                        >
                          {skill}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField name="soft" control={skillsForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Soft Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Communication, Leadership, Teamwork" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setView('academic')}>Back</Button>
              <Button type="submit">Next: Assessment</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    );
  };
  
  const renderAssessmentChoice = () => (
      <Card>
          <CardHeader>
              <CardTitle>Step 3: Career Assessment</CardTitle>
              <CardDescription>A quick test can help us provide more accurate recommendations. Would you like to take one?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => handleAssessmentChoice('yes')} className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Test...</> : 'Yes, Start Test'}
              </Button>
              <Button variant="secondary" onClick={() => handleAssessmentChoice('no')} className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Advice...</> : 'No, Skip to Recommendations'}
              </Button>
          </CardContent>
           <CardFooter>
              <Button variant="outline" onClick={() => setView('skills')}>Back</Button>
           </CardFooter>
      </Card>
  );

  const renderAssessment = () => {
    if (!assessment) return null;
    const question = assessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

    return (
      <Form {...academicForm}>
        <form>
          <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">Assessment Test</CardTitle>
              <CardDescription>Question {currentQuestionIndex + 1} of {assessment.questions.length}</CardDescription>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg font-semibold mb-6 leading-relaxed">{question.question}</p>
              <RadioGroup onValueChange={handleAnswerSubmit} key={currentQuestionIndex} className="space-y-4">
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
  
  const renderLoading = () => (
     <Card>
      <CardHeader>
        {testScore !== null ? (
            <CardTitle>Assessment Complete!</CardTitle>
        ) : (
            <CardTitle>Generating Your Future Path...</CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-8">
        {testScore !== null && rawScore !== null && assessment ? (
             <div className="text-center">
                <p>Your score: <strong className="text-primary">{rawScore}/{assessment.questions.length} ({testScore.toFixed(2)}%)</strong></p>
                <p className="mt-4 text-muted-foreground">Now generating your career recommendation based on your marks and test score.</p>
             </div>
        ): (
            <p className="text-muted-foreground">Please wait while our AI analyzes your profile.</p>
        )}
        <Loader2 className="h-12 w-12 animate-spin text-primary mt-4" />
      </CardContent>
    </Card>
  );

  const renderRecommendations = () => {
    if (!recommendation) return null;

    return (
      <Card className="bg-primary/5">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-primary font-headline">Your Personalized Recommendations</CardTitle>
            </div>
            {testScore !== null ? (
              <CardDescription>
                Based on your academics, skills, and assessment score, here are some tailored suggestions for your career journey.
              </CardDescription>
            ) : (
               <CardDescription>
                Based on your academics and skills, here are some tailored suggestions for your career journey.
              </CardDescription>
            )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-1 gap-8">
           {testScore !== null && rawScore !== null && assessment && (
              <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-center">Assessment Result</h4>
                  <p className="text-center text-muted-foreground text-sm mt-1">
                      You scored <strong className="text-primary">{rawScore}/{assessment.questions.length}</strong> which is <strong className="text-primary">{testScore.toFixed(2)}%</strong>.
                  </p>
              </div>
            )}
          <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Briefcase className="text-accent" /> Recommended Job Roles</h3>
              <div className="space-y-4">
                  {recommendation.jobRoles.map((job, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border">
                          <h4 className="font-semibold">{job.role}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{job.reason}</p>
                      </div>
                  ))}
              </div>
          </div>
          <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-accent"/> Higher Studies & Certifications</h3>
              <div className="space-y-4">
                  {recommendation.higherStudies.map((study, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border">
                          <h4 className="font-semibold">{study.course}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{study.reason}</p>
                      </div>
                  ))}
              </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
            <div className="flex gap-4">
              <Button onClick={startOver}>Start Over</Button>
              <Button onClick={handleGenerateResume}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Resume
              </Button>
            </div>
             <p className="text-xs text-muted-foreground">
                You can now generate a resume based on the information you've provided.
            </p>
        </CardFooter>
      </Card>
    );
  };

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
            Undergraduate Career Guide
          </h1>
        </div>
        <div className="max-w-5xl mx-auto">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
