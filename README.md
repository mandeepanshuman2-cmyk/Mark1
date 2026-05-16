# EduGenie — AI YouTube Lecture Intelligence Platform

A powerful AI-driven web application that transforms YouTube videos into comprehensive learning resources using advanced AI analysis.

## 🌟 Features

### 7 Intelligent Analysis Features

1. **💬 Chat** — Ask any question about the lecture with timestamp references
2. **📋 Summary** — Get structured lecture summaries with key timestamps  
3. **🔍 Explain** — Step-by-step explanations of concepts with real-world examples
4. **❓ Quiz** — Auto-generated quizzes (4 MCQs + 2 True/False) with instant grading
5. **📝 Revision** — Quick notes, exam questions, and last-minute tips
6. **🗺️ Roadmap** — Personalized Beginner → Intermediate → Advanced learning paths
7. **📊 Weak Topics** — Confidence scores, weak/strong topic analysis, and targeted recommendations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes (serverless)
- **AI**: Groq API (LLaMA 3.1 8B Instant model)
- **Transcripts**: youtube-transcript npm package
- **Deployment**: Ready for Vercel
- **Languages**: English, Hindi, Hinglish, Marathi, Tamil, Telugu, Bengali (auto-detected)

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Groq API Key (free at [console.groq.com](https://console.groq.com))

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd edugenie
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Add your Groq API key:

```env
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

**Get your API key:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create an API key
4. Paste it in `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. How to Use

1. **Paste YouTube URL** — Enter any YouTube video URL
2. **Select Feature** — Choose from Chat, Summary, Explain, Quiz, Revision, Roadmap, or Weak Topics
3. **Add Query** (if needed) — For Chat/Explain features, add your question or topic
4. **Generate** — Click Generate and wait for AI analysis
5. **View Results** — Results are displayed with color-coded sections

## 📁 Project Structure

```
edugenie/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Q&A endpoint
│   │   ├── summarize/route.ts     # Summary generation
│   │   ├── explain/route.ts       # Concept explanation
│   │   ├── quiz/route.ts          # Quiz generation
│   │   ├── revision/route.ts      # Revision notes
│   │   ├── roadmap/route.ts       # Learning path
│   │   ├── weakTopics/route.ts    # Topic analysis
│   │   └── setVideo/route.ts      # Video URL setter
│   ├── page.tsx                    # Main UI (7 tabs)
│   ├── layout.tsx                  # Root layout with context
│   └── globals.css                 # Global styles
├── components/
│   └── StarBackground.tsx          # 3D animated star field
├── lib/
│   ├── transcript.ts               # YouTube transcript fetcher + cache
│   ├── openai.ts                   # Groq API integration
│   ├── types.ts                    # TypeScript interfaces
│   └── context/
│       └── videoContext.tsx        # Video URL state management
├── .env.local                      # API keys (create this)
├── .env.example                    # Template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── README.md                       # This file
```

## 🔌 API Endpoints

All endpoints accept `POST` requests with JSON body:

### POST `/api/chat`
```json
{
  "videoUrl": "https://youtube.com/watch?v=...",
  "question": "What is the main topic?"
}
```

### POST `/api/summarize`
```json
{
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

### POST `/api/explain`
```json
{
  "videoUrl": "https://youtube.com/watch?v=...",
  "topic": "Photosynthesis"
}
```

### POST `/api/quiz`
```json
{
  "videoUrl": "https://youtube.com/watch?v=...",
  "topic": "Optional topic",
  "fullLecture": false
}
```

### POST `/api/revision`
```json
{
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

### POST `/api/roadmap`
```json
{
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

### POST `/api/weakTopics`
```json
{
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

## 🌐 Language Support

Auto-detects and responds in:
- English
- Hindi
- Hinglish (mix of Hindi and English)
- Marathi
- Tamil
- Telugu
- Bengali

## 🎨 UI Features

- **Dark Premium Dashboard** — Modern dark theme with gradient backgrounds
- **3D Star Background** — Animated canvas with 250 neon yellow stars
- **Shooting Stars** — Dynamic effects every 200 frames with gold trails
- **Responsive Design** — Works on desktop and tablet
- **Color-Coded Results** — Each feature has unique color scheme:
  - 💬 Chat: Blue
  - 📋 Summary: Green
  - 🔍 Explain: Purple
  - ❓ Quiz: Yellow
  - 📝 Revision: Indigo
  - 🗺️ Roadmap: Cyan
  - 📊 Weak Topics: Rose

## ⚠️ Limitations

- **No Captions = No Transcript** — YouTube videos must have captions enabled
- **YouTube Shorts** — May not have transcripts
- **Cache Reset** — Transcript cache resets when server restarts
- **Length Limit** — First 8000 characters of transcript processed (sufficient for most lectures)

## 🔄 How It Works

1. User enters YouTube URL → stored in React state
2. User selects feature (tab) → UI updates dynamically
3. User adds query if needed (for Chat/Explain)
4. Click Generate → POST to `/api/{feature}`
5. Backend:
   - Fetches transcript via youtube-transcript (tries EN → HI → auto)
   - Detects language from user input (Hindi/English/Hinglish)
   - Calls Groq LLaMA 3.1 8B with transcript + prompt
   - Parses response (JSON for Quiz/Roadmap, text for others)
6. Frontend displays results in appropriate format

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub + Vercel UI
1. Push code to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_GROQ_API_KEY` in Vercel environment variables
4. Deploy!

## 📚 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [youtube-transcript](https://www.npmjs.com/package/youtube-transcript)

## 🐛 Troubleshooting

**"No transcript available"**
- Check if the YouTube video has captions enabled
- Try a different video

**API errors**
- Verify your `GROQ_API_KEY` in `.env.local`
- Check Groq console for rate limits
- Ensure video URL is valid

**Blank results**
- Wait a few seconds (LLM processing takes time)
- Check browser console for errors
- Try a different video with more detailed content

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Please feel free to submit PRs.

---

**Built with ❤️ using Next.js + Groq AI**
