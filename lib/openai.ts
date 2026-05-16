const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_TRANSCRIPT_CHARS = 10000;

function getGroqApiKey(): string {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    throw new Error('Missing GROQ_API_KEY. Add your Groq API key to .env.local and restart the dev server.');
  }

  return GROQ_API_KEY;
}

function trimTranscript(transcript: string): string {
  if (transcript.length <= MAX_TRANSCRIPT_CHARS) {
    return transcript;
  }

  const halfLength = Math.floor(MAX_TRANSCRIPT_CHARS / 2);
  const start = transcript.slice(0, halfLength);
  const end = transcript.slice(-halfLength);

  return `${start}\n\n[Transcript shortened to fit the API token limit. Middle section omitted.]\n\n${end}`;
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const apiKey = getGroqApiKey();
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: `Detect the language of this text and respond with ONLY the language name (English, Hindi, Hinglish, Marathi, Tamil, Telugu, or Bengali). Text: "${text}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return 'english';
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || 'English';
    return result.toLowerCase();
  } catch (error) {
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
    const apiKey = getGroqApiKey();
    const langInstruction = `Respond in ${language}. `;
    const trimmedTranscript = trimTranscript(transcript);
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: options?.maxTokens ?? 1000,
        ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          {
            role: 'user',
            content: `${langInstruction}${systemPrompt}\n\nTranscript: ${trimmedTranscript}\n\nQuery: ${query}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Groq API error (${response.status}):`, error);
      throw new Error(`Groq API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || '';
    return result;
  } catch (error) {
    throw new Error(`Failed to generate response: ${error}`);
  }
}
