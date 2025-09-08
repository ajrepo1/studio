
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, Youtube } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { marked } from 'marked';

import { controlSummaryLength } from '@/ai/flows/control-summary-length';
import { summarizeYouTubeVideo } from '@/ai/flows/summarize-youtube-video';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  videoUrl: z
    .string()
    .url({ message: 'Please enter a valid YouTube URL.' })
    .refine((url) => url.includes('youtube.com') || url.includes('youtu.be'), {
      message: 'Please enter a valid YouTube URL.',
    }),
  length: z.enum(['short', 'medium', 'long']),
});

type Length = z.infer<typeof FormSchema>['length'];

export function VideoSummarizer({ initialUrl }: { initialUrl?: string | null }) {
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
      videoUrl: initialUrl || '',
      length: 'medium',
    },
  });

  const handleSummarize = useCallback(
    async (values: z.infer<typeof FormSchema>) => {
      setIsLoading(true);
      setError(null);
      setSummary(null);
      setOriginalText(null);

      try {
        const result = await summarizeYouTubeVideo(values);
        // For youtube videos, the summary is the original text to use for adjustments
        setOriginalText(result.summary);
        setSummary(result.summary);
        setCurrentLength(values.length);
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError('Failed to summarize the video. Please check the URL and try again.');
        setSummary(null);
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
      const currentUrl = form.getValues('videoUrl');
      if (form.getFieldState('videoUrl').invalid || !currentUrl) {
        toast({
          variant: 'destructive',
          title: 'Missing URL',
          description: 'Please enter a valid YouTube video URL first.',
        });
        form.trigger('videoUrl');
        return;
      }
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
    [form, summary, originalText, toast]
  );

  useEffect(() => {
    if (initialUrl) {
      form.setValue('videoUrl', initialUrl);
      handleSummarize({ videoUrl: initialUrl, length: 'medium' });
    }
  }, [initialUrl, form, handleSummarize]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summarize a YouTube Video</CardTitle>
          <CardDescription>Paste a YouTube video link to get a quick summary of its content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSummarize)} className="space-y-4">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="https://www.youtube.com/watch?v=..." className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Summary Length</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a summary length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && !summary && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Summarize
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && !summary && (
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

      {error && !isLoading && !isAdjusting && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summary && (
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
                  disabled={isAdjusting || isLoading}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 data-[variant=default]:bg-primary data-[variant=default]:text-primary-foreground"
                >
                  {isAdjusting && currentLength === len ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
