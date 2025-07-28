
'use client';

import Link from 'next/link';
import * as React from 'react';
import { Bot, ArrowLeft, BarChart, LineChart, DollarSign, BrainCircuit, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const placeholderJobData = {
  'Information Technology': [
    { name: 'Data Scientist', growth: 18 },
    { name: 'Cybersecurity', growth: 15 },
    { name: 'Cloud Engineer', growth: 14 },
    { name: 'AI/ML Engineer', growth: 20 },
    { name: 'DevOps Engineer', growth: 12 },
  ],
  'Healthcare': [
    { name: 'Nurse Practitioner', growth: 22 },
    { name: 'Physical Therapist', growth: 18 },
    { name: 'Medical Assistant', growth: 16 },
    { name: 'Health Manager', growth: 20 },
  ],
  'Finance': [
    { name: 'Financial Analyst', growth: 11 },
    { name: 'Accountant', growth: 7 },
    { name: 'Portfolio Manager', growth: 9 },
    { name: 'Fintech Specialist', growth: 19 },
  ]
};

const placeholderSalaryData = {
    'Information Technology': { entry: '60,000', mid: '95,000', senior: '150,000' },
    'Healthcare': { entry: '55,000', mid: '80,000', senior: '120,000' },
    'Finance': { entry: '65,000', mid: '100,000', senior: '160,000' },
};

const placeholderSkillsData = {
    'Information Technology': ['Python', 'AWS', 'Kubernetes', 'Terraform', 'SQL', 'React'],
    'Healthcare': ['Patient Care', 'EMR Systems', 'Medical Billing', 'HIPAA'],
    'Finance': ['Financial Modeling', 'Excel', 'QuickBooks', 'Risk Analysis'],
};

type Industry = keyof typeof placeholderJobData;

export default function CareerDashboardPage() {
  const [selectedIndustry, setSelectedIndustry] = React.useState<Industry>('Information Technology');

  const chartData = placeholderJobData[selectedIndustry];
  const salaryData = placeholderSalaryData[selectedIndustry];
  const skillsData = placeholderSkillsData[selectedIndustry];
  
  const chartConfig = {
      growth: {
        label: 'Growth (%)',
        color: 'hsl(var(--primary))',
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
                 <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="growth" fill="var(--color-growth)" radius={4} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/> Salary Insights</CardTitle>
                        <CardDescription>Average annual salary (INR).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between"><span>Entry-Level</span> <strong>₹{salaryData.entry}</strong></div>
                        <div className="flex justify-between"><span>Mid-Level</span> <strong>₹{salaryData.mid}</strong></div>
                        <div className="flex justify-between"><span>Senior-Level</span> <strong>₹{salaryData.senior}</strong></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Top In-Demand Skills</CardTitle>
                         <CardDescription>Skills to focus on for {selectedIndustry}.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {skillsData.map(skill => <div key={skill} className="bg-secondary text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full">{skill}</div>)}
                    </CardContent>
                </Card>
            </div>
        </div>

      </main>
    </div>
  );
}

    