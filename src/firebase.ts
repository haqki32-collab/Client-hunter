import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AnalyzedBusinessRecord } from './components/AnalyzedHistoryView.tsx';

let dbInstance: Firestore | null = null;

export function getDb(): Firestore {
  if (!dbInstance) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return dbInstance;
}

const COLLECTION_NAME = 'analyzed_businesses';

export async function fetchAnalyzedBusinessesFromFirestore(): Promise<AnalyzedBusinessRecord[]> {
  try {
    const db = getDb();
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const list: AnalyzedBusinessRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AnalyzedBusinessRecord);
    });
    return list;
  } catch (err) {
    console.warn('Firestore fetch warning:', err);
    return [];
  }
}

export async function saveAnalyzedBusinessToFirestore(record: AnalyzedBusinessRecord): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, record.signature);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    console.warn('Firestore save warning:', err);
  }
}

export async function removeAnalyzedBusinessFromFirestore(signature: string): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, signature);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore remove warning:', err);
  }
}
