import { summarizeWebPage } from '@/ai/flows/summarize-web-page';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const { summary } = await summarizeWebPage({ url });
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing web page:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate summary.', details: errorMessage }, { status: 500 });
  }
}
