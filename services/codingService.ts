// Generates coding interview challenges via OpenAI.
import { chatJSON } from './openai';
import type { CodingChallenge, Difficulty, JobRole } from '@/types';

const STARTER_TEMPLATES: Record<string, string> = {
  javascript: '/**\n * Write your solution below.\n */\nfunction solve(input) {\n  \n}\n',
  typescript: '/**\n * Write your solution below.\n */\nfunction solve(input: unknown): unknown {\n  \n}\n',
  python: 'def solve(input):\n    """Write your solution below."""\n    pass\n',
  java: 'class Solution {\n    public Object solve(Object input) {\n        return null;\n    }\n}\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution below.\n};\n',
};

export async function generateCodingChallenge(
  role: JobRole,
  difficulty: Difficulty
): Promise<CodingChallenge> {
  const result = await chatJSON<{
    title: string;
    description: string;
    topic: string;
    examples: { input: string; output: string; explanation?: string }[];
    constraints: string[];
  }>({
    system: `You design realistic data-structures-and-algorithms coding interview questions
appropriate for a ${role} candidate. Respond with strict JSON only.`,
    user: `Generate one ${difficulty} level coding interview challenge appropriate for a ${role} role.
Return JSON exactly matching:
{
  "title": string,
  "description": string (clear problem statement, 3-6 sentences),
  "topic": string (e.g. "Arrays", "Dynamic Programming", "Graphs"),
  "examples": [{ "input": string, "output": string, "explanation": string }] (1-3 examples),
  "constraints": string[] (2-5 constraints)
}`,
    temperature: 0.8,
  });

  return {
    id: `challenge_${Date.now()}`,
    title: result.title,
    description: result.description,
    difficulty,
    topic: result.topic,
    starterCode: {
      javascript: STARTER_TEMPLATES.javascript,
      typescript: STARTER_TEMPLATES.typescript,
      python: STARTER_TEMPLATES.python,
      java: STARTER_TEMPLATES.java,
      cpp: STARTER_TEMPLATES.cpp,
    },
    examples: result.examples ?? [],
    constraints: result.constraints ?? [],
    timeLimitMinutes: difficulty === 'Beginner' ? 20 : difficulty === 'Intermediate' ? 30 : 45,
  };
}
