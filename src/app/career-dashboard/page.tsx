
'use client';

import Link from 'next/link';
import * as React from 'react';
import Image from 'next/image';
import { Bot, ArrowLeft, BarChart, DollarSign, BrainCircuit, Search, Building, Briefcase, Target, Map, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Progress } from '@/components/ui/progress';

const placeholderData = {
  'Information Technology': {
    'all-india': {
      jobTrends: [
        { name: 'AI/ML Engineer', growth: 25 },
        { name: 'Data Scientist', growth: 22 },
        { name: 'Cybersecurity Analyst', growth: 18 },
        { name: 'Cloud Architect', growth: 20 },
        { name: 'DevOps Engineer', growth: 15 },
      ],
      salary: [
          { level: 'Entry-Level', salary: 700000 },
          { level: 'Mid-Level', salary: 1400000 },
          { level: 'Senior-Level', salary: 2500000 },
      ],
      skills: [
          { skill: 'Python', demand: 95 },
          { skill: 'Cloud (AWS/Azure)', demand: 90 },
          { skill: 'Communication', demand: 85 },
          { skill: 'Kubernetes', demand: 80 },
          { skill: 'Problem Solving', demand: 90 },
          { skill: 'SQL', demand: 75 },
      ],
      companies: [
          { name: 'Google', logo: 'https://placehold.co/40x40.png', hint: 'google logo' },
          { name: 'Amazon', logo: 'https://placehold.co/40x40.png', hint: 'amazon logo' },
          { name: 'Microsoft', logo: 'https://placehold.co/40x40.png', hint: 'microsoft logo' },
          { name: 'TCS', logo: 'https://placehold.co/40x40.png', hint: 'tcs logo' },
      ],
      skillGap: {
        targetRole: 'AI/ML Engineer',
        skills: [
          { name: 'Python & Libraries', value: 90 },
          { name: 'Machine Learning Frameworks', value: 75 },
          { name: 'Cloud Platforms (AWS/GCP)', value: 60 },
        ],
      },
      careerPath: {
        currentRole: 'Software Engineer',
        nextRoles: ['Senior Engineer', 'Tech Lead', 'Engineering Manager'],
      },
    },
    'bangalore': {
        jobTrends: [ { name: 'AI/ML Engineer', growth: 30 }, { name: 'SDE', growth: 25 }, { name: 'Cloud Architect', growth: 22 } ],
        salary: [ { level: 'Entry-Level', salary: 800000 }, { level: 'Mid-Level', salary: 1600000 }, { level: 'Senior-Level', salary: 2800000 } ],
        skills: [ { skill: 'Python', demand: 98 }, { skill: 'Cloud', demand: 95 }, { skill: 'System Design', demand: 90 } ],
        companies: [ { name: 'Flipkart', logo: 'https://placehold.co/40x40.png', hint: 'flipkart logo' }, { name: 'Swiggy', logo: 'https://placehold.co/40x40.png', hint: 'swiggy logo' } ],
        skillGap: {
          targetRole: 'Senior SDE',
          skills: [
            { name: 'System Design', value: 80 },
            { name: 'Advanced Algorithms', value: 65 },
            { name: 'Mentorship', value: 50 },
          ],
        },
        careerPath: {
          currentRole: 'SDE-1',
          nextRoles: ['SDE-2', 'SDE-3', 'Principal Engineer'],
        },
    }
  },
  'Healthcare': {
    'all-india': {
      jobTrends: [
        { name: 'Nurse Practitioner', growth: 22 },
        { name: 'Health Manager', growth: 20 },
        { name: 'Physical Therapist', growth: 18 },
        { name: 'Medical Assistant', growth: 16 },
      ],
       salary: [
          { level: 'Entry-Level', salary: 600000 },
          { level: 'Mid-Level', salary: 900000 },
          { level: 'Senior-Level', salary: 1500000 },
      ],
      skills: [
          { skill: 'Patient Care', demand: 98 },
          { skill: 'EMR Systems', demand: 90 },
          { skill: 'Empathy', demand: 95 },
          { skill: 'Medical Billing', demand: 80 },
          { skill: 'Critical Thinking', demand: 88 },
          { skill: 'Pharmacology', demand: 75 },
      ],
      companies: [
          { name: 'Apollo Hospitals', logo: 'https://placehold.co/40x40.png', hint: 'hospital logo' },
          { name: 'Fortis Healthcare', logo: 'https://placehold.co/40x40.png', hint: 'hospital building' },
          { name: 'Max Healthcare', logo: 'https://placehold.co/40x40.png', hint: 'healthcare logo' },
          { name: 'AIIMS', logo: 'https://placehold.co/40x40.png', hint: 'government building' },
      ],
      skillGap: {
        targetRole: 'Hospital Administrator',
        skills: [
          { name: 'Healthcare Management', value: 85 },
          { name: 'Financial Acumen', value: 70 },
          { name: 'EMR/EHR Systems', value: 90 },
        ],
      },
      careerPath: {
        currentRole: 'Senior Nurse',
        nextRoles: ['Head Nurse', 'Nursing Supervisor', 'Hospital Administrator'],
      },
    },
     'mumbai': {
        jobTrends: [ { name: 'Health Manager', growth: 25 }, { name: 'Pharma Sales', growth: 20 }, { name: 'Medical Officer', growth: 18 } ],
        salary: [ { level: 'Entry-Level', salary: 650000 }, { level: 'Mid-Level', salary: 1000000 }, { level: 'Senior-Level', salary: 1700000 } ],
        skills: [ { skill: 'Patient Care', demand: 99 }, { skill: 'Sales', demand: 85 }, { skill: 'Empathy', demand: 96 } ],
        companies: [ { name: 'Sun Pharma', logo: 'https://placehold.co/40x40.png', hint: 'pharma logo' }, { name: 'Cipla', logo: 'https://placehold.co/40x40.png', hint: 'pharma company' } ],
        skillGap: {
          targetRole: 'Medical Science Liaison',
          skills: [
            { name: 'Clinical Research', value: 70 },
            { name: 'Scientific Communication', value: 80 },
            { name: 'Relationship Building', value: 90 },
          ],
        },
        careerPath: {
          currentRole: 'Medical Representative',
          nextRoles: ['Area Sales Manager', 'Medical Advisor', 'Marketing Manager'],
        },
    }
  },
  'Finance': {
    'all-india': {
      jobTrends: [
        { name: 'Fintech Specialist', growth: 24 },
        { name: 'Financial Analyst', growth: 15 },
        { name: 'Wealth Manager', growth: 12 },
        { name: 'Accountant', growth: 8 },
      ],
      salary: [
          { level: 'Entry-Level', salary: 800000 },
          { level: 'Mid-Level', salary: 1500000 },
          { level: 'Senior-Level', salary: 2800000 },
      ],
      skills: [
          { skill: 'Financial Modeling', demand: 95 },
          { skill: 'MS Excel', demand: 92 },
          { skill: 'Attention to Detail', demand: 98 },
          { skill: 'Risk Analysis', demand: 85 },
          { skill: 'Communication', demand: 88 },
          { skill: 'QuickBooks/Tally', demand: 80 },
      ],
       companies: [
          { name: 'HDFC Bank', logo: 'https://placehold.co/40x40.png', hint: 'bank logo' },
          { name: 'ICICI Bank', logo: 'https://placehold.co/40x40.png', hint: 'bank building' },
          { name: 'Goldman Sachs', logo: 'https://placehold.co/40x40.png', hint: 'investment bank' },
          { name: 'Deloitte', logo: 'https://placehold.co/40x40.png', hint: 'corporate building' },
      ],
      skillGap: {
        targetRole: 'Financial Analyst',
        skills: [
          { name: 'Financial Modeling', value: 80 },
          { name: 'Valuation Techniques', value: 65 },
          { name: 'Advanced Excel', value: 90 },
        ],
      },
      careerPath: {
        currentRole: 'Accountant',
        nextRoles: ['Senior Accountant', 'Financial Analyst', 'Finance Manager'],
      },
    },
    'delhi-ncr': {
        jobTrends: [ { name: 'Fintech Specialist', growth: 28 }, { name: 'Investment Banker', growth: 20 }, { name: 'Auditor', growth: 15 } ],
        salary: [ { level: 'Entry-Level', salary: 850000 }, { level: 'Mid-Level', salary: 1600000 }, { level: 'Senior-Level', salary: 3000000 } ],
        skills: [ { skill: 'Financial Modeling', demand: 97 }, { skill: 'Valuation', demand: 90 }, { skill: 'Audit', demand: 88 } ],
        companies: [ { name: 'Paytm', logo: 'https://placehold.co/40x40.png', hint: 'fintech logo' }, { name: 'American Express', logo: 'https://placehold.co/40x40.png', hint: 'credit card' } ],
        skillGap: {
          targetRole: 'Investment Banker',
          skills: [
            { name: 'Valuation', value: 85 },
            { name: 'Mergers & Acquisitions', value: 70 },
            { name: 'Pitchbook Creation', value: 75 },
          ],
        },
        careerPath: {
          currentRole: 'Financial Analyst',
          nextRoles: ['Associate', 'Vice President', 'Director'],
        },
    }
  },
  'Law': {
    'all-india': {
      jobTrends: [
          { name: 'Corporate Lawyer', growth: 15 },
          { name: 'Cyber Law Expert', growth: 25 },
          { name: 'IPR Attorney', growth: 18 },
          { name: 'Legal Tech Consultant', growth: 20 },
      ],
      salary: [
          { level: 'Entry-Level', salary: 600000 },
          { level: 'Mid-Level', salary: 1200000 },
          { level: 'Senior-Level', salary: 2200000 },
      ],
      skills: [
          { skill: 'Legal Research', demand: 98 },
          { skill: 'Drafting', demand: 95 },
          { skill: 'Analytical Skills', demand: 92 },
          { skill: 'Negotiation', demand: 90 },
          { skill: 'Client Counseling', demand: 85 },
          { skill: 'Tech Law', demand: 80 },
      ],
      companies: [
          { name: 'Cyril Amarchand', logo: 'https://placehold.co/40x40.png', hint: 'law firm' },
          { name: 'AZB & Partners', logo: 'https://placehold.co/40x40.png', hint: 'law building' },
          { name: 'Khaitan & Co', logo: 'https://placehold.co/40x40.png', hint: 'gavel justice' },
          { name: 'Shardul Amarchand', logo: 'https://placehold.co/40x40.png', hint: 'law books' },
      ],
      skillGap: {
        targetRole: 'Corporate Lawyer',
        skills: [
          { name: 'Contract Drafting', value: 90 },
          { name: 'Due Diligence', value: 70 },
          { name: 'Negotiation', value: 80 },
        ],
      },
      careerPath: {
        currentRole: 'Junior Associate',
        nextRoles: ['Associate', 'Senior Associate', 'Partner'],
      },
    },
    'mumbai': {
        jobTrends: [ { name: 'Corporate Lawyer', growth: 20 }, { name: 'IPR Attorney', growth: 22 }, { name: 'Arbitration', growth: 15 } ],
        salary: [ { level: 'Entry-Level', salary: 700000 }, { level: 'Mid-Level', salary: 1400000 }, { level: 'Senior-Level', salary: 2500000 } ],
        skills: [ { skill: 'Legal Research', demand: 99 }, { skill: 'Drafting', demand: 98 }, { skill: 'Negotiation', demand: 95 } ],
        companies: [ { name: 'Trilegal', logo: 'https://placehold.co/40x40.png', hint: 'law building' }, { name: 'J. Sagar Associates', logo: 'https://placehold.co/40x40.png', hint: 'law office' } ],
        skillGap: {
          targetRole: 'IPR Attorney',
          skills: [
            { name: 'Patent Filing', value: 85 },
            { name: 'Trademark Law', value: 90 },
            { name: 'Litigation', value: 75 },
          ],
        },
        careerPath: {
          currentRole: 'Paralegal',
          nextRoles: ['Lawyer', 'IPR Attorney', 'Senior Counsel'],
        },
    }
  }
};


