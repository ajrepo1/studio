import { PageSummarizer } from '@/components/summarizer/PageSummarizer';
import { VideoSummarizer } from '@/components/summarizer/VideoSummarizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Summarizer({ initialUrl }: { initialUrl?: string | null }) {
  const isYoutubeUrl = initialUrl?.includes('youtube.com') || initialUrl?.includes('youtu.be');
  const defaultTab = isYoutubeUrl ? 'youtube' : 'page';

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="page">Web Page</TabsTrigger>
        <TabsTrigger value="youtube">YouTube Video</TabsTrigger>
      </TabsList>
      <TabsContent value="page" className="mt-6">
        <PageSummarizer initialUrl={!isYoutubeUrl ? initialUrl : undefined} />
      </TabsContent>
      <TabsContent value="youtube" className="mt-6">
        <VideoSummarizer initialUrl={isYoutubeUrl ? initialUrl : undefined} />
      </TabsContent>
    </Tabs>
  );
}
