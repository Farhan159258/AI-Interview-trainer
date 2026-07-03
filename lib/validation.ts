// Zod schemas for validating and sanitizing all API request bodies.
import { z } from 'zod';

export const interviewConfigSchema = z.object({
  role: z.enum([
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Scientist',
    'AI Engineer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Custom Role',
  ]),
  customRoleTitle: z.string().max(80).optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  type: z.enum(['Technical', 'HR', 'Behavioral', 'Mixed']),
  mode: z.enum(['text', 'voice', 'coding']),
  questionCount: z.number().int().min(5).max(15),
  resumeId: z.string().optional(),
});

export const evaluateAnswerSchema = z.object({
  interviewId: z.string().min(1),
  questionId: z.string().min(1),
  question: z.string().min(1).max(2000),
  answer: z.string().min(1).max(8000),
  role: z.string().min(1).max(80),
  difficulty: z.string().min(1).max(40),
});

export const generateQuestionsSchema = z.object({
  config: interviewConfigSchema,
  resumeId: z.string().optional(),
});

export const codeReviewSchema = z.object({
  challengeDescription: z.string().min(1).max(4000),
  language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp']),
  code: z.string().min(1).max(20000),
});

// Basic sanitization: strips control characters and excess whitespace from
// free-text fields before they're sent to the model or stored.
export function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}
