// Seeds the `achievements` catalog and, optionally, sample interview data
// for local development. Run with: npx tsx scripts/seed.ts
//
// Requires FIREBASE_SERVICE_ACCOUNT_KEY to be set in your environment.
import { adminDb } from '../firebase/admin';
import type { Achievement, Interview } from '../types';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_interview',
    title: 'First Interview',
    description: 'Complete your first mock interview.',
    icon: '🎯',
    xpReward: 50,
    criteria: 'totalInterviews >= 1',
  },
  {
    id: 'five_day_streak',
    title: '5-Day Streak',
    description: 'Practice for 5 days in a row.',
    icon: '🔥',
    xpReward: 150,
    criteria: 'streakCount >= 5',
  },
  {
    id: 'top_performer',
    title: 'Top Performer',
    description: 'Score 90 or above on an interview report.',
    icon: '🏆',
    xpReward: 200,
    criteria: 'bestScore >= 90',
  },
  {
    id: 'coding_expert',
    title: 'Coding Expert',
    description: 'Score 9 or above on correctness in 5 coding reviews.',
    icon: '💻',
    xpReward: 200,
    criteria: 'highScoringCodingSubmissions >= 5',
  },
];

const SAMPLE_INTERVIEW: Interview = {
  id: 'sample_interview_001',
  userId: 'sample_user',
  config: {
    role: 'Full Stack Developer',
    difficulty: 'Intermediate',
    type: 'Mixed',
    mode: 'text',
    questionCount: 3,
  },
  questions: [
    { id: 'q1', text: 'Walk me through how you structure state in a Next.js app.', category: 'technical', topic: 'Frontend architecture' },
    { id: 'q2', text: 'Tell me about a time you disagreed with a teammate on a technical decision.', category: 'behavioral' },
    { id: 'q3', text: 'How would you design rate limiting for a public API?', category: 'technical', topic: 'System design' },
  ],
  answers: [],
  status: 'completed',
  createdAt: new Date().toISOString(),
};

async function seed() {
  console.log('Seeding achievements catalog…');
  await Promise.all(ACHIEVEMENTS.map((a) => adminDb.collection('achievements').doc(a.id).set(a)));

  console.log('Seeding one sample interview…');
  await adminDb.collection('interviews').doc(SAMPLE_INTERVIEW.id).set(SAMPLE_INTERVIEW);

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
