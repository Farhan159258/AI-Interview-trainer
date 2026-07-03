// Typed Firestore client helpers (browser side) for common CRUD operations.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './client';
import type {
  UserProfile,
  ParsedResume,
  Interview,
  CodingSubmission,
  InterviewReport,
  AnalyticsSnapshot,
} from '@/types';

// ---- Collection names (single source of truth) ----
export const COLLECTIONS = {
  users: 'users',
  resumes: 'resumes',
  interviews: 'interviews',
  codingInterviews: 'coding_interviews',
  analytics: 'analytics',
  achievements: 'achievements',
  reports: 'reports',
} as const;

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function upsertUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function saveResume(resume: ParsedResume) {
  await setDoc(doc(db, COLLECTIONS.resumes, resume.id), resume);
}

export async function getUserResumes(userId: string): Promise<ParsedResume[]> {
  const q = query(
    collection(db, COLLECTIONS.resumes),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ParsedResume);
}

export async function createInterview(interview: Interview) {
  await setDoc(doc(db, COLLECTIONS.interviews, interview.id), interview);
  return interview;
}

export async function updateInterview(id: string, data: Partial<Interview>) {
  await updateDoc(doc(db, COLLECTIONS.interviews, id), data as Record<string, unknown>);
}

export async function getInterview(id: string): Promise<Interview | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.interviews, id));
  return snap.exists() ? (snap.data() as Interview) : null;
}

export async function getUserInterviews(userId: string, take = 50): Promise<Interview[]> {
  const q = query(
    collection(db, COLLECTIONS.interviews),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    fbLimit(take)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Interview);
}

export async function deleteInterview(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.interviews, id));
}

export async function saveCodingSubmission(sub: CodingSubmission) {
  await setDoc(doc(db, COLLECTIONS.codingInterviews, sub.id), sub);
}

export async function saveReport(report: InterviewReport) {
  await setDoc(doc(db, COLLECTIONS.reports, report.id), report);
}

export async function getAnalytics(userId: string): Promise<AnalyticsSnapshot | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.analytics, userId));
  return snap.exists() ? (snap.data() as AnalyticsSnapshot) : null;
}

export async function upsertAnalytics(userId: string, data: Partial<AnalyticsSnapshot>) {
  await setDoc(
    doc(db, COLLECTIONS.analytics, userId),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export { serverTimestamp, Timestamp };
