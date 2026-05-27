# EduGenie YouTube Transcript API Setup Guide

## Overview

EduGenie now uses **RapidAPI YouTube Transcript API** to fetch YouTube transcripts reliably without getting blocked by YouTube's 429 rate limiting errors. This guide shows you how to set up and configure the API keys.

---

## Environment Variables Required

You need to configure two sets of environment variables:

### 1. **RapidAPI Key** (Required for Transcripts)
**What it does:** Fetches YouTube transcripts safely and reliably

**Steps to get your key:**
1. Visit: https://rapidapi.com/grix-grix-grix/api/youtube-transcript
2. Click "Subscribe to Test" (free tier available)
3. Copy your API Key from the "X-RapidAPI-Key" section
4. Add to your environment:

```bash
RAPIDAPI_KEY=your_api_key_here
```

### 2. **Groq API Key** (Required for AI Features)
**What it does:** Powers summarization, quiz generation, explanations, etc.

**Steps to get your key:**
1. Visit: https://console.groq.com
2. Create an account or sign in
3. Generate an API key
4. Add to your environment:

```bash
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

---

## Local Development Setup

### Option 1: Using `.env.local` (Recommended)

Create a `.env.local` file in your project root:

```bash
# Copy the example file
cp .env.example .env.local

# Then edit it and add your actual keys
```

**File: `.env.local`**
```
RAPIDAPI_KEY=paste_your_rapidapi_key_here
GROQ_API_KEY=paste_your_groq_key_here
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

The dev server will automatically load these variables.

---

## Vercel Deployment Setup

### Step 1: Add Environment Variables to Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Key | Value |
|-----|-------|
| `RAPIDAPI_KEY` | Your RapidAPI key |
| `GROQ_API_KEY` | Your Groq API key |
| `GROQ_MODEL` | `meta-llama/llama-4-scout-17b-16e-instruct` |

### Step 2: Verify Configuration
After deploying, test the `/api/debug` endpoint to verify all variables are set:

```bash
curl https://your-app.vercel.app/api/debug
```

Expected response:
```json
{
  "env": {
    "GROQ_API_KEY": "✓ SET",
    "GROQ_MODEL": "✓ SET: meta-llama/llama-4-scout-17b-16e-instruct",
    "RAPIDAPI_KEY": "✓ SET"
  },
  "status": "OK",
  "errors": [],
  "message": "All environment variables are correctly set."
}
```

---

## How It Works

### Transcript Fetching Flow

```
User submits YouTube URL
    ↓
/api/transcript endpoint
    ↓
lib/transcript.ts → fetchFromRapidAPI()
    ↓
RapidAPI YouTube Transcript API
    ↓
Returns transcript items with timestamps
    ↓
Cached in memory for future requests
    ↓
Returned to frontend
```

### Key Benefits

- ✅ **No 429 Errors** - Uses official API, not web scraping
- ✅ **Fast & Reliable** - RapidAPI is optimized for this
- ✅ **Cached Responses** - Reduces API calls
- ✅ **Multiple Language Support** - RapidAPI handles fallbacks
- ✅ **Cost Effective** - RapidAPI free tier has generous limits

---

## API Response Format

The RapidAPI endpoint returns transcript items in this format:

```typescript
interface TranscriptItem {
  text: string;          // The spoken text
  start: number;         // Start time in seconds
  duration: number;      // Duration in seconds
}

interface TranscriptResponse {
  items: TranscriptItem[];
  language: string;      // Language code (e.g., 'en')
  isEducational: boolean; // Detected educational content
}
```

---

## Troubleshooting

### Error: "RapidAPI key not configured"
**Solution:** Add `RAPIDAPI_KEY` to your environment variables

### Error: "Rate limited by RapidAPI"
**Solution:** RapidAPI has rate limits. Check your plan limits at https://rapidapi.com/pricing

### Error: "No transcript available"
**Solution:** The video either:
- Doesn't have captions enabled
- Is private or age-restricted
- Is region-blocked

Try another video with captions enabled.

### Testing Configuration
Run the debug endpoint to verify everything is set up:

```bash
# Local development
curl http://localhost:3000/api/debug

# Production (Vercel)
curl https://your-app.vercel.app/api/debug
```

---

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Rotate keys regularly** - Check your API provider for key rotation
3. **Use Vercel's environment secrets** - Not in code
4. **Monitor API usage** - Watch RapidAPI dashboard for unusual activity
5. **Rate limit on client** - Don't allow users to spam requests

---

## Free Tier Limits

### RapidAPI YouTube Transcript API
- **Free Plan:** 100 requests/month
- **Upgrade:** https://rapidapi.com/grix-grix-grix/api/youtube-transcript/pricing

### Groq API
- **Free Plan:** Generous limits (~300 requests/month for most models)
- **Upgrade:** https://console.groq.com/billing

---

## Support

If you encounter issues:
1. Check the `/api/debug` endpoint
2. Review error logs in Vercel dashboard
3. Verify API keys are correct
4. Check RapidAPI and Groq dashboards for API status
