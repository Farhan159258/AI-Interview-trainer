// Firebase Admin SDK — server-only (API routes). Never import this in Client Components.
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Add your Firebase service account JSON to .env.local'
    );
  }
  // Support both raw JSON and base64-encoded JSON
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
  }
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];
  const serviceAccount = loadServiceAccount();
  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
// Without this, the Admin SDK throws "Cannot use 'undefined' as a Firestore
// value" for any optional field left unset (e.g. a report field the model
// happened to omit) — same class of bug as the client-side stripUndefined
// fix in firebase/firestore.ts, just needed here too since Admin SDK writes
// go through a different code path.
adminDb.settings({ ignoreUndefinedProperties: true });

/**
 * Verifies the Firebase ID token sent from the client in the
 * `Authorization: Bearer <token>` header. Throws if invalid/expired.
 */
export async function verifyIdToken(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header');
  }
  const token = authorizationHeader.slice('Bearer '.length);
  return adminAuth.verifyIdToken(token);
}