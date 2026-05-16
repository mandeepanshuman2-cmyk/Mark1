import { NextRequest, NextResponse } from 'next/server';
import { getTranscript, getTimestampedTranscript } from '@/lib/transcript';
import { generateResponse, detectLanguage } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if env vars are present
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasGroqModel = !!process.env.GROQ_MODEL;
    
    if (!hasGroqKey || !hasGroqModel) {
      console.error('❌ Missing Groq environment variables:', {
        GROQ_API_KEY: hasGroqKey ? '✓ present' : '✗ MISSING',
        GROQ_MODEL: hasGroqModel ? '✓ present' : '✗ MISSING',
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Missing Groq API credentials. Check Vercel Environment Variables.',
          debug: { hasGroqKey, hasGroqModel }
        },
        { status: 500 }
      );
    }

    const { videoUrl, language = 'english' } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const transcript = await getTranscript(videoUrl);
    const timestampedData = await getTimestampedTranscript(videoUrl);

    const systemPrompt = `Create a comprehensive structured summary of this lecture. Include:
    1. Main topic overview
    2. Key concepts with approximate timestamps (e.g., "0:30 - Introduction to...", "2:15 - Key concept...")
    3. Important takeaways
    4. Real-world applications
    5. Summary in bullet points
    
    Format timestamps clearly so users can click and jump to that part of the video.`;

    const response = await generateResponse(
      transcript,
      'Summarize this lecture with timestamps',
      language,
      systemPrompt
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: response,
        language,
        timestamp: new Date().toISOString(),
        hasVideo: !!timestampedData?.items,
        videoLength: timestampedData?.items?.reduce((sum, item) => sum + (item.duration || 0), 0) || 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Summarization failed. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
