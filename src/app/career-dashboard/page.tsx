
'use client';

import Link from 'next/link';
import * as React from 'react';
import Image from 'next/image';
import { Bot, ArrowLeft, BarChart, DollarSign, BrainCircuit, Search, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';

const placeholderData = {
  'Information Technology': {
    jobTrends: [
      { name: 'AI/ML Engineer', growth: 20 },
      { name: 'Data Scientist', growth: 18 },
      { name: 'Cybersecurity', growth: 15 },
      { name: 'Cloud Engineer', growth: 14 },
      { name: 'DevOps Engineer', growth: 12 },
    ],
    salary: [
        { level: 'Entry-Level', salary: 60000 },
        { level: 'Mid-Level', salary: 95000 },
        { level: 'Senior-Level', salary: 150000 },
    ],
    skills: ['Python', 'AWS', 'Kubernetes', 'Terraform', 'SQL', 'React', 'Go'],
    companies: [
        { name: 'Google', logo: 'https://placehold.co/40x40.png' },
        { name: 'Amazon', logo: 'https://placehold.co/40x40.png' },
        { name: 'Microsoft', logo: 'https://placehold.co/40x40.png' },
        { name: 'TCS', logo: 'https://placehold.co/40x40.png' },
        { name: 'Infosys', logo: 'https://placehold.co/40x40.png' },
    ]
  },
  'Healthcare': {
    jobTrends: [
      { name: 'Nurse Practitioner', growth: 22 },
      { name: 'Health Manager', growth: 20 },
      { name: 'Physical Therapist', growth: 18 },
      { name: 'Medical Assistant', growth: 16 },
    ],
     salary: [
        { level: 'Entry-Level', salary: 55000 },
        { level: 'Mid-Level', salary: 80000 },
        { level: 'Senior-Level', salary: 120000 },
    ],
    skills: ['Patient Care', 'EMR Systems', 'Medical Billing', 'HIPAA', 'Pharmacology'],
    companies: [
        { name: 'Apollo Hospitals', logo: 'https://placehold.co/40x40.png' },
        { name: 'Fortis Healthcare', logo: 'https://placehold.co/40x40.png' },
        { name: 'Max Healthcare', logo: 'https://placehold.co/40x40.png' },
        { name: 'AIIMS', logo: 'https://placehold.co/40x40.png' },
    ]
  },
  'Finance': {
    jobTrends: [
      { name: 'Fintech Specialist', growth: 19 },
      { name: 'Financial Analyst', growth: 11 },
      { name: 'Portfolio Manager', growth: 9 },
      { name: 'Accountant', growth: 7 },
    ],
    salary: [
        { level: 'Entry-Level', salary: 65000 },
        { level: 'Mid-Level', salary: 100000 },
        { level: 'Senior-Level', salary: 160000 },
    ],
    skills: ['Financial Modeling', 'Excel', 'QuickBooks', 'Risk Analysis', 'Bloomberg'],
     companies: [
        { name: 'HDFC Bank', logo: 'https://placehold.co/40x40.png' },
        { name: 'ICICI Bank', logo: 'https://placehold.co/40x40.png' },
        { name: 'Goldman Sachs', logo: 'https://placehold.co/40x40.png' },
        { name: 'Deloitte', logo: 'https://placehold.co/40x40.png' },
    ]
  }
};


type Industry = keyof typeof placeholderData;

export default function CareerDashboardPage() {
  const [selectedIndustry, setSelectedIndustry] = React.useState<Industry>('Information Technology');

  const industryData = placeholderData[selectedIndustry];
  
  const jobTrendsConfig = {
      growth: {
        label: 'Growth (%)',
        color: 'hsl(var(--primary))',
      },
  }

  const salaryConfig = {
      salary: {
        label: 'Salary (INR)',
        color: 'hsl(var(--accent))',
      },
  }

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

        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="text-primary"/> Filters</CardTitle>
                <CardDescription>Select an industry and location to see personalized insights.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Select onValueChange={(value) => setSelectedIndustry(value as Industry)} defaultValue={selectedIndustry}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Information Technology">Information Technology</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <Select defaultValue="all-india">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/> Top Job Trends</CardTitle>
                <CardDescription>Projected annual growth for roles in {selectedIndustry}.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={jobTrendsConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={industryData.jobTrends} accessibilityLayer layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={120} />
                            <XAxis dataKey="growth" type="number" hide />
                            <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="growth" fill="var(--color-growth)" radius={4}>
                                <LabelList dataKey="growth" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `${value}%`} />
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Top In-Demand Skills</CardTitle>
                     <CardDescription>Skills to focus on for {selectedIndustry}.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {industryData.skills.map(skill => <div key={skill} className="bg-secondary text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full">{skill}</div>)}
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/> Salary Insights</CardTitle>
                <CardDescription>Average annual salary (INR) in {selectedIndustry}.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={salaryConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={industryData.salary} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="level" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(value)}`} />
                            <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="salary" fill="var(--color-salary)" radius={4}>
                               <LabelList dataKey="salary" position="top" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `₹${new Intl.NumberFormat('en-IN').format(value)}`} />
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> Top Companies Hiring</CardTitle>
                     <CardDescription>Actively hiring companies in {selectedIndustry}.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {industryData.companies.map(company => (
                        <div key={company.name} className="flex items-center gap-3 p-2 border rounded-md bg-secondary/50">
                            <Image src={company.logo} alt={`${company.name} logo`} width={40} height={40} className="rounded-full" data-ai-hint="company logo" />
                            <span className="font-medium text-sm">{company.name}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </div>

      </main>
    </div>
  );
}
