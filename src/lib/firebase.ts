import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "mathmog",
  "appId": "1:477043430209:web:e2675f6b56a2cb5eabc7c0",
  "storageBucket": "mathmog.firebasestorage.app",
  "apiKey": "AIzaSyB5JaQ4n8ui18IEnbU31Eark-050DRvU8Q",
  "authDomain": "mathmog.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "477043430209"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
