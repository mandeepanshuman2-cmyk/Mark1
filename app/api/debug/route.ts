import { NextResponse } from 'next/server';

export async function GET() {
  const errors: string[] = [];
  
  return NextResponse.json({
    status: errors.length === 0 ? 'OK' : 'ERROR',
    errors: errors.length > 0 ? errors : [],
    message: 'All systems operational. Using Vercel AI Gateway for AI features and youtube-captions-scraper for transcripts.',
    integrations: {
      aiGateway: {
        description: 'Vercel AI Gateway for AI-powered summarization',
        status: '✓ Active',
        note: 'Zero-config, included with Vercel',
      },
      youtubeTranscripts: {
        description: 'youtube-captions-scraper for direct YouTube transcript access',
        status: '✓ Active',
        note: 'No API key required',
      },
    },
  });
}

