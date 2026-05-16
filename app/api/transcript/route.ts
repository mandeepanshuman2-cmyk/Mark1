import { NextRequest, NextResponse } from 'next/server';
import { getTimestampedTranscript } from '@/lib/transcript';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const timestampedTranscript = await getTimestampedTranscript(videoUrl);

    // Allow all videos with transcripts
    if (!timestampedTranscript.items || timestampedTranscript.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No transcript available for this video. Make sure it has captions.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: timestampedTranscript,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch transcript. Please try again.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