type Industry = keyof typeof placeholderData;
type Location = 'all-india' | 'mumbai' | 'bangalore' | 'delhi-ncr';


export default function CareerDashboardPage() {
  const [selectedIndustry, setSelectedIndustry] = React.useState<Industry>('Information Technology');
  const [selectedLocation, setSelectedLocation] = React.useState<Location>('all-india');
  
  const industryLocations = Object.keys(placeholderData[selectedIndustry]);
  const locationToShow = industryLocations.includes(selectedLocation) ? selectedLocation : 'all-india';
  
  const industryData = placeholderData[selectedIndustry][locationToShow];
  
  const jobTrendsConfig = { growth: { label: 'Growth (%)', color: 'hsl(var(--primary))' } };
  const salaryConfig = { salary: { label: 'Salary (INR)', color: 'hsl(var(--accent))' } };
  const skillsConfig = { demand: { label: 'Demand Score', color: 'hsl(var(--primary))' } };
  
  const handleIndustryChange = (value: Industry) => {
    setSelectedIndustry(value);
    const newIndustryLocations = Object.keys(placeholderData[value]);
    if (!newIndustryLocations.includes(selectedLocation)) {
        setSelectedLocation('all-india');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center" prefetch={false}>
            <Bot className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold font-headline text-lg">Career Compass AI</span>
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
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">Career Dashboard</h1>
        </div>

        <Card className="mb-8 bg-secondary/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="text-primary"/> Dashboard Filters</CardTitle>
                <CardDescription>Select an industry and location to see personalized insights.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Select onValueChange={(value) => handleIndustryChange(value as Industry)} defaultValue={selectedIndustry}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select an industry" /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(placeholderData).map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <Select onValueChange={(value) => setSelectedLocation(value as Location)} value={locationToShow}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select a location" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-india">All India</SelectItem>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                            <SelectItem value="delhi-ncr">Delhi NCR</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/> Top Job Trends</CardTitle>
                <CardDescription>Projected annual growth for roles in {selectedIndustry}.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={jobTrendsConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={industryData.jobTrends} accessibilityLayer layout="vertical" margin={{ left: 25, right: 30 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={130} />
                            <XAxis dataKey="growth" type="number" hide />
                            <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="growth" fill="var(--color-growth)" radius={5}>
                                <LabelList dataKey="growth" position="right" offset={8} className="fill-foreground font-semibold" fontSize={12} formatter={(value: number) => `${value}%`} />
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

             <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> In-Demand Skills</CardTitle>
                     <CardDescription>Key skills for {selectedIndustry}.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ChartContainer config={skillsConfig} className="min-h-[300px] w-full">
                     <ResponsiveContainer width="100%" height={300}>
                       <RadarChart data={industryData.skills}>
                         <CartesianGrid gridType="circle" />
                         <PolarAngleAxis dataKey="skill" />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                         <Radar name="Demand" dataKey="demand" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                         <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                       </RadarChart>
                     </ResponsiveContainer>
                   </ChartContainer>
                </CardContent>
            </Card>
            
            <Card className="xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> Top Hiring Companies</CardTitle>
                    <CardDescription>Actively hiring in {selectedIndustry}.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {industryData.companies.map(company => (
                        <div key={company.name} className="flex items-center gap-3 p-2 border rounded-lg bg-secondary/50">
                            <Image src={company.logo} alt={`${company.name} logo`} width={40} height={40} className="rounded-full bg-white" data-ai-hint={company.hint} />
                            <span className="font-medium text-sm">{company.name}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/> Salary Insights (Annual)</CardTitle>
                <CardDescription>Average annual salary (INR) in {selectedIndustry}.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={salaryConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={industryData.salary} accessibilityLayer margin={{ top: 20 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="level" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`} />
                            <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="salary" fill="var(--color-salary)" radius={[5, 5, 0, 0]}>
                               <LabelList dataKey="salary" position="top" offset={8} className="fill-foreground font-semibold" fontSize={12} formatter={(value: number) => `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`} />
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
           
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="text-primary"/> Skill Gap Analysis</CardTitle>
                    <CardDescription>Your skills vs. target role: <strong>{industryData.skillGap.targetRole}</strong></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {industryData.skillGap.skills.map(skill => (
                      <div key={skill.name} className="space-y-2">
                          <label className="text-sm font-medium">{skill.name}</label>
                          <Progress value={skill.value} />
                      </div>
                    ))}
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-full xl:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI-Suggested Career Path</CardTitle>
                    <CardDescription>From your current role: <strong>{industryData.careerPath.currentRole}</strong></CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-around text-center">
                   {industryData.careerPath.nextRoles.map((role, index) => (
                     <React.Fragment key={role}>
                        <div className="flex flex-col items-center">
                            <div className={`p-3 bg-primary/10 rounded-full ${index === 0 ? 'border-2 border-primary' : ''}`}>
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-semibold mt-2" dangerouslySetInnerHTML={{ __html: role.replace(/\s/g, '<br/>') }}></p>
                        </div>
                        {index < industryData.careerPath.nextRoles.length - 1 && (
                           <div className="flex-1 border-t-2 border-dashed mx-4"></div>
                        )}
                     </React.Fragment>
                   ))}
                </CardContent>
            </Card>

             <Card className="lg:col-span-full xl:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Map className="text-primary"/> Location-Based Opportunities</CardTitle>
                    <CardDescription>Job hotspots for the {selectedIndustry} industry.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="Map of job opportunities" className="w-full h-auto rounded-b-lg" data-ai-hint="world map" />
                </CardContent>
            </Card>

        </div>

      </main>
    </div>
  );
}
