
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Link, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { marked } from 'marked';

import { controlSummaryLength } from '@/ai/flows/control-summary-length';
import { summarizeText } from '@/ai/flows/summarize-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type Length = 'short' | 'medium' | 'long';

export function PageSummarizer({ initialUrl }: { initialUrl?: string | null }) {
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLength, setCurrentLength] = useState<Length>('medium');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: initialUrl || '',
    },
  });

  const handleSummarize = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      setIsLoading(true);
      setSummary(null);
      setOriginalText(null);
      setError(null);
      setCurrentLength('medium');
      try {
        const result = await summarizeText({ text: `Please summarize the content of the webpage at this URL: ${data.url}` });
        
        setOriginalText(result.summary);
        setSummary(result.summary);
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError('Failed to summarize the web page. Please check the URL and try again.');
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const handleLengthChange = useCallback(
    async (newLength: Length) => {
      if (!summary || !originalText) {
        toast({
          variant: 'destructive',
          title: 'No summary available',
          description: 'Please generate a summary first before changing its length.',
        });
        return;
      }
      setIsAdjusting(true);
      setError(null);
      try {
        const result = await controlSummaryLength({
          text: originalText,
          summary: summary,
          length: newLength,
        });
        setSummary(result.adjustedSummary);
        setCurrentLength(newLength);
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError('Failed to adjust summary length. Please try again.');
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: errorMessage,
        });
      } finally {
        setIsAdjusting(false);
      }
    },
    [summary, originalText, toast]
  );

  useEffect(() => {
    if (initialUrl) {
      form.setValue('url', initialUrl);
      handleSummarize({ url: initialUrl });
    }
  }, [initialUrl, form, handleSummarize]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summarize a Web Page</CardTitle>
          <CardDescription>Enter the URL of any article or blog post to get a concise summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSummarize)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Web Page URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="https://example.com/article" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Summarize
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Summary...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summary && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Adjust the length of the summary below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdjusting ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none text-foreground/90"
                dangerouslySetInnerHTML={{ __html: marked(summary) }}
              />
            )}
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Length:</span>
              {(['short', 'medium', 'long'] as const).map((len) => (
                <Button
                  key={len}
                  variant={currentLength === len ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLengthChange(len)}
                  disabled={isAdjusting}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 data-[variant=default]:bg-primary data-[variant=default]:text-primary-foreground"
                >
                  {len.charAt(0).toUpperCase() + len.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
