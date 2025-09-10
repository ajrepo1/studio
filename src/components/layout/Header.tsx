import { BookText, Download } from 'lucide-react';
import type { FC } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export const Header: FC = () => {
  return (
    <header className="w-full border-b border-border bg-card">
      <div className="container mx-auto flex h-20 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <BookText className="size-8 text-primary" />
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Summarist
          </h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2" />
              Download Extension
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Install Chrome Extension</AlertDialogTitle>
              <AlertDialogDescription>
                Follow these steps to install the Summarist Chrome Extension:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="prose prose-sm text-foreground/90">
              <ol>
                <li>The extension files are located in the <code>extension</code> directory of your project.</li>
                <li>Open Chrome and navigate to <code>chrome://extensions</code>.</li>
                <li>Enable "Developer mode" in the top-right corner.</li>
                <li>Click on "Load unpacked".</li>
                <li>Select the <code>extension</code> folder from your project directory.</li>
              </ol>
              <p>
                Once installed, you can right-click on any webpage to summarize it!
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Got it!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
};
