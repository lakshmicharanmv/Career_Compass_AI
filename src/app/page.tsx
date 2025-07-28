
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Book,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Bot,
  BrainCircuit,
  FileText,
  BarChart3,
  Users,
  LogOut,
  User,
} from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";


export default function Home() {
  const [year, setYear] = React.useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser && currentUser.name) {
        setIsAuthenticated(true);
        setUserName(currentUser.name);
    }
    setYear(new Date().getFullYear());
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setUserName("");
    router.push("/"); // Refresh the page to reflect signed-out state
  };


  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
       <Dialog open={!isAuthenticated} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-headline">Welcome to Career Compass AI</DialogTitle>
            <DialogDescription className="text-center">
              Please sign in or create an account to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/signin" passHref>
                <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/signup" passHref>
                <Button variant="outline" className="w-full">Sign Up</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl items-center">
          <Link href="#" className="flex items-center" prefetch={false}>
            <Bot className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold font-headline text-lg">
              Career Compass AI
            </span>
          </Link>
           <nav className="ml-auto flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{userName}</span>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin" passHref>
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl xl:text-7xl/none">
                    {isAuthenticated ? `Welcome, ${userName}! ` : ''}Navigate Your Future with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Career Compass AI provides personalized guidance for students
                    and professionals. Discover your path, build a winning
                    resume, and unlock your potential.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="#start"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-8 text-sm font-medium text-accent-foreground shadow transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Find Your Path
                  </Link>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/650x650.png"
                width="650"
                height="650"
                alt="AI helping with career choices"
                data-ai-hint="career guidance abstract"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>

        <section id="start" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                  How can we help you today?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Select your current stage to get a personalized experience
                  tailored to your needs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardHeader className="flex flex-col items-center text-center p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <Book className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    10th Grader
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-6 pt-0">
                  <CardDescription>
                    Explore streams and subjects for your future.
                  </CardDescription>
                  <Link href="/grade10" passHref>
                    <Button variant="outline" className="mt-4">
                      Choose Path
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardHeader className="flex flex-col items-center text-center p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    12th Grader
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-6 pt-0">
                  <CardDescription>
                    Find your college, major and career options.
                  </CardDescription>
                   <Link href="/grade12" passHref>
                    <Button variant="outline" className="mt-4">
                      Find Major
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardHeader className="flex flex-col items-center text-center p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    Undergraduate
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-6 pt-0">
                  <CardDescription>
                    Prepare for your first job and internships.
                  </CardDescription>
                  <Link href="/undergraduate" passHref>
                    <Button variant="outline" className="mt-4">
                      Get Job Ready
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardHeader className="flex flex-col items-center text-center p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    Professional
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-6 pt-0">
                  <CardDescription>
                    Advance your career and find new opportunities.
                  </CardDescription>
                  <Link href="/professional" passHref>
                    <Button variant="outline" className="mt-4">
                      Level Up
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Everything You Need To Succeed
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform is packed with AI-powered tools to help you at
                every stage of your career journey.
              </p>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-3 bg-accent/10 rounded-full transition-transform duration-300 hover:scale-110">
                  <BrainCircuit className="text-accent h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold font-headline">
                  AI Career Advisor
                </h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent career path mapping.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-3 bg-accent/10 rounded-full transition-transform duration-300 hover:scale-110">
                  <FileText className="text-accent h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold font-headline">
                  AI Resume Reviewer
                </h3>
                <p className="text-sm text-muted-foreground">
                  ATS-friendly resume analysis.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-3 bg-accent/10 rounded-full transition-transform duration-300 hover:scale-110">
                  <BarChart3 className="text-accent h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold font-headline">
                  Career Dashboard
                </h3>
                <p className="text-sm text-muted-foreground">
                  Job trends and salary insights.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-3 bg-accent/10 rounded-full transition-transform duration-300 hover:scale-110">
                  <Users className="text-accent h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold font-headline">
                  AI Career Counselor
                </h3>
                <p className="text-sm text-muted-foreground">
                  24/7 AI-powered chatbot.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {year} Career Compass AI. All rights
          reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
