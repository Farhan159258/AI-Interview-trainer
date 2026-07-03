// Personalized Learning Coach — skill gap analysis + 7-day improvement plan.
import { chatJSON } from './openai';
import type { Interview, LearningPlan } from '@/types';

export async function generateLearningPlan(
  userId: string,
  recentInterviews: Interview[]
): Promise<LearningPlan> {
  const weakSignals = recentInterviews
    .flatMap((i) => i.answers)
    .filter((a) => (a.evaluation?.score ?? 10) < 6)
    .map((a) => a.evaluation?.missingConcepts ?? [])
    .flat();

  const summary = recentInterviews
    .map(
      (i) =>
        `Role: ${i.config.role}, Type: ${i.config.type}, Avg Score: ${
          i.report?.overallScore ?? 'N/A'
        }, Weak concepts: ${(i.answers.flatMap((a) => a.evaluation?.missingConcepts ?? []).join(', ')) || 'none noted'}`
    )
    .join('\n');

  const result = await chatJSON<{
    skillGaps: string[];
    weakTopics: string[];
    recommendations: string[];
    practiceQuestions: string[];
    sevenDayPlan: { day: number; focus: string; tasks: string[] }[];
  }>({
    system: `You are a career coach for software engineers preparing for interviews. You build
concrete, actionable improvement plans grounded in the candidate's actual weak spots.
Respond with strict JSON only.`,
    user: `Recent interview performance summary:
${summary || 'No interviews yet — provide a general starter plan for interview readiness.'}

Recurring missing concepts: ${weakSignals.join(', ') || 'none identified yet'}

Return JSON exactly matching:
{
  "skillGaps": string[],
  "weakTopics": string[],
  "recommendations": string[] (5-8 actionable items),
  "practiceQuestions": string[] (5-8 questions targeting the weak topics),
  "sevenDayPlan": [{ "day": number (1-7), "focus": string, "tasks": string[] (2-4 tasks) }]
}`,
    temperature: 0.6,
  });

  return {
    id: `plan_${userId}_${Date.now()}`,
    userId,
    skillGaps: result.skillGaps ?? [],
    weakTopics: result.weakTopics ?? [],
    recommendations: result.recommendations ?? [],
    practiceQuestions: result.practiceQuestions ?? [],
    sevenDayPlan: result.sevenDayPlan ?? [],
    createdAt: new Date().toISOString(),
  };
}
