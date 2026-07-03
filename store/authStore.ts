import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  firebaseUid: string | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setFirebaseUid: (uid: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUid: null,
  loading: true,
  setUser: (user) => set({ user }),
  setFirebaseUid: (firebaseUid) => set({ firebaseUid }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, firebaseUid: null, loading: false }),
}));
