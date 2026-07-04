'use client';

import { useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/firebase/client';
import { getUserProfile, upsertUserProfile } from '@/firebase/firestore';
import { useAuthStore } from '@/store/authStore';

export function useAuthListener() {
  const { setUser, setFirebaseUid, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          setFirebaseUid(firebaseUser.uid);
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            const now = new Date().toISOString();
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Candidate',
              photoURL: firebaseUser.photoURL ?? undefined,
              createdAt: now,
              updatedAt: now,
              xp: 0,
              level: 1,
              streakCount: 0,
              achievements: [],
            };
            await upsertUserProfile(firebaseUser.uid, profile);
          }
          setUser(profile);
        } else {
          setFirebaseUid(null);
          setUser(null);
        }
      } catch (err) {
        // Without this catch, a Firestore error here (e.g. security rules
        // not deployed yet, so every read/write is denied) would throw
        // inside this callback and `setLoading(false)` below would never
        // run — leaving every protected page stuck on its loading spinner
        // forever with no visible error. Log it loudly instead.
        console.error('[Auth] failed to load/create user profile:', err);
        setFirebaseUid(firebaseUser?.uid ?? null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [setUser, setFirebaseUid, setLoading]);
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

/** Returns a fresh Firebase ID token to attach to API requests. */
export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}