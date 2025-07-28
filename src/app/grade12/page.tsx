
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, ArrowLeft } from 'lucide-react';

export default function Grade12Page() {
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
      <main className="flex-1 container py-12 md:py-16">
        <div className="flex items-center mb-8">
          <Link href="/" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">
            College & Major Selection
          </h1>
        </div>
        <div className="text-center p-8 border-dashed border-2 border-border rounded-lg">
          <h2 className="text-2xl font-headline text-muted-foreground">
            12th Grade Flow - Coming Soon!
          </h2>
          <p className="mt-2 text-muted-foreground">
            This section will help you find the best colleges and majors based on your interests and career goals.
          </p>
        </div>
      </main>
    </div>
  );
}
