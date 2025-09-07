import { Header } from '@/components/layout/Header';
import { Summarizer } from '@/components/summarizer/Summarizer';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
      <Header />
      <main className="container mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-8 md:py-12">
        <Summarizer />
      </main>
    </div>
  );
}
