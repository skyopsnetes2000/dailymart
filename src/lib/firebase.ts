
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDoZfUoaYCVOmYx2qVNzS6fHyvQbS7vMbk",
  authDomain: "studio-4696204822-f7627.firebaseapp.com",
  databaseURL: "https://studio-4696204822-f7627-default-rtdb.firebaseio.com",
  projectId: "studio-4696204822-f7627",
  storageBucket: "studio-4696204822-f7627.appspot.com",
  messagingSenderId: "583413617194",
  appId: "1:583413617194:web:49d9a4f66470e78db06953",
  measurementId: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
