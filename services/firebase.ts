import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Fix for TypeScript "Cannot find name 'process'" error
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Check if critical keys are present
export const isCloudEnabled = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let db: any = null;

if (isCloudEnabled) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized: Cloud Sync Active");
  } catch (error) {
    console.error("Firebase init failed:", error);
    // Fallback to local if init fails
  }
} else {
  console.log("Firebase keys missing: Running in Local Mode (No Sync)");
}

export { db };