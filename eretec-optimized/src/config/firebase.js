import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getDatabase, ref, set, update, get, remove, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBoL7JGMn5xD7QhM7xF7F7F7F7F7F7F7F7",
  authDomain: "emc-project-62729.firebaseapp.com",
  databaseURL: "https://emc-project-62729-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "emc-project-62729",
  storageBucket: "emc-project-62729.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789abcdef"
};

// Initialize Firebase with modular SDK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Set persistence to LOCAL (default)
auth.setPersistence({ persistence: 'LOCAL' });

export {
  app,
  auth,
  database,
  ref,
  set,
  update,
  get,
  remove,
  onValue,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
};

export const DATA_PATH = '/emc/data';
