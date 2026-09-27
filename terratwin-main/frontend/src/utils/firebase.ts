import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCO3TS_hCTnIr8WPAbTtr0x89Bbs0Rtz7s",
  authDomain: "terra-twin-9f022.firebaseapp.com",
  projectId: "terra-twin-9f022",
  storageBucket: "terra-twin-9f022.firebasestorage.app",
  messagingSenderId: "1035630806288",
  appId: "1:1035630806288:web:d4a307573bffa07ea95195",
  measurementId: "G-Z5TD2BEB67"
};

// Initialize Firebase (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let analytics: Analytics | undefined = undefined;

// Safe client-side analytics initialization
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
