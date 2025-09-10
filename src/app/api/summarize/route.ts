import { summarizeText } from '@/ai/flows/summarize-text';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
  }

  try {
    const { summary } = await summarizeText({ text });
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing text:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate summary.', details: errorMessage }, { status: 500 });
  }
}
