'use client';

import { useAuthListener } from '@/hooks/useAuth';

// Mounted once at the root layout. Subscribes to Firebase auth state and
// syncs it into the Zustand auth store for the whole app to consume.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}
