import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = !!process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'not-set';
  
  return NextResponse.json({
    env: {
      GROQ_API_KEY: hasKey ? '✓ SET' : '✗ MISSING',
      GROQ_MODEL: model === 'not-set' ? '✗ MISSING' : '✓ SET: ' + model,
    },
    message: hasKey 
      ? 'Environment variables are correctly set.' 
      : 'ERROR: GROQ_API_KEY is missing. Add it to Vercel Project > Settings > Environment Variables.',
  });
}
