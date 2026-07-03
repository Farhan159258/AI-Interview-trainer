// ============================================================================
// AI Interview Trainer — Shared Types
// ============================================================================

export type JobRole =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'AI Engineer'
  | 'Cloud Engineer'
  | 'DevOps Engineer'
  | 'Custom Role';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Mixed';

export type InterviewMode = 'text' | 'voice' | 'coding';

export type InterviewStatus = 'in_progress' | 'completed' | 'abandoned';

export type CodingLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  targetRole?: JobRole;
  yearsOfExperience?: number;
  xp: number;
  level: number;
  streakCount: number;
  lastActiveDate?: string;
  achievements: string[]; // achievement ids
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export interface ParsedResume {
  id: string;
  userId: string;
  fileName: string;
  rawText: string;
  skills: string[];
  technologies: string[];
  projects: ResumeProject[];
  experience: ResumeExperience[];
  education: string[];
  summary: string;
  createdAt: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface ResumeExperience {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

// ---------------------------------------------------------------------------
// Interview
// ---------------------------------------------------------------------------

export interface InterviewConfig {
  role: JobRole;
  customRoleTitle?: string;
  difficulty: Difficulty;
  type: InterviewType;
  mode: InterviewMode;
  questionCount: number;
  resumeId?: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'hr' | 'coding';
  topic?: string;
  isFollowUp?: boolean;
  parentQuestionId?: string;
}

export interface InterviewAnswer {
  questionId: string;
  transcript: string;
  audioUrl?: string;
  submittedAt: string;
  evaluation?: AnswerEvaluation;
}

export interface AnswerEvaluation {
  score: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  suggestedImprovements: string[];
  sampleAnswer: string;
}

export interface Interview {
  id: string;
  userId: string;
  config: InterviewConfig;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  status: InterviewStatus;
  createdAt: string;
  completedAt?: string;
  report?: InterviewReport;
}

// ---------------------------------------------------------------------------
// Coding Interview
// ---------------------------------------------------------------------------

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  topic: string; // e.g. "Arrays", "Dynamic Programming"
  starterCode: Record<CodingLanguage, string>;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  timeLimitMinutes: number;
}

export interface CodingSubmission {
  id: string;
  userId: string;
  challengeId: string;
  language: CodingLanguage;
  code: string;
  submittedAt: string;
  review?: CodeReview;
}

export interface CodeReview {
  correctnessScore: number; // 1-10
  efficiencyScore: number; // 1-10
  readabilityScore: number; // 1-10
  timeComplexity: string;
  spaceComplexity: string;
  optimizationSuggestions: string[];
  alternativeSolutions: string[];
  overallFeedback: string;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface InterviewReport {
  id: string;
  interviewId: string;
  userId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  candidateSummary: string;
  strengths: string[];
  weaknesses: string[];
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'No Hire';
  createdAt: string;
}

export interface LearningPlan {
  id: string;
  userId: string;
  skillGaps: string[];
  weakTopics: string[];
  recommendations: string[];
  practiceQuestions: string[];
  sevenDayPlan: { day: number; focus: string; tasks: string[] }[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Analytics / Gamification
// ---------------------------------------------------------------------------

export interface AnalyticsSnapshot {
  userId: string;
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  streak: number;
  weakAreas: string[];
  strongAreas: string[];
  performanceTrend: { date: string; score: number }[];
  topicBreakdown: { topic: string; score: number }[];
  codingPerformance: { date: string; correctness: number; efficiency: number }[];
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  criteria: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}
