import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/transcript';
import { generateResponse, detectLanguage } from '@/lib/openai';
import { RevisionResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, language = 'english' } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const transcript = await getTranscript(videoUrl);

    const systemPrompt = `Create revision notes for this lecture. Format as JSON with:
    {
      "notes": ["key point 1", "key point 2", ...],
      "examQuestions": ["likely exam question 1", "likely exam question 2", ...],
      "lastMinuteTips": ["tip 1", "tip 2", ...]
    }
    
    - Notes: Top 8-10 important points with bullet points
    - Exam Questions: 5 likely questions for competitive exams
    - Last-minute tips: Quick memory aids and tricks`;

    const response = await generateResponse(
      transcript,
      'Create revision notes',
      language,
      systemPrompt
    );

    let revisionData: RevisionResponse;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      revisionData = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { notes: [], examQuestions: [], lastMinuteTips: [] };
    } catch (e) {
      revisionData = { notes: [], examQuestions: [], lastMinuteTips: [] };
    }

    return NextResponse.json({
      success: true,
      data: {
        revision: revisionData,
        language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Revision notes generation failed. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
