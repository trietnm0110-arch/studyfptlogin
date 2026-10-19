import { initializeApp, getApps } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import type { AppSettings, DaySlotAssignment, StudySession, Subject, TaskItem, WeeklyReflection } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const firebaseApp = firebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : undefined;

export const auth = firebaseApp ? getAuth(firebaseApp) : undefined;
const database = firebaseApp ? getFirestore(firebaseApp) : undefined;

export interface StudyData {
  subjects: Subject[];
  timetable: DaySlotAssignment[];
  tasks: TaskItem[];
  sessions: StudySession[];
  reflections: WeeklyReflection[];
  settings: AppSettings;
}

const studyDataReference = (userId: string) =>
  doc(database!, 'users', userId, 'private', 'studyData');

export const subscribeToAuth = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth!, callback);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth!, email, password);

export const createEmailAccount = async (email: string, password: string, displayName: string) => {
  const credential = await createUserWithEmailAndPassword(auth!, email, password);
  if (displayName.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }
  return credential;
};

export const signInWithGoogle = () =>
  signInWithPopup(auth!, new GoogleAuthProvider());

export const signOutAccount = () => signOut(auth!);

export const loadStudyData = async (userId: string): Promise<StudyData | null> => {
  const snapshot = await getDoc(studyDataReference(userId));
  return snapshot.exists() ? (snapshot.data() as StudyData) : null;
};

export const saveStudyData = (userId: string, data: StudyData) => {
  const serializableData = JSON.parse(JSON.stringify(data)) as StudyData;
  return setDoc(studyDataReference(userId), { ...serializableData, updatedAt: Date.now() });
};