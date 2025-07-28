
'use client';

import Link from 'next/link';
import * as React from 'react';
import { Bot, ArrowLeft, Loader2, SendHorizonal, User, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { aiCareerChatbot } from '@/ai/flows/ai-career-chatbot';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CareerCounselorPage() {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<React.ElementRef<'div'>>(null);

  React.useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await aiCareerChatbot({ query: input });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with the AI. Please try again.',
      });
      // remove the user message if AI fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setMessages([]);
    setInput('');
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
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline ml-4">AI Career Counselor</h1>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Chat with our AI</CardTitle>
              <CardDescription>Ask anything about careers, skills, or resumes.</CardDescription>
            </div>
             <Button variant="ghost" size="icon" onClick={handleReset} disabled={isLoading || messages.length === 0}>
                <RefreshCcw className="h-4 w-4" />
                <span className="sr-only">Reset Chat</span>
              </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[60vh] flex flex-col">
              <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Start the conversation!</p>
                       <p className="text-sm">For example: "What are some good career options for a commerce graduate?"</p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : '')}>
                      {message.role === 'assistant' && (
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className={cn(
                        'p-3 rounded-lg max-w-[80%]',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                       {message.role === 'user' && (
                        <div className="p-2 bg-secondary rounded-full">
                           <User className="h-6 w-6 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                   {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                           <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div className="p-3 rounded-lg bg-secondary flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t pt-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your career..."
                  className="min-h-0 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    