/**
 * Firebase (Firestore) client setup for storing application submissions.
 *
 * Config comes from NEXT_PUBLIC_FIREBASE_* env vars — these are the public web
 * app keys, safe to expose in the browser. Access is gated by Firestore
 * security rules (see FIREBASE_SETUP.md), NOT by keeping these secret.
 *
 * Everything initialises lazily and only in the browser, so a missing config
 * never breaks the build or SSR — `isFirebaseConfigured` lets the UI degrade
 * gracefully until the values are filled in.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

/** Returns a Firestore instance, or null if config isn't set yet. */
export function getDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (!firestore) firestore = getFirestore(app);
  return firestore;
}

/** Firestore collection that application submissions are written to. */
export const APPLICATIONS_COLLECTION = "applications";
