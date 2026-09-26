import { FirebaseError, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseSetupMessage =
  "Firebase is not configured. Add the Firebase web app values to .env.local and enable Email/Password and Google sign-in in Firebase Console.";

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

export const firebaseAuth = isFirebaseConfigured
  ? getAuth(
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig),
    )
  : null;

export const firebaseDb = isFirebaseConfigured
  ? getFirestore(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

const authErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/user-not-found": "No account was found for that email address.",
  "auth/wrong-password": "The email or password is incorrect.",
  "auth/email-already-in-use": "An account already exists with this email.",
  "auth/weak-password": "Choose a stronger password with at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/network-request-failed": "Check your internet connection and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Another sign-in window is already open.",
  "auth/popup-blocked": "Allow pop-ups for this site, then try Google sign-in again.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled in Firebase Authentication.",
  "auth/unauthorized-domain":
    "This domain is not authorized for Firebase sign-in. Add it in Firebase Console.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email. Sign in using its original method.",
};

export function getFirebaseAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return (
      authErrorMessages[error.code] ??
      "We could not complete sign-in. Please try again."
    );
  }

  return "We could not complete sign-in. Please try again.";
}