"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Header } from '@/components/layout/Header';
import { Summarizer } from '@/components/summarizer/Summarizer';

function HomePageContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
      <Header />
      <main className="container mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-8 md:py-12">
        <Summarizer initialUrl={url} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
