
"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Bot, LogOut, Briefcase, DollarSign, Brain, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobDemandChart from '@/components/ui/job-demand-chart';
import SalaryChart from '@/components/ui/salary-chart';

export default function DashboardPage() {
    const router = useRouter();
    const [userName, setUserName] = React.useState("User");

    React.useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (currentUser.name) {
            setUserName(currentUser.name);
        } else {
            // Redirect to sign-in if no user is found
            router.push("/signin");
        }
    }, [router]);


    const handleSignOut = () => {
        localStorage.removeItem("currentUser");
        router.push("/");
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-secondary/40">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-xl items-center">
                    <Link href="/" className="flex items-center" prefetch={false}>
                        <Bot className="h-6 w-6 text-primary" />
                        <span className="ml-2 font-bold font-headline text-lg">
                            Career Compass AI
                        </span>
                    </Link>
                    <div className="ml-auto">
                        <Button variant="outline" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-8 md:py-12">
                <div className="space-y-4 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline">
                        Welcome Back, {userName}!
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Here’s your personalized career dashboard.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                     <Card className="bg-background/70 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top In-Demand Skill</CardTitle>
                            <Brain className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Machine Learning</div>
                            <p className="text-xs text-muted-foreground">+15% growth this quarter</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-background/70 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fastest Growing Industry</CardTitle>
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Renewable Energy</div>
                            <p className="text-xs text-muted-foreground">+250k new jobs predicted</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-background/70 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Salary (Tech)</CardTitle>
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$125,000</div>
                            <p className="text-xs text-muted-foreground">Based on national averages</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-background/70 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recommended Roles</CardTitle>
                            <BarChart className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground">Jobs matching your profile</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
                    <Card className="lg:col-span-4 bg-background/70 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Job Demand Trends</CardTitle>
                            <CardDescription>Based on market data from the last 12 months.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                           <JobDemandChart />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3 bg-background/70 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Average Salary by Role</CardTitle>
                            <CardDescription>Comparison of top tech roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <SalaryChart />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

