/**
 * Firebase Admin SDK — server-only. Used by the admin panel to read the
 * `applications` collection, which client-side rules deny access to.
 *
 * Credentials come from a service account (server secret), NOT the public web
 * config. Set the three FIREBASE_ADMIN_* env vars (see FIREBASE_SETUP.md).
 * Everything is lazy so a missing service account never breaks the build.
 */
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// Vercel stores the key with literal "\n"; turn them back into real newlines.
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isAdminDbConfigured = Boolean(
  projectId && clientEmail && privateKey,
);

let db: Firestore | null = null;

export function getAdminDb(): Firestore | null {
  if (!isAdminDbConfigured) return null;
  if (!db) {
    const app: App = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    db = getFirestore(app);
  }
  return db;
}
