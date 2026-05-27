'use client';

import { useState, useEffect } from 'react';
import { StarBackground } from '@/components/StarBackground';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import type { QuizQuestion } from '@/lib/types';
import type { TimestampedTranscript } from '@/lib/transcript';

type TabType =
  | 'chat'
  | 'summary'
  | 'explain'
  | 'quiz'
  | 'revision'
  | 'roadmap'
  | 'weakTopics'
  | 'transcript';

type Feature = {
  id: TabType;
  label: string;
  icon: string;
  description: string;
  action: string;
};

const features: Feature[] = [
  {
    id: 'chat',
    label: 'Chat',
    icon: 'C',
    description: 'Ask anything from the lecture transcript.',
    action: 'Ask AI',
  },
  {
    id: 'summary',
    label: 'Summary',
    icon: 'S',
    description: 'Generate structured notes and key takeaways.',
    action: 'Summarize',
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: 'E',
    description: 'Break down one concept in simple language.',
    action: 'Explain',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: 'Q',
    description: 'Practice, submit, and get follow-up questions.',
    action: 'Create Quiz',
  },
  {
    id: 'revision',
    label: 'Revision',
    icon: 'R',
    description: 'Create quick notes and likely exam questions.',
    action: 'Revise',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    icon: 'M',
    description: 'Build a step-by-step learning path.',
    action: 'Build Path',
  },
  {
    id: 'weakTopics',
    label: 'Weak Topics',
    icon: 'W',
    description: 'Find gaps and improvement recommendations.',
    action: 'Analyze',
  },
  {
    id: 'transcript',
    label: 'Transcript',
    icon: 'T',
    description: 'Real-time transcript with timestamps and video seek.',
    action: 'View',
  },
];

