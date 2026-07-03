// Extracts raw text from an uploaded PDF resume, then uses OpenAI to
// structure it into skills, projects, experience, etc.
import { chatJSON } from './openai';
import type { ParsedResume, ResumeProject, ResumeExperience } from '@/types';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf-parse is CommonJS; dynamic import keeps it out of the client bundle.
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function structureResume(
  rawText: string,
  userId: string,
  fileName: string
): Promise<ParsedResume> {
  const result = await chatJSON<{
    skills: string[];
    technologies: string[];
    projects: ResumeProject[];
    experience: ResumeExperience[];
    education: string[];
    summary: string;
  }>({
    system: `You extract structured data from resumes for a technical recruiting platform.
Respond with strict JSON only, no commentary.`,
    user: `Resume text:
"""
${rawText.slice(0, 12000)}
"""

Return JSON exactly matching:
{
  "skills": string[] (soft + hard skills, deduplicated),
  "technologies": string[] (languages, frameworks, tools, platforms only),
  "projects": [{ "name": string, "description": string, "technologies": string[] }],
  "experience": [{ "company": string, "role": string, "duration": string, "highlights": string[] }],
  "education": string[],
  "summary": string (2-3 sentence professional summary of the candidate)
}`,
    temperature: 0.2,
  });

  return {
    id: `resume_${userId}_${Date.now()}`,
    userId,
    fileName,
    rawText,
    skills: result.skills ?? [],
    technologies: result.technologies ?? [],
    projects: result.projects ?? [],
    experience: result.experience ?? [],
    education: result.education ?? [],
    summary: result.summary ?? '',
    createdAt: new Date().toISOString(),
  };
}
