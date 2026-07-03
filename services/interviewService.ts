// Generates interview questions and follow-ups via OpenAI, grounded in
// the candidate's resume when available.
import { chatJSON } from './openai';
import type { InterviewConfig, InterviewQuestion, ParsedResume } from '@/types';

const QUESTION_SYSTEM_PROMPT = `You are a senior technical recruiter and interview panel lead with 15 years
of experience hiring software engineers and data professionals. You design realistic,
role-specific interview questions calibrated to a candidate's stated experience level.
Always respond with strict JSON matching the requested schema. Never include markdown
fences or commentary outside the JSON object.`;

export async function generateInterviewQuestions(
  config: InterviewConfig,
  resume?: ParsedResume | null
): Promise<InterviewQuestion[]> {
  const roleLabel = config.role === 'Custom Role' ? config.customRoleTitle ?? 'Software Engineer' : config.role;

  const resumeContext = resume
    ? `Candidate resume context:
Skills: ${resume.skills.join(', ') || 'N/A'}
Technologies: ${resume.technologies.join(', ') || 'N/A'}
Projects: ${resume.projects.map((p) => `${p.name} (${p.technologies.join(', ')}): ${p.description}`).join(' | ') || 'N/A'}
Experience: ${resume.experience.map((e) => `${e.role} at ${e.company} (${e.duration})`).join(' | ') || 'N/A'}
Use this context to generate targeted, personalized technical and project-specific questions
that reference the candidate's actual stack and projects where relevant.`
    : 'No resume was uploaded. Generate general role-appropriate questions.';

  const userPrompt = `Generate ${config.questionCount} interview questions for a ${config.difficulty} level
${roleLabel} candidate. Interview type: ${config.type} (technical/behavioral/HR mix as implied by type).

${resumeContext}

Return JSON of the shape:
{
  "questions": [
    { "text": string, "category": "technical" | "behavioral" | "hr" | "coding", "topic": string }
  ]
}
Rules:
- If type is "Technical", most questions are technical/coding-concept questions.
- If type is "HR", focus on motivation, culture fit, career goals.
- If type is "Behavioral", use STAR-style prompts about past experiences.
- If type is "Mixed", blend all three roughly evenly.
- Questions should escalate in specificity — start broad, get more scenario-based.
- Keep each question under 40 words.`;

  const result = await chatJSON<{ questions: { text: string; category: string; topic?: string }[] }>({
    system: QUESTION_SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.8,
  });

  return result.questions.map((q, i) => ({
    id: `q_${Date.now()}_${i}`,
    text: q.text,
    category: (q.category as InterviewQuestion['category']) ?? 'technical',
    topic: q.topic,
  }));
}

export async function generateFollowUpQuestion(
  originalQuestion: string,
  candidateAnswer: string
): Promise<InterviewQuestion | null> {
  const result = await chatJSON<{ shouldFollowUp: boolean; question?: string; topic?: string }>({
    system: QUESTION_SYSTEM_PROMPT,
    user: `Original question: "${originalQuestion}"
Candidate answer: "${candidateAnswer}"

Decide if a natural, probing follow-up question is warranted (e.g. the answer was vague,
mentioned something worth digging into, or a real interviewer would naturally ask "why" or
"how" next). Return JSON: { "shouldFollowUp": boolean, "question": string | null, "topic": string | null }.
Only follow up if it adds real value — do not force one for every answer.`,
    temperature: 0.7,
  });

  if (!result.shouldFollowUp || !result.question) return null;

  return {
    id: `fq_${Date.now()}`,
    text: result.question,
    category: 'technical',
    topic: result.topic,
    isFollowUp: true,
  };
}