export default function Home() {
  // Helper function inside component
  const getVideoId = (url: string): string => {
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
      // youtube.com/live/ID
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
      // m.youtube.com variants
      /m\.youtube\.com\/watch\?[^&]*v=([a-zA-Z0-9_-]{11})/i,
      // Generic fallback for any youtube url with v= parameter
      /[?&]v=([a-zA-Z0-9_-]{11})/i,
      // youtu.be with query params
      /youtu\.be\/([a-zA-Z0-9_-]{11})[\?&]/i,
    ];

    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Fallback: try URL constructor for edge cases
    try {
      const urlObj = new URL(trimmedUrl);

      if (urlObj.hostname.includes('youtu.be')) {
        const id = urlObj.pathname.split('/').filter(Boolean)[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }

      if (urlObj.hostname.includes('youtube.com')) {
        const id = urlObj.searchParams.get('v');
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }
    } catch (error) {
      // URL parsing failed, return empty
    }

    return '';
  };
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
  const [transcriptData, setTranscriptData] = useState<TimestampedTranscript | null>(null);

  useEffect(() => {
    setTranscriptData(null);
    setCurrentTime(0);
    setSeekTime(undefined);
  }, [videoUrl]);

  const activeFeature = features.find((feature) => feature.id === activeTab) || features[0];

  const handleGenerate = async () => {
    if (!videoUrl.trim()) {
      alert('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setResult(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    if (activeTab === 'transcript') {
      setTranscriptData(null);
      setCurrentTime(0);
      setSeekTime(undefined);
    }

    try {
      let endpoint = '';
      const body: any = { videoUrl };

      switch (activeTab) {
        case 'chat':
          if (!input.trim()) {
            alert('Please enter a question');
            setLoading(false);
            return;
          }
          endpoint = '/api/chat';
          body.question = input;
          break;
        case 'summary':
          endpoint = '/api/summarize';
          break;
        case 'explain':
          if (!input.trim()) {
            alert('Please enter a topic');
            setLoading(false);
            return;
          }
          endpoint = '/api/explain';
          body.topic = input;
          break;
        case 'quiz':
          endpoint = '/api/quiz';
          body.topic = input || 'full lecture';
          body.fullLecture = !input;
          break;
        case 'revision':
          endpoint = '/api/revision';
          break;
        case 'roadmap':
          endpoint = '/api/roadmap';
          break;
        case 'weakTopics':
          endpoint = '/api/weakTopics';
          break;
        case 'transcript':
          endpoint = '/api/transcript';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
      
      // Handle transcript data separately
      if (activeTab === 'transcript' && data.success) {
        setTranscriptData(data.data);
      }
    } catch (error) {
      setResult({ success: false, error: `Error: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const normalizeAnswer = (answer: string) =>
    answer.trim().toLowerCase().replace(/^[a-d]\)\s*/, '');

  const isQuizAnswerCorrect = (question: QuizQuestion, userAnswer?: string) => {
    if (!userAnswer) return false;
    return normalizeAnswer(userAnswer) === normalizeAnswer(question.answer);
  };

  const updateQuizAnswer = (index: number, answer: string) => {
    setQuizAnswers((current) => ({ ...current, [index]: answer }));
  };

  const inputLabel = () => {
    if (activeTab === 'chat') return 'Ask a question';
    if (activeTab === 'explain') return 'Concept to explain';
    if (activeTab === 'quiz') return 'Quiz topic';
    return 'No extra input needed';
  };

  const inputPlaceholder = () => {
    if (activeTab === 'chat') return 'Ask any question about the lecture...';
    if (activeTab === 'explain') return 'Enter a concept like binary search...';
    if (activeTab === 'quiz') return 'Enter topic or leave blank for full lecture...';
    if (activeTab === 'transcript') return 'No extra input needed';
    return '';
  };

  const renderResult = () => {
    if (!result) {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
          Results will appear here after you run a tool.
        </div>
      );
    }

    if (!result.success) {
      return (
        <div className="rounded-2xl border border-red-500/50 bg-red-950/30 p-5 text-red-100">
          {result.error}
        </div>
      );
    }

    switch (activeTab) {
      case 'chat':
        return <TextResult tone="blue" text={result.data?.answer} />;
      case 'summary':
        return <TextResult tone="green" text={result.data?.summary} />;
      case 'explain':
        return <TextResult tone="purple" text={result.data?.explanation} />;
      case 'quiz':
        return renderQuiz();
      case 'revision':
        return (
          <Panel tone="indigo">
            <SectionList title="Quick Notes" items={result.data?.revision?.notes} />
            <SectionList title="Exam Questions" items={result.data?.revision?.examQuestions} numbered />
            <SectionList title="Last-Minute Tips" items={result.data?.revision?.lastMinuteTips} />
          </Panel>
        );
      case 'roadmap':
        return (
          <Panel tone="cyan">
            {result.data?.roadmap?.roadmap?.map((item: any, idx: number) => (
              <div key={idx} className="border-b border-cyan-500/20 py-4 first:pt-0 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-cyan-200">{item.level}</p>
                  <p className="text-xs text-cyan-100/70">{item.timeEstimate}</p>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.topics?.map((topic: string, topicIdx: number) => (
                    <p key={topicIdx} className="rounded-lg bg-slate-950/35 px-3 py-2 text-sm text-slate-200">
                      {topic}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </Panel>
        );
      case 'weakTopics':
        return (
          <Panel tone="rose">
            <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-950/35 p-4">
              <span className="text-sm text-slate-300">Confidence Score</span>
              <span className="text-2xl font-black text-rose-200">
                {result.data?.analysis?.confidenceScore}%
              </span>
            </div>
            <SectionList title="Strong Topics" items={result.data?.analysis?.strongTopics} />
            <SectionList title="Weak Topics" items={result.data?.analysis?.weakTopics} />
            <SectionList title="Recommendations" items={result.data?.analysis?.recommendations} />
          </Panel>
        );
      case 'transcript':
        return transcriptData ? (
          <div className="space-y-4">
            <TranscriptViewer 
              items={transcriptData.items} 
              currentTime={currentTime}
              onSeek={setSeekTime}
              language={transcriptData.language}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
            Loading transcript...
          </div>
        );
      default:
        return null;
    }
  };

  const renderQuiz = () => (
    <Panel tone="yellow">
      {result.data?.quiz?.questions?.map((q: QuizQuestion, idx: number) => {
        const selectedAnswer = quizAnswers[idx];
        const isCorrect = isQuizAnswerCorrect(q, selectedAnswer);
        const options =
          q.options && q.options.length > 0
            ? q.options
            : q.type === 'trueFalse'
              ? ['True', 'False']
              : [];

        return (
          <div key={idx} className="border-b border-yellow-500/20 py-5 first:pt-0 last:border-0">
            <div className="flex flex-col gap-1">
              {q.topic && (
                <p className="text-xs font-bold uppercase tracking-wide text-yellow-300">
                  {q.topic}
                </p>
              )}
              <p className="font-semibold text-white">
                {idx + 1}. {q.question}
              </p>
            </div>

            {options.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {options.map((opt: string, i: number) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-yellow-500/20 bg-slate-950/35 px-3 py-2 text-sm text-yellow-50 transition hover:border-yellow-400/50"
                  >
                    <input
                      type="radio"
                      name={`quiz-question-${idx}`}
                      value={opt}
                      checked={selectedAnswer === opt}
                      onChange={(e) => updateQuizAnswer(idx, e.target.value)}
                      disabled={quizSubmitted}
                      className="mt-1"
                    />
                    <span>
                      {String.fromCharCode(65 + i)}) {opt}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={selectedAnswer || ''}
                onChange={(e) => updateQuizAnswer(idx, e.target.value)}
                disabled={quizSubmitted}
                placeholder="Type your answer..."
                className="mt-3 w-full rounded-xl border border-yellow-500/25 bg-slate-950/45 px-3 py-2 text-white outline-none focus:border-yellow-300"
              />
            )}

            {quizSubmitted && (
              <div
                className={`mt-3 rounded-xl border p-3 ${
                  isCorrect
                    ? 'border-green-500/50 bg-green-950/30 text-green-100'
                    : 'border-red-500/50 bg-red-950/30 text-red-100'
                }`}
              >
                <p className="font-bold">{isCorrect ? 'Correct answer.' : 'Wrong answer.'}</p>
                <p className="mt-1 text-sm">Correct answer: {q.answer}</p>
                {q.explanation && <p className="mt-1 text-sm text-slate-200">{q.explanation}</p>}

                {!isCorrect && q.followUpQuestions && q.followUpQuestions.length > 0 && (
                  <div className="mt-4 rounded-xl border border-yellow-500/30 bg-slate-950/45 p-3">
                    <p className="font-semibold text-yellow-200">
                      Practice 2 more questions on this topic:
                    </p>
                    <div className="mt-3 grid gap-3">
                      {q.followUpQuestions.slice(0, 2).map((followUp, followIdx) => (
                        <div key={followIdx}>
                          <p className="text-sm text-white">
                            {followIdx + 1}. {followUp.question}
                          </p>
                          {followUp.options && followUp.options.length > 0 && (
                            <div className="mt-1 grid gap-1">
                              {followUp.options.map((opt, optIdx) => (
                                <p key={optIdx} className="text-xs text-yellow-100/80">
                                  {String.fromCharCode(65 + optIdx)}) {opt}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {result.data?.quiz?.questions?.length > 0 && !quizSubmitted && (
        <button
          onClick={() => setQuizSubmitted(true)}
          className="mt-4 rounded-xl bg-yellow-400 px-5 py-2 font-bold text-black transition hover:bg-yellow-300"
        >
          Submit Answers
        </button>
      )}
    </Panel>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07071a] text-slate-100">
      <StarBackground />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[236px] shrink-0 border-r border-violet-500/15 bg-[#0b0b22]/95 p-4 lg:flex lg:flex-col">
          <div className="border-b border-violet-500/15 px-2 pb-5">
            <p className="text-xl font-black">
              <span className="text-white">Edu</span>
              <span className="text-violet-300">Genie</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Your AI Study Companion</p>
          </div>

          <nav className="mt-4 space-y-1">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  activeTab === feature.id
                    ? 'bg-gradient-to-r from-violet-700 to-indigo-700 font-bold text-white'
                    : 'text-slate-400 hover:bg-violet-500/10 hover:text-slate-100'
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 text-xs font-black">
                  {feature.icon}
                </span>
                {feature.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Study Session</span>
              <span className="text-violet-300">+</span>
            </div>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-black">12.5</span>
              <span className="pb-1 text-sm text-slate-400">hrs</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-400 to-sky-400" />
            </div>
            <p className="mt-2 text-xs text-slate-500">18 topics completed</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:h-screen lg:px-7">
          <section className="rounded-[1.25rem] border border-violet-500/20 bg-gradient-to-br from-[#0c0c28] via-[#1a0535] to-[#0b1a30] p-5 shadow-2xl shadow-black/30 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">
                  AI lecture workspace
                </p>
                <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                  Turn any YouTube lecture into{' '}
                  <span className="bg-gradient-to-r from-violet-300 to-sky-300 bg-clip-text text-transparent">
                    complete study material
                  </span>
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Paste a lecture link once, then chat, summarize, quiz, revise, and plan from the same dashboard.
                </p>

                <div className="mt-6 overflow-hidden rounded-2xl border-2 border-violet-500/30 bg-white/[0.04] focus-within:border-violet-400 focus-within:shadow-[0_0_32px_rgba(124,58,237,0.25)]">
                  <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200">
                      <span className="h-2 w-3 rounded-sm bg-red-500" />
                      YouTube
                    </div>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerate();
                      }}
                      placeholder="Koi bhi YouTube lecture ka link yahan paste karo..."
                      className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                    {videoUrl && (
                      <button
                        onClick={() => setVideoUrl('')}
                        className="rounded-lg px-2 py-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
                        aria-label="Clear URL"
                      >
                        X
                      </button>
                    )}
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !videoUrl.trim()}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-slate-600"
                    >
                      {loading ? 'Working...' : activeFeature.action}
                    </button>
                  </div>
                  <div className="border-t border-white/5 px-4 py-3 text-xs text-slate-500">
                    Supports Hindi, English, Hinglish, Marathi, Tamil, Telugu, Bengali, and auto-detect.
                  </div>
                  <div className={`h-1 bg-gradient-to-r from-violet-500 to-sky-400 transition-all ${loading ? 'w-4/5' : 'w-0'}`} />
                </div>
              </div>

              <div className="rounded-2xl border border-violet-400/15 bg-white/[0.04] p-5">
                <p className="text-sm font-bold text-white">EduGenie AI</p>
                <div className="mt-4 space-y-4">
                  {[
                    ['Multi-language', 'Learn in your comfort language'],
                    ['Interactive', 'Ask, practice, and improve'],
                    ['Personalized', 'Topic-wise outputs from the lecture'],
                    ['Secure', 'AI processing powered by Vercel'],
                  ].map(([title, desc], idx) => (
                    <div key={title} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-black text-violet-200">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-100">{title}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 ${
                  activeTab === feature.id
                    ? 'border-violet-400/50 bg-violet-500/15'
                    : 'border-violet-500/15 bg-white/[0.03] hover:border-violet-400/35'
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-violet-200">
                  {feature.icon}
                </div>
                <p className="mt-3 font-bold text-white">{feature.label}</p>
                <p className="mt-1 min-h-10 text-xs leading-relaxed text-slate-500">{feature.description}</p>
                <p className="mt-3 text-xs font-bold text-violet-300">Open -&gt;</p>
              </button>
            ))}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[380px_1fr]">
            <div className="rounded-2xl border border-violet-500/15 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                    Current Tool
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">{activeFeature.label}</h2>
                  <p className="mt-1 text-sm text-slate-500">{activeFeature.description}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-lg font-black text-violet-200">
                  {activeFeature.icon}
                </span>
              </div>

              {['chat', 'explain', 'quiz'].includes(activeTab) && (
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-bold text-slate-200">{inputLabel()}</label>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={inputPlaceholder()}
                    className="w-full rounded-xl border border-violet-500/20 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300"
                  />
                </div>
              )}

              {!['chat', 'explain', 'quiz', 'transcript'].includes(activeTab) && (
                <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                  This tool only needs the YouTube lecture URL.
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="mt-5 rounded-xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-sky-200">
                  📺 The video player and real-time transcript will appear below once you generate.
                </div>
              )}

              {videoUrl && (
                <div className="mt-5 rounded-xl border border-green-400/20 bg-green-500/10 p-4 text-sm text-green-200">
                  ✅ Video loaded! Press button to generate content
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !videoUrl.trim()}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-300 px-5 py-3 font-black text-black transition hover:from-yellow-300 hover:to-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Generating...' : activeFeature.action}
              </button>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat value="12.5h" label="Study" color="text-violet-300" />
                <Stat value="18" label="Topics" color="text-sky-300" />
                <Stat value="85" label="Solved" color="text-yellow-300" />
              </div>
            </div>

            <div className="space-y-5">
              {/* Video Player Preview Section */}
              {videoUrl && (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">📺 Video Preview</p>
                    <h2 className="mt-1 text-lg font-black text-white">Now Playing</h2>
                  </div>
                  {(videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) && (
                    <YouTubePlayer
                      videoId={getVideoId(videoUrl)}
                      onTimeUpdate={setCurrentTime}
                      seekTime={seekTime}
                      height="300"
                      width="100%"
                    />
                  )}
                </div>
              )}

              {/* Transcript Section - Always shown for transcript tab */}
              {activeTab === 'transcript' && (
                <div className="rounded-2xl border border-violet-500/15 bg-white/[0.03] p-5">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Transcript</p>
                    <h2 className="mt-1 text-lg font-black text-white">Real-time Transcript with Timestamps</h2>
                  </div>
                  {renderResult()}
                </div>
              )}

              {/* Main Result Section */}
              <div className="min-h-[420px] rounded-2xl border border-violet-500/15 bg-white/[0.03] p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Output</p>
                    <h2 className="mt-1 text-xl font-black text-white">{activeFeature.label} Result</h2>
                  </div>
                  <p className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
                    {loading ? 'AI is working' : 'Ready'}
                  </p>
                </div>
                {renderResult()}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-3">
            <DashboardCard title="Learning Roadmap" action="Use Roadmap" onClick={() => setActiveTab('roadmap')}>
              <div className="flex items-center">
                {['Beginner', 'Intermediate', 'Advanced', 'Mastery'].map((label, idx) => (
                  <div key={label} className="flex flex-1 items-center last:flex-none">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black ${
                        idx === 0
                          ? 'border-green-400 bg-green-400/10 text-green-300'
                          : idx === 1
                            ? 'border-violet-300 bg-violet-400/10 text-violet-200'
                            : 'border-white/10 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < 3 && <div className={`h-0.5 flex-1 ${idx === 0 ? 'bg-green-400' : 'bg-white/10'}`} />}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-slate-950/35 p-4">
                <p className="text-xs text-slate-500">Current Focus</p>
                <p className="mt-1 font-bold text-white">Lecture fundamentals</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-violet-400 to-sky-400" />
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Weak Topics" action="Analyze" onClick={() => setActiveTab('weakTopics')}>
              {[
                ['Trees', 40, 'bg-red-400'],
                ['Graph Theory', 35, 'bg-orange-400'],
                ['Dynamic Programming', 60, 'bg-yellow-300'],
                ['Recursion', 80, 'bg-green-400'],
              ].map(([name, score, color]) => (
                <div key={name as string} className="mb-3 last:mb-0">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-300">{name}</span>
                    <span className="font-bold text-slate-100">{score}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </DashboardCard>

            <DashboardCard title="Study Stats" action="Practice Quiz" onClick={() => setActiveTab('quiz')}>
              <div className="grid grid-cols-3 gap-2">
                <Stat value="72%" label="Avg Score" color="text-green-300" />
                <Stat value="7" label="Days" color="text-violet-300" />
                <Stat value="5" label="Tools" color="text-sky-300" />
              </div>
              <svg className="mt-5 h-20 w-full" viewBox="0 0 260 80" preserveAspectRatio="none">
                <path d="M10,58 L47,64 L84,45 L121,52 L158,28 L195,36 L232,12" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {[10, 47, 84, 121, 158, 195, 232].map((x, idx) => (
                  <circle key={x} cx={x} cy={[58, 64, 45, 52, 28, 36, 12][idx]} r="4" fill="#a78bfa" />
                ))}
              </svg>
            </DashboardCard>
          </section>
        </main>
      </div>
    </div>
  );
}

function Panel({
  tone,
  children,
}: {
  tone: 'blue' | 'green' | 'purple' | 'yellow' | 'indigo' | 'cyan' | 'rose';
  children: React.ReactNode;
}) {
  const classes = {
    blue: 'border-blue-500/30 bg-blue-950/25',
    green: 'border-green-500/30 bg-green-950/25',
    purple: 'border-purple-500/30 bg-purple-950/25',
    yellow: 'border-yellow-500/30 bg-yellow-950/25',
    indigo: 'border-indigo-500/30 bg-indigo-950/25',
    cyan: 'border-cyan-500/30 bg-cyan-950/25',
    rose: 'border-rose-500/30 bg-rose-950/25',
  };

  return <div className={`rounded-2xl border p-5 ${classes[tone]}`}>{children}</div>;
}

function TextResult({ text, tone }: { text?: string; tone: 'blue' | 'green' | 'purple' }) {
  return (
    <Panel tone={tone}>
      <p className="whitespace-pre-wrap leading-relaxed text-slate-100">{text}</p>
    </Panel>
  );
}

function SectionList({
  title,
  items,
  numbered = false,
}: {
  title: string;
  items?: string[];
  numbered?: boolean;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-3 font-black text-white">{title}</h3>
      <div className="grid gap-2">
        {items.map((item, idx) => (
          <p key={idx} className="rounded-xl bg-slate-950/35 px-3 py-2 text-sm text-slate-200">
            {numbered ? `${idx + 1}. ` : ''}
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3 text-center">
      <p className={`text-lg font-black ${color}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function DashboardCard({
  title,
  action,
  onClick,
  children,
}: {
  title: string;
  action: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-violet-500/15 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-black text-white">{title}</h3>
        <button onClick={onClick} className="text-xs font-bold text-violet-300 hover:text-violet-200">
          {action}
        </button>
      </div>
      {children}
    </div>
  );
}
