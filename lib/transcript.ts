/**
 * Transcript fetching using youtube-captions-scraper
 * Direct transcript fetching without API keys
 */

import { getSubtitles } from 'youtube-captions-scraper';

export const TRANSCRIPT_UNAVAILABLE_MESSAGE =
  'No transcript available for this video. Please use a YouTube video with captions or subtitles enabled.';

export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

export interface TimestampedTranscript {
  items: TranscriptItem[];
  language: string;
  isEducational: boolean;
}

interface TranscriptCache {
  [key: string]: string;
}

interface TimestampedTranscriptCache {
  [key: string]: TimestampedTranscript;
}

const transcriptCache: TranscriptCache = {};
const timestampedTranscriptCache: TimestampedTranscriptCache = {};

/**
 * Fetches transcript directly from YouTube using youtube-captions-scraper
 */
async function fetchTranscriptDirect(videoId: string): Promise<any[]> {
  try {
    console.log(`[v0] Fetching transcript directly for video: ${videoId}`);
    
    const captions = await getSubtitles({ videoID: videoId });
    
    if (!captions || captions.length === 0) {
      throw new Error('No transcript available');
    }

    console.log(`[v0] Successfully fetched ${captions.length} transcript items`);
    return captions;
  } catch (error) {
    throw error;
  }
}

export async function getTranscript(videoUrl: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Check cache
    if (transcriptCache[videoId]) {
      console.log(`[v0] Returning cached transcript for ${videoId}`);
      return transcriptCache[videoId];
    }

    // Fetch directly from YouTube
    const transcriptData = await fetchTranscriptDirect(videoId);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcripts are available for this video');
    }

    // Combine all text from transcript items
    const transcript = transcriptData
      .map((item: any) => item.text || '')
      .filter((text: string) => text.trim())
      .join(' ');

    if (!transcript) {
      throw new Error('No transcripts are available for this video');
    }

    // Cache the transcript
    transcriptCache[videoId] = transcript;

    // Return first 8000 characters
    return transcript.substring(0, 8000);
  } catch (error) {
    throw new Error(getTranscriptErrorMessage(error));
  }
}

function extractVideoId(url: string): string | null {
  const trimmedUrl = url.trim();

  // Check if it's just a video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Try multiple patterns to handle various YouTube URL formats
  const patterns = [
    // Standard youtube.com/watch?v=ID
    /(?:youtube\.com\/watch\?[^&]*v=|youtube\.com.*[?&]v=)([a-zA-Z0-9_-]{11})/i,
    // youtu.be/ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    // youtube.com/embed/ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    // youtube.com/v/ID
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i,
    // youtube.com/shorts/ID
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    // m.youtube.com variants
    /m\.youtube\.com\/watch\?[^&]*v=([a-zA-Z0-9_-]{11})/i,
    // Generic fallback for any youtube url with v= parameter
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback: try to find any 11-character token that looks like a video id
  const fallback = trimmedUrl.match(/([a-zA-Z0-9_-]{11})/g);
  if (fallback && fallback.length > 0) {
    // prefer a token that is not part of a longer path segment like 'watch'
    for (const token of fallback) {
      if (/^[a-zA-Z0-9_-]{11}$/.test(token)) {
        return token;
      }
    }
  }

  return null;
}

export async function getTimestampedTranscript(videoUrl: string): Promise<TimestampedTranscript> {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Check cache
    if (timestampedTranscriptCache[videoId]) {
      console.log(`[v0] Returning cached timestamped transcript for ${videoId}`);
      return timestampedTranscriptCache[videoId];
    }

    // Fetch directly from YouTube
    const transcriptData = await fetchTranscriptDirect(videoId);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcripts are available for this video');
    }

    const isEducational = await isEducationalVideo(videoUrl);
    const items = transcriptData.map(normalizeTranscriptItem);
    const timestampedTranscript = {
      items,
      language: 'en', // Default to English
      isEducational,
    };

    // Cache the timestamped transcript
    timestampedTranscriptCache[videoId] = timestampedTranscript;

    return timestampedTranscript;
  } catch (error) {
    throw new Error(getTranscriptErrorMessage(error));
  }
}

export function getTranscriptErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // Invalid URL errors
  if (message.includes('Invalid YouTube URL')) {
    return 'Invalid YouTube URL format. Please use: https://www.youtube.com/watch?v=VIDEO_ID, https://youtu.be/VIDEO_ID, or just the VIDEO_ID';
  }

  // Transcript unavailable errors
  if (
    message.includes('No transcript available') ||
    message.includes('No transcripts are available') ||
    message.includes('Transcript is disabled') ||
    message.includes('No transcripts are available in')
  ) {
    return 'No transcript available for this video.\n\nPlease make sure the video has:\n• Auto-generated captions (YouTube usually provides these)\n• Or manually added subtitles\n\nTips:\n• Check the video\'s "Show More" section for subtitle options\n• Some videos may need to be unlisted or fully public for transcripts to be available\n• Try refreshing the page and re-entering the URL if you recently enabled captions';
  }

  // Network/connection errors
  if (message.includes('fetch') || message.includes('network')) {
    return 'Network error while fetching the transcript. Please check your internet connection and try again.';
  }

  if (message.includes('404') || message.includes('Not Found')) {
    return 'Video not found. Please check the URL is correct and try again. The video may have been deleted or made private.';
  }

  return 'Could not fetch the transcript from YouTube.\n\nPlease try:\n• Using a different YouTube video with captions enabled\n• Checking your internet connection\n• Refreshing the page and trying again';
}

function normalizeTranscriptItem(item: any): TranscriptItem {
  const rawStart = Number(item.start ?? item.offset ?? item.startMs ?? 0);
  const rawDuration = Number(item.duration ?? item.dur ?? item.durationMs ?? 0);

  return {
    text: item.text || item.snippet || '',
    start: normalizeTranscriptTime(rawStart),
    duration: normalizeTranscriptTime(rawDuration),
  };
}

function normalizeTranscriptTime(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  // Handle both seconds and milliseconds
  return value > 1000 ? value / 1000 : value;
}

// Keywords to identify educational videos
const EDUCATIONAL_KEYWORDS = [
  'lecture',
  'tutorial',
  'course',
  'lesson',
  'class',
  'education',
  'learning',
  'how to',
  'explained',
  'understanding',
  'python',
  'javascript',
  'react',
  'node',
  'database',
  'web development',
  'programming',
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'history',
  'geography',
  'english',
  'hindi',
  'language',
  'science',
  'technology',
  'engineering',
  'computer',
  'algorithm',
  'data structure',
  'machine learning',
  'artificial intelligence',
];

export async function isEducationalVideo(videoUrl: string): Promise<boolean> {
  try {
    // For now, accept all videos with transcripts (simplified check)
    // In production, you'd fetch video metadata via YouTube API
    // For MVP, we'll check basic keywords but default to true
    const urlLower = videoUrl.toLowerCase();

    // Check if URL contains educational keywords
    const hasEducationalKeyword = EDUCATIONAL_KEYWORDS.some(keyword =>
      urlLower.includes(keyword)
    );

    // If keywords found, definitely educational
    if (hasEducationalKeyword) {
      return true;
    }

    // Default to true for all other videos (we'll show transcript for any video with captions)
    return true;
  } catch (error) {
    return true; // Default to allowing transcript
  }
}
