import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSya6n1bLNSdALCIputYnUDtb2lOPLdlGLsU",
  authDomain: "teamtrack-app-29717.firebaseapp.com",
  projectId: "teamtrack-app-29717",
  storageBucket: "teamtrack-app-29717.firebasestorage.app",
  messagingSenderId: "870650095618",
  appId: "1:870650095618:web:1d525ec548abb2c046df1b"
};

const FIREBASE_CONFIG_KEY = 'teamtrack_firebase_config';

export function getFirebaseConfig() {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    if (config && (config.apiKey || config.projectId)) {
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(FIREBASE_CONFIG_KEY);
    }
  } catch (e) {}
}

let firebaseApp = null;
let firestoreDb = null;

export function getFirebaseDb() {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    firebaseApp = null;
    firestoreDb = null;
    return null;
  }

  if (!firebaseApp) {
    try {
      firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
      firestoreDb = getFirestore(firebaseApp);
    } catch (err) {
      console.error('Firebase initialization error:', err);
      firebaseApp = null;
      firestoreDb = null;
    }
  }
  return firestoreDb;
}

export async function testFirebaseConnection(config = getFirebaseConfig()) {
  try {
    if (!config || !config.apiKey || !config.projectId) {
      throw new Error('Bitte mindestens API Key und Project ID eingeben.');
    }
    const tempApp = getApps().length > 0 ? getApp() : initializeApp(config, 'temp_test_' + Date.now());
    const tempDb = getFirestore(tempApp);
    
    // Quick probe read
    const docRef = doc(tempDb, 'teamtrack_workspaces', 'main_workspace');
    await getDoc(docRef);
    return { success: true, message: 'Verbindung zu Firebase erfolgreich!' };
  } catch (err) {
    return { success: false, message: err.message || 'Verbindung fehlgeschlagen.' };
  }
}
