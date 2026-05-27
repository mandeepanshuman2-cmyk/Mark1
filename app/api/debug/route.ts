import { NextResponse } from 'next/server';

export async function GET() {
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || 'not-set';
  const hasRapidAPI = !!process.env.RAPIDAPI_KEY;
  
  const errors: string[] = [];
  
  if (!hasGroqKey) {
    errors.push('GROQ_API_KEY is missing');
  }
  if (groqModel === 'not-set') {
    errors.push('GROQ_MODEL is not set');
  }
  if (!hasRapidAPI) {
    errors.push('RAPIDAPI_KEY is missing');
  }
  
  return NextResponse.json({
    env: {
      GROQ_API_KEY: hasGroqKey ? '✓ SET' : '✗ MISSING',
      GROQ_MODEL: groqModel === 'not-set' ? '✗ MISSING' : '✓ SET: ' + groqModel,
      RAPIDAPI_KEY: hasRapidAPI ? '✓ SET' : '✗ MISSING',
    },
    status: errors.length === 0 ? 'OK' : 'ERROR',
    errors: errors.length > 0 ? errors : [],
    message: errors.length === 0 
      ? 'All environment variables are correctly set.' 
      : `Missing environment variables: ${errors.join(', ')}. Add them to Vercel Project > Settings > Environment Variables.`,
    setup: {
      rapidapi: {
        description: 'YouTube Transcript API via RapidAPI (fixes 429 rate limit errors)',
        getKey: 'https://rapidapi.com/grix-grix-grix/api/youtube-transcript',
        envVar: 'RAPIDAPI_KEY',
      },
      groq: {
        description: 'Groq AI API for summarization and analysis',
        getKey: 'https://console.groq.com',
        envVars: ['GROQ_API_KEY', 'GROQ_MODEL'],
      },
    },
  });
}
