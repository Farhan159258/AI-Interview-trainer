// Scores candidate answers and generates the final interview report.
import { chatJSON } from './openai';
import type {
  AnswerEvaluation,
  Interview,
  InterviewReport,
  CodeReview,
  CodingLanguage,
} from '@/types';

const EVALUATOR_SYSTEM_PROMPT = `You are an expert technical interviewer and evaluator. You assess
candidate answers with the same rigor as a FAANG-style hiring panel: fair, specific, and
constructive. Always respond with strict JSON, no markdown fences, no commentary.`;

export async function evaluateAnswer(
  question: string,
  answer: string,
  role: string,
  difficulty: string
): Promise<AnswerEvaluation> {
  const result = await chatJSON<AnswerEvaluation>({
    system: EVALUATOR_SYSTEM_PROMPT,
    user: `Role: ${role} (${difficulty} level)
Question: "${question}"
Candidate's answer: "${answer}"

Evaluate this answer. Return JSON exactly matching:
{
  "score": number (1-10),
  "strengths": string[],
  "weaknesses": string[],
  "missingConcepts": string[],
  "suggestedImprovements": string[],
  "sampleAnswer": string (a strong model answer, 3-5 sentences)
}
Be specific — reference concrete parts of the candidate's answer, not generic praise.`,
    temperature: 0.4,
  });

  return {
    score: Math.max(1, Math.min(10, Math.round(result.score))),
    strengths: result.strengths ?? [],
    weaknesses: result.weaknesses ?? [],
    missingConcepts: result.missingConcepts ?? [],
    suggestedImprovements: result.suggestedImprovements ?? [],
    sampleAnswer: result.sampleAnswer ?? '',
  };
}

export async function generateInterviewReport(interview: Interview): Promise<InterviewReport> {
  const transcript = interview.answers
    .map((a, i) => {
      const q = interview.questions.find((q) => q.id === a.questionId);
      return `Q${i + 1}: ${q?.text ?? 'Unknown'}\nA${i + 1}: ${a.transcript}\nScore: ${a.evaluation?.score ?? 'N/A'}/10`;
    })
    .join('\n\n');

  const result = await chatJSON<{
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    problemSolvingScore: number;
    candidateSummary: string;
    strengths: string[];
    weaknesses: string[];
    hiringRecommendation: string;
  }>({
    system: `You are a senior recruiter writing a professional, honest post-interview assessment.
Respond with strict JSON only.`,
    user: `Interview for role: ${interview.config.role} (${interview.config.difficulty}, ${interview.config.type})

Transcript and per-answer scores:
${transcript}

Return JSON exactly matching:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "confidenceScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "candidateSummary": string (3-4 sentences, professional recruiter tone),
  "strengths": string[],
  "weaknesses": string[],
  "hiringRecommendation": "Strong Hire" | "Hire" | "Leaning Hire" | "No Hire"
}`,
    temperature: 0.5,
  });

  return {
    id: `report_${interview.id}`,
    interviewId: interview.id,
    userId: interview.userId,
    overallScore: Number.isFinite(result.overallScore) ? result.overallScore : 0,
    technicalScore: Number.isFinite(result.technicalScore) ? result.technicalScore : 0,
    communicationScore: Number.isFinite(result.communicationScore) ? result.communicationScore : 0,
    confidenceScore: Number.isFinite(result.confidenceScore) ? result.confidenceScore : 0,
    problemSolvingScore: Number.isFinite(result.problemSolvingScore) ? result.problemSolvingScore : 0,
    candidateSummary: result.candidateSummary ?? '',
    strengths: result.strengths ?? [],
    weaknesses: result.weaknesses ?? [],
    hiringRecommendation: (result.hiringRecommendation as InterviewReport['hiringRecommendation']) ?? 'Leaning Hire',
    createdAt: new Date().toISOString(),
  };
}

export async function reviewCode(
  challengeDescription: string,
  language: CodingLanguage,
  code: string
): Promise<CodeReview> {
  const result = await chatJSON<CodeReview>({
    system: `You are a principal engineer conducting a code review during a live coding
interview. You assess correctness, efficiency and readability, and give complexity analysis.
Respond with strict JSON only.`,
    user: `Challenge: ${challengeDescription}
Language: ${language}
Candidate's code:
\`\`\`${language}
${code}
\`\`\`

Return JSON exactly matching:
{
  "correctnessScore": number (1-10),
  "efficiencyScore": number (1-10),
  "readabilityScore": number (1-10),
  "timeComplexity": string (e.g. "O(n log n)"),
  "spaceComplexity": string (e.g. "O(n)"),
  "optimizationSuggestions": string[],
  "alternativeSolutions": string[] (brief descriptions of 1-2 alternative approaches),
  "overallFeedback": string (2-3 sentences)
}`,
    temperature: 0.3,
  });

  return result;
}