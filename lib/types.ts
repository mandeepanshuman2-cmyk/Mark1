export interface QuizQuestion {
  type?: 'mcq' | 'trueFalse';
  question: string;
  topic?: string;
  options?: string[];
  answer: string;
  explanation?: string;
  followUpQuestions?: QuizQuestion[];
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface RoadmapItem {
  level: string;
  topics: string[];
  timeEstimate: string;
  resources?: string[];
}

export interface RoadmapResponse {
  roadmap: RoadmapItem[];
}

export interface WeakTopicResponse {
  strongTopics: string[];
  weakTopics: string[];
  confidenceScore: number;
  recommendations: string[];
}

export interface RevisionResponse {
  notes: string[];
  examQuestions: string[];
  lastMinuteTips: string[];
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}
