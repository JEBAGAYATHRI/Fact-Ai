// Firebase setup for Fact-AI real authentication.
// This config is safe to be public - Firebase protects your data
// through separate security rules, not by hiding this file.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuJMZvopKCYXxzRok177VnriAvRUeo-FI",
  authDomain: "fact-ai-99f14.firebaseapp.com",
  projectId: "fact-ai-99f14",
  storageBucket: "fact-ai-99f14.firebasestorage.app",
  messagingSenderId: "988299051287",
  appId: "1:988299051287:web:41abeb7c6cfb8434a3b752",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();