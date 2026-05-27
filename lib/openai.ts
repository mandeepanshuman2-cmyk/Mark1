import { generateText } from 'ai';

const MAX_TRANSCRIPT_CHARS = 10000;

function trimTranscript(transcript: string): string {
  if (transcript.length <= MAX_TRANSCRIPT_CHARS) {
    return transcript;
  }

  const halfLength = Math.floor(MAX_TRANSCRIPT_CHARS / 2);
  const start = transcript.slice(0, halfLength);
  const end = transcript.slice(-halfLength);

  return `${start}\n\n[Transcript shortened to fit the token limit. Middle section omitted.]\n\n${end}`;
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const { text: result } = await generateText({
      model: 'grok-2-latest',
      system: 'Detect the language of the given text. Respond with ONLY the language name.',
      prompt: `Detect the language of this text and respond with ONLY the language name (English, Hindi, Hinglish, Marathi, Tamil, Telugu, or Bengali). Text: "${text}"`,
      maxTokens: 50,
    });

    return result.toLowerCase() || 'english';
  } catch (error) {
    console.error('[v0] Language detection error:', error);
    return 'english';
  }
}

export async function generateResponse(
  transcript: string,
  query: string,
  language: string,
  systemPrompt: string,
  options?: {
    jsonMode?: boolean;
    maxTokens?: number;
  }
): Promise<string> {
  try {
    const langInstruction = `Respond in ${language}. `;
    const trimmedTranscript = trimTranscript(transcript);

    const { text: result } = await generateText({
      model: 'grok-2-latest',
      system: `${langInstruction}${systemPrompt}`,
      prompt: `Transcript: ${trimmedTranscript}\n\nQuery: ${query}`,
      maxTokens: options?.maxTokens ?? 1000,
    });

    return result;
  } catch (error) {
    console.error('[v0] Generation error:', error);
    throw new Error(`Failed to generate response: ${error}`);
  }
}
