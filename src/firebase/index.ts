import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './config';
import { useUser } from './auth/use-user';
import { FirebaseProvider, useAuth, useFirebaseApp } from './provider';

function initializeFirebase() {
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  // NOTE: This is for local development only and should be disabled in production.
  // if (process.env.NEXT_PUBLIC_EMULATORS_ENABLED === 'true') {
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  //   connectFirestoreEmulator(firestore, 'localhost', 8080);
  // }

  return { app, auth, firestore };
}

export {
  FirebaseProvider,
  initializeFirebase,
  useAuth,
  useFirebaseApp,
  useUser,
};
