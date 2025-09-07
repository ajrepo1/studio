import { BookText } from 'lucide-react';
import type { FC } from 'react';

export const Header: FC = () => {
  return (
    <header className="w-full border-b border-border bg-card">
      <div className="container mx-auto flex h-20 max-w-4xl items-center justify-center gap-3 px-4">
        <BookText className="size-8 text-primary" />
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Summarist
        </h1>
      </div>
    </header>
  );
};
