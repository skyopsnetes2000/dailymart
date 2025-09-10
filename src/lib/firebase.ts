import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-4696204822-f7627",
  appId: "1:583413617194:web:49d9a4f66470e78db06953",
  storageBucket: "studio-4696204822-f7627.firebasestorage.app",
  apiKey: "AIzaSyDoZfUoaYCVOmYx2qVNzS6fHyvQbS7vMbk",
  authDomain: "studio-4696204822-f7627.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "583413617194"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
