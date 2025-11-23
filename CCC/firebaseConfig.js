import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_GPophbsH6d1ulh2kUAq70PmzexRdVkk",
  authDomain: "ccc1-4b3b1.firebaseapp.com",
  projectId: "ccc1-4b3b1",
  storageBucket: "ccc1-4b3b1.firebasestorage.app",
  messagingSenderId: "598112715183",
  appId: "1:598112715183:web:b2eb908d72805b18ddef5a",
  measurementId: "G-KFZH8RRJRD"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
