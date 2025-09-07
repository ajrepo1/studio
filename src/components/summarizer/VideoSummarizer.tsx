'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, Youtube } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

export function VideoSummarizer() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLength, setCurrentLength] = useState<Length>('medium');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      videoUrl: '',
      length: 'medium',
    },
  });

  const handleSummarize = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setError(null);
    // Clear previous summary only if it's a new URL submission
    if (form.formState.isSubmitting) {
      setSummary(null);
    }

    try {
      const result = await summarizeYouTubeVideo(values);
      setSummary(result.summary);
      setCurrentLength(values.length);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError('Failed to summarize the video. Please check the URL and try again.');
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: errorMessage,
      });
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLengthChange = (newLength: Length) => {
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
    form.setValue('length', newLength);
    handleSummarize({ videoUrl: currentUrl, length: newLength });
  };

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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

      {error && !isLoading && (
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
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{summary}</p>
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
                  disabled={isLoading}
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
