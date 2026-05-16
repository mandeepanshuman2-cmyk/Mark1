import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/transcript';
import { generateResponse, detectLanguage } from '@/lib/openai';
import { WeakTopicResponse } from '@/lib/types';

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

    const systemPrompt = `Analyze this lecture and identify strong and weak topics. Format as JSON:
    {
      "strongTopics": ["well-covered topic 1", "well-covered topic 2"],
      "weakTopics": ["needs more study", "difficult concept"],
      "confidenceScore": 75,
      "recommendations": ["study recommendation 1", "study recommendation 2"]
    }
    
    - Strong topics: Clear, well-explained concepts
    - Weak topics: Complex areas that need more focus
    - Confidence score: Overall clarity (0-100%)
    - Recommendations: Targeted study suggestions`;

    const response = await generateResponse(
      transcript,
      'Analyze lecture difficulty and weak topics',
      language,
      systemPrompt
    );

    let weakTopicData: WeakTopicResponse;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      weakTopicData = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : {
            strongTopics: [],
            weakTopics: [],
            confidenceScore: 0,
            recommendations: [],
          };
    } catch (e) {
      weakTopicData = {
        strongTopics: [],
        weakTopics: [],
        confidenceScore: 0,
        recommendations: [],
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis: weakTopicData,
        language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Weak topics analysis failed. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
