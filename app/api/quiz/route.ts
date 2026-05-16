import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/transcript';
import { generateResponse, detectLanguage } from '@/lib/openai';
import { QuizResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, topic, language = 'english', fullLecture = false } =
      await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const transcript = await getTranscript(videoUrl);
    const scope = fullLecture
      ? 'the entire lecture'
      : `the topic "${topic || 'lecture'}"`;

    const systemPrompt = `Generate an interactive quiz based on ${scope}. Create exactly 5 questions:
    - 4 MCQs with 4 short options each
    - 1 True/False question
    - Every main question must include a specific topic
    - Every main question must include exactly 2 short follow-up questions on the same topic for wrong answers
    
    Format your response as a JSON object with this structure:
    {
      "questions": [
        {
          "type": "mcq",
          "topic": "Specific topic name",
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Exact correct option text",
          "explanation": "One short sentence",
          "followUpQuestions": [
            {
              "type": "mcq",
              "topic": "Same specific topic name",
              "question": "Different question on the same topic?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Exact correct option text",
              "explanation": "One short sentence"
            },
            {
              "type": "trueFalse",
              "topic": "Same specific topic name",
              "question": "Different statement on the same topic?",
              "answer": "True",
              "explanation": "One short sentence"
            }
          ]
        },
        {
          "type": "trueFalse",
          "topic": "Specific topic name",
          "question": "Statement?",
          "answer": "True or False",
          "explanation": "One short sentence",
          "followUpQuestions": [
            {
              "type": "trueFalse",
              "topic": "Same specific topic name",
              "question": "Different statement on the same topic?",
              "answer": "False",
              "explanation": "One short sentence"
            },
            {
              "type": "mcq",
              "topic": "Same specific topic name",
              "question": "Different question on the same topic?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Exact correct option text",
              "explanation": "One short sentence"
            }
          ]
        }
      ]
    }
    
    Return only valid JSON. Do not include markdown. Keep all text concise.`;

    const response = await generateResponse(
      transcript,
      `Create a quiz about ${scope}`,
      language,
      systemPrompt,
      {
        jsonMode: true,
        maxTokens: 2500,
      }
    );

    // Parse JSON response
    let quizData: QuizResponse;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      quizData = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz generation failed: AI response was not valid quiz JSON. Please try again.',
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz generation failed: no quiz questions were generated. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        quiz: quizData,
        topic: topic || 'Full Lecture',
        language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Quiz generation failed. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
