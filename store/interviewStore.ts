import { create } from 'zustand';
import type { Interview, InterviewQuestion, InterviewConfig } from '@/types';

interface InterviewState {
  activeInterview: Interview | null;
  currentQuestionIndex: number;
  config: InterviewConfig | null;
  isSubmitting: boolean;
  setActiveInterview: (interview: Interview | null) => void;
  setConfig: (config: InterviewConfig) => void;
  nextQuestion: () => void;
  addFollowUp: (question: InterviewQuestion) => void;
  recordAnswer: (questionId: string, transcript: string) => void;
  setSubmitting: (v: boolean) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  activeInterview: null,
  currentQuestionIndex: 0,
  config: null,
  isSubmitting: false,
  setActiveInterview: (activeInterview) => set({ activeInterview, currentQuestionIndex: 0 }),
  setConfig: (config) => set({ config }),
  nextQuestion: () => set({ currentQuestionIndex: get().currentQuestionIndex + 1 }),
  addFollowUp: (question) => {
    const interview = get().activeInterview;
    if (!interview) return;
    set({
      activeInterview: { ...interview, questions: [...interview.questions, question] },
    });
  },
  recordAnswer: (questionId, transcript) => {
    const interview = get().activeInterview;
    if (!interview) return;
    set({
      activeInterview: {
        ...interview,
        answers: [
          ...interview.answers,
          { questionId, transcript, submittedAt: new Date().toISOString() },
        ],
      },
    });
  },
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () => set({ activeInterview: null, currentQuestionIndex: 0, config: null, isSubmitting: false }),
}));
