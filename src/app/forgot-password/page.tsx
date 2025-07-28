
"use client";

import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
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
                <div className="text-center p-8 border-dashed border-2 border-border rounded-lg max-w-md w-full">
                    <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl font-headline mb-4">
                        Forgot Password
                    </h1>
                    <p className="mt-2 text-muted-foreground mb-4">
                        This page is under construction. Functionality to reset your password will be available soon.
                    </p>
                    <Link href="/signin" passHref>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
