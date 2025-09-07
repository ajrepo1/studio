import { PageSummarizer } from '@/components/summarizer/PageSummarizer';
import { VideoSummarizer } from '@/components/summarizer/VideoSummarizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Summarizer() {
  return (
    <Tabs defaultValue="page" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="page">Web Page</TabsTrigger>
        <TabsTrigger value="youtube">YouTube Video</TabsTrigger>
      </TabsList>
      <TabsContent value="page" className="mt-6">
        <PageSummarizer />
      </TabsContent>
      <TabsContent value="youtube" className="mt-6">
        <VideoSummarizer />
      </TabsContent>
    </Tabs>
  );
}
