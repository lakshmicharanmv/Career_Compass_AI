
'use client';

import Link from 'next/link';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';

const FormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  email: z.string().email(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please use YYYY-MM-DD format.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof FormSchema>;

export default function PersonalInformationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const { user, aac, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      gender: undefined,
      dob: '',
      phone: '',
      linkedin: '',
      github: '',
    },
  });

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/signin');
    }
    if (!isUserLoading && user) {
        const dob = aac?.dob ? new Date(aac.dob).toISOString().split('T')[0] : '';
        form.reset({
            fullName: user.displayName || aac?.fullName || '',
            email: user.email || '',
            gender: aac?.gender,
            phone: aac?.phone || '',
            linkedin: aac?.linkedin || '',
            github: aac?.github || '',
            dob: dob,
        });
    }
  }, [isUserLoading, user, aac, router, form]);


  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    if (!user || !auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be signed in to update your profile.' });
        setIsLoading(false);
        return;
    }

    try {
        const dob = new Date(data.dob).toISOString();

        // Update Firebase Auth profile
        await updateProfile(user, { displayName: data.fullName });

        // NOTE: We're using localStorage to persist additional user info for this prototype
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === user.email);
        
        const updatedInfo = {
            ...data,
            dob,
            personalInfoCompleted: true
        };

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedInfo };
        } else {
            // This case handles users who signed up but somehow missed the initial localStorage write
            users.push({ email: user.email, ...updatedInfo });
        }
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify({
            ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
            ...updatedInfo,
            displayName: data.fullName,
        }));
      
        toast({
          title: 'Profile Saved!',
          description: 'Your personal details have been updated.',
        });
        router.push('/');

    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Could not save your details.' });
    } finally {
        setIsLoading(false);
    }
  }

  if (isUserLoading) {
      return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl items-center">
          <Link href="/" className="flex items-center" prefetch={false}>
            <Bot className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold font-headline text-lg">
              Career Compass AI
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1 container flex items-center justify-center py-12 md:py-16">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Complete Your Profile</CardTitle>
            <CardDescription>
              Please provide some personal information to help us tailor your experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} disabled />
                        </FormControl>
                         <FormDescription>
                            Email cannot be changed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input placeholder="YYYY-MM-DD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                    <h3 className="text-md font-medium mb-2">Social Media (Optional)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>LinkedIn Profile URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://linkedin.com/in/..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="github"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>GitHub Profile URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://github.com/..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save and Continue'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
