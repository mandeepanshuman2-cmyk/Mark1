import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Store video URL in memory or session (in production, use database)
    return NextResponse.json({
      success: true,
      data: { videoUrl, message: 'Video URL set successfully' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to set video';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
