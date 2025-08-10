
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
import { cn } from '@/lib/utils';

type Industry = 'Information Technology' | 'Healthcare' | 'Finance' | 'Law';
type Location = 'all-india' | 'mumbai' | 'bangalore' | 'delhi-ncr';

interface JobTrend {
  name: string;
  growth: number;
}

interface Skill {
  skill: string;
  demand: number;
}

interface Salary {
  level: string;
  salary: number;
}

interface Company {
  name: string;
  logo: string;
  hint: string;
}

interface SkillGap {
  targetRole: string;
  skills: { name: string; value: number }[];
}

interface CareerPath {
  currentRole: string;
  nextRoles: string[];
}

interface LocationData {
  jobTrends: JobTrend[];
  skills: Skill[];
  salary: Salary[];
  companies: Company[];
  skillGap: SkillGap;
  careerPath: CareerPath;
  mapUrl: string;
}

const placeholderData: Record<Industry, Record<Location, LocationData>> = {
  "Information Technology": {
    "all-india": {
      jobTrends: [
        { name: 'AI/ML Engineer', growth: 35 },
        { name: 'Data Scientist', growth: 30 },
        { name: 'Cybersecurity Analyst', growth: 28 },
        { name: 'Cloud Engineer', growth: 25 },
        { name: 'Full-Stack Developer', growth: 22 },
      ],
      skills: [
        { skill: 'Python', demand: 95 },
        { skill: 'Cloud (AWS/Azure)', demand: 85 },
        { skill: 'AI/ML Frameworks', demand: 88 },
        { skill: 'Cybersecurity', demand: 75 },
        { skill: 'Communication', demand: 90 },
        { skill: 'Problem Solving', demand: 92 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 600000 },
        { level: 'Mid-Level', salary: 1500000 },
        { level: 'Senior-Level', salary: 3000000 },
      ],
      companies: [
        { name: 'TCS', logo: 'https://placehold.co/100x100.png', hint: 'tata consultancy' },
        { name: 'Infosys', logo: 'https://placehold.co/100x100.png', hint: 'infosys logo' },
        { name: 'Wipro', logo: 'https://placehold.co/100x100.png', hint: 'wipro logo' },
        { name: 'HCL Tech', logo: 'https://placehold.co/100x100.png', hint: 'hcl logo' },
      ],
      skillGap: {
        targetRole: 'Data Scientist',
        skills: [
          { name: 'Python/R', value: 80 },
          { name: 'Machine Learning', value: 60 },
          { name: 'SQL', value: 75 },
          { name: 'Cloud Computing', value: 40 },
        ],
      },
      careerPath: {
        currentRole: 'Software Engineer',
        nextRoles: ['Senior Engineer', 'Tech Lead', 'Engineering Manager'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15552.07293526976!2d77.67633274999999!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sit%20parks%20in%20Bangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1628582736489!5m2!1sen!2sin"
    },
     "bangalore": {
      jobTrends: [
        { name: 'AI/ML Engineer', growth: 45 },
        { name: 'Data Scientist', growth: 40 },
        { name: 'Cloud Engineer', growth: 30 },
        { name: 'Backend Developer', growth: 28 },
      ],
      skills: [
        { skill: 'Python', demand: 98 },
        { skill: 'Cloud (AWS/GCP)', demand: 90 },
        { skill: 'System Design', demand: 85 },
        { skill: 'Microservices', demand: 80 },
        { skill: 'Teamwork', demand: 92 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 800000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 3500000 },
      ],
      companies: [
        { name: 'Google', logo: 'https://placehold.co/100x100.png', hint: 'google logo' },
        { name: 'Amazon', logo: 'https://placehold.co/100x100.png', hint: 'amazon logo' },
        { name: 'Flipkart', logo: 'https://placehold.co/100x100.png', hint: 'flipkart logo' },
        { name: 'Microsoft', logo: 'https://placehold.co/100x100.png', hint: 'microsoft logo' },
      ],
      skillGap: {
        targetRole: 'Cloud Architect',
        skills: [
          { name: 'AWS/GCP', value: 85 },
          { name: 'Networking', value: 70 },
          { name: 'Terraform', value: 60 },
          { name: 'Security', value: 50 },
        ],
      },
      careerPath: {
        currentRole: 'DevOps Engineer',
        nextRoles: ['Senior DevOps', 'Cloud Architect', 'SRE Manager'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d62220.47353982119!2d77.6017349372138!3d12.915155982841407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sElectronic%20City%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1628582845612!5m2!1sen!2sin"
    },
    // Other IT locations...
     "mumbai": {
      jobTrends: [
        { name: 'Fintech Developer', growth: 40 },
        { name: 'Cybersecurity Analyst', growth: 35 },
        { name: 'Data Analyst', growth: 30 },
        { name: 'Cloud Support', growth: 25 },
      ],
      skills: [
        { skill: 'Java/Spring', demand: 90 },
        { skill: 'SQL/NoSQL', demand: 88 },
        { skill: 'Cybersecurity', demand: 85 },
        { skill: 'Client Communication', demand: 95 },
        { skill: 'Project Management', demand: 80 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 700000 },
        { level: 'Mid-Level', salary: 1600000 },
        { level: 'Senior-Level', salary: 3200000 },
      ],
      companies: [
        { name: 'J.P. Morgan', logo: 'https://placehold.co/100x100.png', hint: 'jpmorgan logo' },
        { name: 'Morgan Stanley', logo: 'https://placehold.co/100x100.png', hint: 'morgan stanley' },
        { name: 'LTI Mindtree', logo: 'https://placehold.co/100x100.png', hint: 'lti mindtree' },
        { name: 'Capgemini', logo: 'https://placehold.co/100x100.png', hint: 'capgemini logo' },
      ],
      skillGap: {
        targetRole: 'Fintech Analyst',
        skills: [
          { name: 'Financial Markets', value: 70 },
          { name: 'Java', value: 80 },
          { name: 'API Integration', value: 65 },
          { name: 'Risk Analysis', value: 50 },
        ],
      },
      careerPath: {
        currentRole: 'Backend Developer',
        nextRoles: ['Senior Backend Dev', 'Fintech Specialist', 'Solutions Architect'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d59523.0991499505!2d72.82283363403215!3d19.07689957388176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sBandra%20Kurla%20Complex%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628582963421!5m2!1sen!2sin"
    },
    "delhi-ncr": {
       jobTrends: [
        { name: 'Network Engineer', growth: 38 },
        { name: 'UI/UX Designer', growth: 32 },
        { name: 'Data Analyst', growth: 28 },
        { name: 'IT Support Engineer', growth: 25 },
      ],
      skills: [
        { skill: 'Networking', demand: 90 },
        { skill: 'UI/UX Tools', demand: 85 },
        { skill: 'SQL', demand: 80 },
        { skill: 'Communication', demand: 92 },
        { skill: 'Troubleshooting', demand: 88 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 500000 },
        { level: 'Mid-Level', salary: 1200000 },
        { level: 'Senior-Level', salary: 2500000 },
      ],
      companies: [
        { name: 'HCL', logo: 'https://placehold.co/100x100.png', hint: 'hcl logo' },
        { name: 'Paytm', logo: 'https://placehold.co/100x100.png', hint: 'paytm logo' },
        { name: 'Nagarro', logo: 'https://placehold.co/100x100.png', hint: 'nagarro logo' },
        { name: 'Genpact', logo: 'https://placehold.co/100x100.png', hint: 'genpact logo' },
      ],
      skillGap: {
        targetRole: 'UI/UX Lead',
        skills: [
          { name: 'Figma/XD', value: 85 },
          { name: 'User Research', value: 65 },
          { name: 'Prototyping', value: 75 },
          { name: 'Team Leadership', value: 50 },
        ],
      },
      careerPath: {
        currentRole: 'Web Designer',
        nextRoles: ['UI/UX Designer', 'Product Designer', 'Design Lead'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d56039.39851608933!2d77.0353038318884!3d28.61633318991738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sit%20hubs%20in%20Gurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1628583049189!5m2!1sen!2sin"
    }
  },
  "Healthcare": {
    "all-india": {
      jobTrends: [
        { name: 'General Physician', growth: 15 },
        { name: 'Nurse Practitioner', growth: 25 },
        { name: 'Medical Lab Technician', growth: 20 },
        { name: 'Pharmacist', growth: 18 },
      ],
      skills: [
        { skill: 'Patient Care', demand: 95 },
        { skill: 'Diagnostics', demand: 90 },
        { skill: 'Pharmacology', demand: 85 },
        { skill: 'Empathy', demand: 98 },
        { skill: 'Team Collaboration', demand: 88 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 800000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Apollo Hospitals', logo: 'https://placehold.co/100x100.png', hint: 'apollo hospital' },
        { name: 'Fortis Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'fortis hospital' },
        { name: 'Max Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'max healthcare' },
        { name: 'Cipla', logo: 'https://placehold.co/100x100.png', hint: 'cipla logo' },
      ],
      skillGap: {
        targetRole: 'Hospital Administrator',
        skills: [
          { name: 'Medical Knowledge', value: 80 },
          { name: 'Management', value: 60 },
          { name: 'Finance', value: 50 },
          { name: 'Compliance', value: 70 },
        ],
      },
      careerPath: {
        currentRole: 'Registered Nurse',
        nextRoles: ['Senior Nurse', 'Nurse Manager', 'Hospital Administrator'],
      },
       mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1shospitals%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583129883!5m2!1sen!2sin"
    },
    // other healthcare locations...
    "mumbai": {
      jobTrends: [
        { name: 'General Physician', growth: 15 },
        { name: 'Nurse Practitioner', growth: 25 },
        { name: 'Medical Lab Technician', growth: 20 },
        { name: 'Pharmacist', growth: 18 },
      ],
      skills: [
        { skill: 'Patient Care', demand: 95 },
        { skill: 'Diagnostics', demand: 90 },
        { skill: 'Pharmacology', demand: 85 },
        { skill: 'Empathy', demand: 98 },
        { skill: 'Team Collaboration', demand: 88 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 800000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Apollo Hospitals', logo: 'https://placehold.co/100x100.png', hint: 'apollo hospital' },
        { name: 'Fortis Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'fortis hospital' },
        { name: 'Max Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'max healthcare' },
        { name: 'Cipla', logo: 'https://placehold.co/100x100.png', hint: 'cipla logo' },
      ],
      skillGap: {
        targetRole: 'Hospital Administrator',
        skills: [
          { name: 'Medical Knowledge', value: 80 },
          { name: 'Management', value: 60 },
          { name: 'Finance', value: 50 },
          { name: 'Compliance', value: 70 },
        ],
      },
      careerPath: {
        currentRole: 'Registered Nurse',
        nextRoles: ['Senior Nurse', 'Nurse Manager', 'Hospital Administrator'],
      },
       mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1shospitals%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583129883!5m2!1sen!2sin"
    },
     "bangalore": {
      jobTrends: [
        { name: 'General Physician', growth: 15 },
        { name: 'Nurse Practitioner', growth: 25 },
        { name: 'Medical Lab Technician', growth: 20 },
        { name: 'Pharmacist', growth: 18 },
      ],
      skills: [
        { skill: 'Patient Care', demand: 95 },
        { skill: 'Diagnostics', demand: 90 },
        { skill: 'Pharmacology', demand: 85 },
        { skill: 'Empathy', demand: 98 },
        { skill: 'Team Collaboration', demand: 88 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 800000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Apollo Hospitals', logo: 'https://placehold.co/100x100.png', hint: 'apollo hospital' },
        { name: 'Fortis Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'fortis hospital' },
        { name: 'Max Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'max healthcare' },
        { name: 'Cipla', logo: 'https://placehold.co/100x100.png', hint: 'cipla logo' },
      ],
      skillGap: {
        targetRole: 'Hospital Administrator',
        skills: [
          { name: 'Medical Knowledge', value: 80 },
          { name: 'Management', value: 60 },
          { name: 'Finance', value: 50 },
          { name: 'Compliance', value: 70 },
        ],
      },
      careerPath: {
        currentRole: 'Registered Nurse',
        nextRoles: ['Senior Nurse', 'Nurse Manager', 'Hospital Administrator'],
      },
       mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1shospitals%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583129883!5m2!1sen!2sin"
    },
    "delhi-ncr": {
      jobTrends: [
        { name: 'General Physician', growth: 15 },
        { name: 'Nurse Practitioner', growth: 25 },
        { name: 'Medical Lab Technician', growth: 20 },
        { name: 'Pharmacist', growth: 18 },
      ],
      skills: [
        { skill: 'Patient Care', demand: 95 },
        { skill: 'Diagnostics', demand: 90 },
        { skill: 'Pharmacology', demand: 85 },
        { skill: 'Empathy', demand: 98 },
        { skill: 'Team Collaboration', demand: 88 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 800000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Apollo Hospitals', logo: 'https://placehold.co/100x100.png', hint: 'apollo hospital' },
        { name: 'Fortis Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'fortis hospital' },
        { name: 'Max Healthcare', logo: 'https://placehold.co/100x100.png', hint: 'max healthcare' },
        { name: 'Cipla', logo: 'https://placehold.co/100x100.png', hint: 'cipla logo' },
      ],
      skillGap: {
        targetRole: 'Hospital Administrator',
        skills: [
          { name: 'Medical Knowledge', value: 80 },
          { name: 'Management', value: 60 },
          { name: 'Finance', value: 50 },
          { name: 'Compliance', value: 70 },
        ],
      },
      careerPath: {
        currentRole: 'Registered Nurse',
        nextRoles: ['Senior Nurse', 'Nurse Manager', 'Hospital Administrator'],
      },
       mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1shospitals%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583129883!5m2!1sen!2sin"
    },
  },
  "Finance": {
    "all-india": {
      jobTrends: [
        { name: 'Financial Analyst', growth: 25 },
        { name: 'Investment Banker', growth: 22 },
        { name: 'Accountant', growth: 18 },
        { name: 'Risk Analyst', growth: 20 },
      ],
      skills: [
        { skill: 'Financial Modeling', demand: 95 },
        { skill: 'Valuation', demand: 90 },
        { skill: 'MS Excel', demand: 98 },
        { skill: 'Risk Management', demand: 85 },
        { skill: 'Analytical Skills', demand: 92 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 700000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Goldman Sachs', logo: 'https://placehold.co/100x100.png', hint: 'goldman sachs' },
        { name: 'HSBC', logo: 'https://placehold.co/100x100.png', hint: 'hsbc logo' },
        { name: 'Deloitte', logo: 'https://placehold.co/100x100.png', hint: 'deloitte logo' },
        { name: 'KPMG', logo: 'https://placehold.co/100x100.png', hint: 'kpmg logo' },
      ],
      skillGap: {
        targetRole: 'Investment Banker',
        skills: [
          { name: 'Valuation', value: 75 },
          { name: 'Modeling', value: 70 },
          { name: 'Deal Structuring', value: 50 },
          { name: 'Negotiation', value: 60 },
        ],
      },
      careerPath: {
        currentRole: 'Financial Analyst',
        nextRoles: ['Senior Analyst', 'Associate (IB)', 'VP (IB)'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sfinancial%20district%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583204908!5m2!1sen!2sin"
    },
    "mumbai": {
      jobTrends: [
        { name: 'Financial Analyst', growth: 25 },
        { name: 'Investment Banker', growth: 22 },
        { name: 'Accountant', growth: 18 },
        { name: 'Risk Analyst', growth: 20 },
      ],
      skills: [
        { skill: 'Financial Modeling', demand: 95 },
        { skill: 'Valuation', demand: 90 },
        { skill: 'MS Excel', demand: 98 },
        { skill: 'Risk Management', demand: 85 },
        { skill: 'Analytical Skills', demand: 92 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 700000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Goldman Sachs', logo: 'https://placehold.co/100x100.png', hint: 'goldman sachs' },
        { name: 'HSBC', logo: 'https://placehold.co/100x100.png', hint: 'hsbc logo' },
        { name: 'Deloitte', logo: 'https://placehold.co/100x100.png', hint: 'deloitte logo' },
        { name: 'KPMG', logo: 'https://placehold.co/100x100.png', hint: 'kpmg logo' },
      ],
      skillGap: {
        targetRole: 'Investment Banker',
        skills: [
          { name: 'Valuation', value: 75 },
          { name: 'Modeling', value: 70 },
          { name: 'Deal Structuring', value: 50 },
          { name: 'Negotiation', value: 60 },
        ],
      },
      careerPath: {
        currentRole: 'Financial Analyst',
        nextRoles: ['Senior Analyst', 'Associate (IB)', 'VP (IB)'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sfinancial%20district%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583204908!5m2!1sen!2sin"
    },
    // other finance locations...
     "bangalore": {
      jobTrends: [
        { name: 'Financial Analyst', growth: 25 },
        { name: 'Investment Banker', growth: 22 },
        { name: 'Accountant', growth: 18 },
        { name: 'Risk Analyst', growth: 20 },
      ],
      skills: [
        { skill: 'Financial Modeling', demand: 95 },
        { skill: 'Valuation', demand: 90 },
        { skill: 'MS Excel', demand: 98 },
        { skill: 'Risk Management', demand: 85 },
        { skill: 'Analytical Skills', demand: 92 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 700000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Goldman Sachs', logo: 'https://placehold.co/100x100.png', hint: 'goldman sachs' },
        { name: 'HSBC', logo: 'https://placehold.co/100x100.png', hint: 'hsbc logo' },
        { name: 'Deloitte', logo: 'https://placehold.co/100x100.png', hint: 'deloitte logo' },
        { name: 'KPMG', logo: 'https://placehold.co/100x100.png', hint: 'kpmg logo' },
      ],
      skillGap: {
        targetRole: 'Investment Banker',
        skills: [
          { name: 'Valuation', value: 75 },
          { name: 'Modeling', value: 70 },
          { name: 'Deal Structuring', value: 50 },
          { name: 'Negotiation', value: 60 },
        ],
      },
      careerPath: {
        currentRole: 'Financial Analyst',
        nextRoles: ['Senior Analyst', 'Associate (IB)', 'VP (IB)'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sfinancial%20district%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583204908!5m2!1sen!2sin"
    },
     "delhi-ncr": {
      jobTrends: [
        { name: 'Financial Analyst', growth: 25 },
        { name: 'Investment Banker', growth: 22 },
        { name: 'Accountant', growth: 18 },
        { name: 'Risk Analyst', growth: 20 },
      ],
      skills: [
        { skill: 'Financial Modeling', demand: 95 },
        { skill: 'Valuation', demand: 90 },
        { skill: 'MS Excel', demand: 98 },
        { skill: 'Risk Management', demand: 85 },
        { skill: 'Analytical Skills', demand: 92 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 700000 },
        { level: 'Mid-Level', salary: 1800000 },
        { level: 'Senior-Level', salary: 4000000 },
      ],
      companies: [
        { name: 'Goldman Sachs', logo: 'https://placehold.co/100x100.png', hint: 'goldman sachs' },
        { name: 'HSBC', logo: 'https://placehold.co/100x100.png', hint: 'hsbc logo' },
        { name: 'Deloitte', logo: 'https://placehold.co/100x100.png', hint: 'deloitte logo' },
        { name: 'KPMG', logo: 'https://placehold.co/100x100.png', hint: 'kpmg logo' },
      ],
      skillGap: {
        targetRole: 'Investment Banker',
        skills: [
          { name: 'Valuation', value: 75 },
          { name: 'Modeling', value: 70 },
          { name: 'Deal Structuring', value: 50 },
          { name: 'Negotiation', value: 60 },
        ],
      },
      careerPath: {
        currentRole: 'Financial Analyst',
        nextRoles: ['Senior Analyst', 'Associate (IB)', 'VP (IB)'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sfinancial%20district%20in%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628583204908!5m2!1sen!2sin"
    },
  },
  "Law": {
    "all-india": {
      jobTrends: [
        { name: 'Corporate Lawyer', growth: 20 },
        { name: 'Litigation Associate', growth: 15 },
        { name: 'Legal Analyst', growth: 22 },
        { name: 'Compliance Officer', growth: 25 },
      ],
      skills: [
        { skill: 'Legal Research', demand: 95 },
        { skill: 'Drafting', demand: 92 },
        { skill: 'Contract Law', demand: 88 },
        { skill: 'Due Diligence', demand: 85 },
        { skill: 'Negotiation', demand: 90 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 600000 },
        { level: 'Mid-Level', salary: 1500000 },
        { level: 'Senior-Level', salary: 3500000 },
      ],
      companies: [
        { name: 'AZB & Partners', logo: 'https://placehold.co/100x100.png', hint: 'azb partners' },
        { name: 'Cyril Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'cyril amarchand' },
        { name: 'Khaitan & Co', logo: 'https://placehold.co/100x100.png', hint: 'khaitan co' },
        { name: 'Shardul Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'shardul amarchand' },
      ],
      skillGap: {
        targetRole: 'Corporate Lawyer',
        skills: [
          { name: 'Contract Drafting', value: 80 },
          { name: 'M&A', value: 60 },
          { name: 'Compliance', value: 70 },
          { name: 'Negotiation', value: 75 },
        ],
      },
      careerPath: {
        currentRole: 'Law Intern',
        nextRoles: ['Junior Associate', 'Associate', 'Senior Associate'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1slaw%20firms%20in%20Delhi!5e0!3m2!1sen!2sin!4v1628583276531!5m2!1sen!2sin"
    },
     "delhi-ncr": {
      jobTrends: [
        { name: 'Corporate Lawyer', growth: 20 },
        { name: 'Litigation Associate', growth: 15 },
        { name: 'Legal Analyst', growth: 22 },
        { name: 'Compliance Officer', growth: 25 },
      ],
      skills: [
        { skill: 'Legal Research', demand: 95 },
        { skill: 'Drafting', demand: 92 },
        { skill: 'Contract Law', demand: 88 },
        { skill: 'Due Diligence', demand: 85 },
        { skill: 'Negotiation', demand: 90 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 600000 },
        { level: 'Mid-Level', salary: 1500000 },
        { level: 'Senior-Level', salary: 3500000 },
      ],
      companies: [
        { name: 'AZB & Partners', logo: 'https://placehold.co/100x100.png', hint: 'azb partners' },
        { name: 'Cyril Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'cyril amarchand' },
        { name: 'Khaitan & Co', logo: 'https://placehold.co/100x100.png', hint: 'khaitan co' },
        { name: 'Shardul Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'shardul amarchand' },
      ],
      skillGap: {
        targetRole: 'Corporate Lawyer',
        skills: [
          { name: 'Contract Drafting', value: 80 },
          { name: 'M&A', value: 60 },
          { name: 'Compliance', value: 70 },
          { name: 'Negotiation', value: 75 },
        ],
      },
      careerPath: {
        currentRole: 'Law Intern',
        nextRoles: ['Junior Associate', 'Associate', 'Senior Associate'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1slaw%20firms%20in%20Delhi!5e0!3m2!1sen!2sin!4v1628583276531!5m2!1sen!2sin"
    },
    // other law locations...
     "mumbai": {
      jobTrends: [
        { name: 'Corporate Lawyer', growth: 20 },
        { name: 'Litigation Associate', growth: 15 },
        { name: 'Legal Analyst', growth: 22 },
        { name: 'Compliance Officer', growth: 25 },
      ],
      skills: [
        { skill: 'Legal Research', demand: 95 },
        { skill: 'Drafting', demand: 92 },
        { skill: 'Contract Law', demand: 88 },
        { skill: 'Due Diligence', demand: 85 },
        { skill: 'Negotiation', demand: 90 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 600000 },
        { level: 'Mid-Level', salary: 1500000 },
        { level: 'Senior-Level', salary: 3500000 },
      ],
      companies: [
        { name: 'AZB & Partners', logo: 'https://placehold.co/100x100.png', hint: 'azb partners' },
        { name: 'Cyril Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'cyril amarchand' },
        { name: 'Khaitan & Co', logo: 'https://placehold.co/100x100.png', hint: 'khaitan co' },
        { name: 'Shardul Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'shardul amarchand' },
      ],
      skillGap: {
        targetRole: 'Corporate Lawyer',
        skills: [
          { name: 'Contract Drafting', value: 80 },
          { name: 'M&A', value: 60 },
          { name: 'Compliance', value: 70 },
          { name: 'Negotiation', value: 75 },
        ],
      },
      careerPath: {
        currentRole: 'Law Intern',
        nextRoles: ['Junior Associate', 'Associate', 'Senior Associate'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1slaw%20firms%20in%20Delhi!5e0!3m2!1sen!2sin!4v1628583276531!5m2!1sen!2sin"
    },
     "bangalore": {
      jobTrends: [
        { name: 'Corporate Lawyer', growth: 20 },
        { name: 'Litigation Associate', growth: 15 },
        { name: 'Legal Analyst', growth: 22 },
        { name: 'Compliance Officer', growth: 25 },
      ],
      skills: [
        { skill: 'Legal Research', demand: 95 },
        { skill: 'Drafting', demand: 92 },
        { skill: 'Contract Law', demand: 88 },
        { skill: 'Due Diligence', demand: 85 },
        { skill: 'Negotiation', demand: 90 },
      ],
      salary: [
        { level: 'Entry-Level', salary: 600000 },
        { level: 'Mid-Level', salary: 1500000 },
        { level: 'Senior-Level', salary: 3500000 },
      ],
      companies: [
        { name: 'AZB & Partners', logo: 'https://placehold.co/100x100.png', hint: 'azb partners' },
        { name: 'Cyril Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'cyril amarchand' },
        { name: 'Khaitan & Co', logo: 'https://placehold.co/100x100.png', hint: 'khaitan co' },
        { name: 'Shardul Amarchand', logo: 'https://placehold.co/100x100.png', hint: 'shardul amarchand' },
      ],
      skillGap: {
        targetRole: 'Corporate Lawyer',
        skills: [
          { name: 'Contract Drafting', value: 80 },
          { name: 'M&A', value: 60 },
          { name: 'Compliance', value: 70 },
          { name: 'Negotiation', value: 75 },
        ],
      },
      careerPath: {
        currentRole: 'Law Intern',
        nextRoles: ['Junior Associate', 'Associate', 'Senior Associate'],
      },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d118944.93922339391!2d72.82246239108929!3d19.07165318182924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1slaw%20firms%20in%20Delhi!5e0!3m2!1sen!2sin!4v1628583276531!5m2!1sen!2sin"
    },
  },
};


export default function CareerDashboardPage() {
  const [selectedIndustry, setSelectedIndustry] = React.useState<Industry>('Information Technology');
  const [selectedLocation, setSelectedLocation] = React.useState<Location>('all-india');
  
  const handleIndustryChange = (industry: Industry) => {
    setSelectedIndustry(industry);
    // Reset location to 'all-india' when industry changes to avoid invalid state
    setSelectedLocation('all-india');
  };

  const industryData = placeholderData[selectedIndustry]?.[selectedLocation] || placeholderData[selectedIndustry]['all-india'];
  const locationToShow = placeholderData[selectedIndustry]?.[selectedLocation] ? selectedLocation : 'all-india';

  const jobTrendsConfig = {
    growth: { label: "Growth", color: "hsl(var(--chart-1))" },
  };

  const skillsConfig = {
    demand: { label: "Demand", color: "hsl(var(--chart-2))" },
    skill: { label: "Skill" }
  };
  
  const salaryConfig = {
    salary: { label: "Salary", color: "hsl(var(--chart-3))" },
    level: { label: "Experience Level" }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-secondary/5 via-background to-secondary/10">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 transition-all duration-300">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center group" prefetch={false}>
            <Bot className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <span className="ml-3 font-bold font-headline text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Career Compass AI
            </span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 container py-12 md:py-16 px-4 sm:px-6">
        <div className="flex items-center mb-10">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" className="transition-all hover:scale-105 hover:shadow-md">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Career Dashboard
          </h1>
        </div>

        <Card className="mb-10 shadow-xl transition-all hover:shadow-2xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl">Dashboard Filters</span>
            </CardTitle>
            <CardDescription className="text-sm text-foreground/80">
              Select an industry and location to see personalized insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select onValueChange={(value) => handleIndustryChange(value as Industry)} defaultValue={selectedIndustry}>
                <SelectTrigger className="h-12 border-border/50 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent className="border-border/50 shadow-lg">
                  {Object.keys(placeholderData).map(industry => (
                    <SelectItem 
                      key={industry} 
                      value={industry}
                      className="hover:bg-primary/5 focus:bg-primary/10 transition-colors"
                    >
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select onValueChange={(value) => setSelectedLocation(value as Location)} value={locationToShow}>
                <SelectTrigger className="h-12 border-border/50 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent className="border-border/50 shadow-lg">
                  <SelectItem value="all-india" className="hover:bg-primary/5">All India</SelectItem>
                  <SelectItem value="mumbai" className="hover:bg-primary/5">Mumbai</SelectItem>
                  <SelectItem value="bangalore" className="hover:bg-primary/5">Bangalore</SelectItem>
                  <SelectItem value="delhi-ncr" className="hover:bg-primary/5">Delhi NCR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card className="lg:col-span-2 shadow-xl transition-all hover:shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
                <span>Top Job Trends</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                Projected annual growth for roles in {selectedIndustry}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={jobTrendsConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={industryData.jobTrends} accessibilityLayer layout="vertical" margin={{ left: 25, right: 30 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border) / 0.3)" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tickLine={false} 
                      tickMargin={10} 
                      axisLine={false} 
                      width={130} 
                      tick={{ fontSize: 12 }}
                    />
                    <XAxis dataKey="growth" type="number" hide />
                    <RechartsTooltip 
                      cursor={false} 
                      content={<ChartTooltipContent indicator="dot" />} 
                      wrapperStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="growth" 
                      fill="var(--color-growth)" 
                      radius={5}
                      animationDuration={1500}
                    >
                      <LabelList 
                        dataKey="growth" 
                        position="right" 
                        offset={8} 
                        className="fill-foreground font-medium" 
                        fontSize={12} 
                        formatter={(value: number) => `${value}%`} 
                      />
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 xl:col-span-1 shadow-xl transition-all hover:shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                </div>
                <span>In-Demand Skills</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                Key skills for {selectedIndustry}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={skillsConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={industryData.skills}>
                    <PolarGrid 
                      gridType="circle" 
                      stroke="hsl(var(--border) / 0.3)" 
                      radialLines={false}
                    />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Demand" 
                      dataKey="demand" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.4} 
                      animationDuration={1500}
                    />
                    <RechartsTooltip 
                      content={<ChartTooltipContent indicator="dot" />}
                      wrapperStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="xl:col-span-1 shadow-xl transition-all hover:shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <span>Top Hiring Companies</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                Actively hiring in {selectedIndustry}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {industryData.companies.map(company => (
                <div 
                  key={company.name} 
                  className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-secondary/10 transition-all hover:shadow-sm border-border/30"
                >
                  <div className="p-1 bg-white rounded-full shadow-sm">
                    <Image 
                      src={company.logo} 
                      alt={`${company.name} logo`} 
                      width={40} 
                      height={40} 
                      className="rounded-full" 
                      data-ai-hint={company.hint} 
                    />
                  </div>
                  <span className="font-medium text-sm">{company.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-xl transition-all hover:shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span>Salary Insights (Annual)</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                Average annual salary (INR) in {selectedIndustry}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salaryConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={industryData.salary} accessibilityLayer margin={{ top: 20 }}>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.3)"/>
                    <XAxis 
                      dataKey="level" 
                      tickLine={false} 
                      tickMargin={10} 
                      axisLine={false} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`}
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip 
                      cursor={false} 
                      content={<ChartTooltipContent indicator="dot" />}
                      wrapperStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="salary" 
                      fill="var(--color-salary)" 
                      radius={[5, 5, 0, 0]}
                      animationDuration={1500}
                    >
                      <LabelList 
                        dataKey="salary" 
                        position="top" 
                        offset={8} 
                        className="fill-foreground font-medium" 
                        fontSize={12} 
                        formatter={(value: number) => `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`} 
                      />
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl transition-all hover:shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <span>Skill Gap Analysis</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                Your skills vs. target role: <strong className="text-primary">{industryData.skillGap.targetRole}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {industryData.skillGap.skills.map(skill => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">{skill.name}</label>
                    <span className="text-xs font-medium text-primary">{skill.value}%</span>
                  </div>
                  <Progress 
                    value={skill.value} 
                    indicatorClassName="bg-gradient-to-r from-primary to-primary/80"
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-full xl:col-span-2 shadow-xl transition-all hover:shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <span>AI-Suggested Career Path</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                From your current role: <strong className="text-primary">{industryData.careerPath.currentRole}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-around text-center py-6">
              {industryData.careerPath.nextRoles.map((role, index) => (
                <React.Fragment key={role}>
                  <div className="flex flex-col items-center transition-transform hover:scale-105">
                    <div className={cn(
                      "p-4 rounded-full transition-all duration-300",
                      index === 0 
                        ? 'bg-primary/10 border-2 border-primary shadow-lg shadow-primary/30' 
                        : 'bg-secondary/10 border-2 border-border/30 hover:border-primary/30'
                    )}>
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <p 
                      className="font-semibold mt-3 text-sm bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                      dangerouslySetInnerHTML={{ __html: role.replace(/\s/g, '<br/>') }}
                    ></p>
                    {index === 0 && (
                      <div className="mt-2 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Next Step
                      </div>
                    )}
                  </div>
                  {index < industryData.careerPath.nextRoles.length - 1 && (
                    <div className="flex-1 relative mx-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-border/30"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-2 text-xs text-muted-foreground">
                          {index === 0 ? '1-2 years' : '3-5 years'}
                        </span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-full xl:col-span-2 shadow-xl transition-all hover:shadow-2xl border-border/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <span>Location-Based Opportunities</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                Job hotspots for the {selectedIndustry} industry.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden rounded-b-lg">
              <iframe
                src={industryData.mapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[400px] -mb-1"
              ></iframe>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
