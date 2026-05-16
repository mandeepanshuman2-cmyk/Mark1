import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/transcript';
import { generateResponse, detectLanguage } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, topic, language = 'english' } = await request.json();

    if (!videoUrl || !topic) {
      return NextResponse.json(
        { success: false, error: 'Video URL and topic are required' },
        { status: 400 }
      );
    }

    const transcript = await getTranscript(videoUrl);

    const systemPrompt = `Explain the concept: "${topic}" from the lecture in a simple, step-by-step manner. Include:
    1. Definition
    2. Core concepts (break into simple parts)
    3. Step-by-step explanation
    4. Real-life examples
    5. Common misconceptions
    6. Key takeaways`;

    const response = await generateResponse(
      transcript,
      `Explain ${topic}`,
      language,
      systemPrompt
    );

    return NextResponse.json({
      success: true,
      data: {
        explanation: response,
        topic,
        language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Explanation generation failed. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
