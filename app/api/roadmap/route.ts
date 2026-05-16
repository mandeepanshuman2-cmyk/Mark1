import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/transcript';
import { generateResponse, detectLanguage } from '@/lib/openai';
import { RoadmapResponse } from '@/lib/types';

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

    const systemPrompt = `Create a personalized learning roadmap based on this lecture content. Format as JSON:
    {
      "roadmap": [
        {
          "level": "Beginner",
          "topics": ["topic 1", "topic 2"],
          "timeEstimate": "2-3 weeks",
          "resources": ["resource suggestions"]
        },
        {
          "level": "Intermediate",
          "topics": [...],
          "timeEstimate": "4-6 weeks",
          "resources": [...]
        },
        {
          "level": "Advanced",
          "topics": [...],
          "timeEstimate": "6-8 weeks",
          "resources": [...]
        }
      ]
    }
    
    Make it progressive from Beginner → Intermediate → Advanced with realistic time estimates.`;

    const response = await generateResponse(
      transcript,
      'Create a learning roadmap',
      language,
      systemPrompt
    );

    let roadmapData: RoadmapResponse;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      roadmapData = jsonMatch ? JSON.parse(jsonMatch[0]) : { roadmap: [] };
    } catch (e) {
      roadmapData = { roadmap: [] };
    }

    return NextResponse.json({
      success: true,
      data: {
        roadmap: roadmapData,
        language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Roadmap generation failed. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
