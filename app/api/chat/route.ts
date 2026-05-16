import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/transcript';
import { generateResponse, detectLanguage } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, question } = await request.json();

    if (!videoUrl || !question) {
      return NextResponse.json(
        { success: false, error: 'Video URL and question are required' },
        { status: 400 }
      );
    }

    const transcript = await getTranscript(videoUrl);
    const language = await detectLanguage(question);

    const systemPrompt = `You are an educational AI assistant. Answer the user's question about the video lecture based on the provided transcript. 
    Include relevant timestamps from the transcript if available. Be clear and concise.`;

    const response = await generateResponse(
      transcript,
      question,
      language,
      systemPrompt
    );

    return NextResponse.json({
      success: true,
      data: {
        answer: response,
        language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chat failed. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
