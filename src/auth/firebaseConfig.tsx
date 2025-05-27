import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA53wXtIu3abcvGmA7RK-UB9yX243dYAR4",
  authDomain: "baxter-projects.firebaseapp.com",
  projectId: "baxter-projects",
  storageBucket: "baxter-projects.appspot.com",
  messagingSenderId: "727798822380",
  appId: "1:727798822380:web:9a73fcb51dc61df2437cc9",
  measurementId: "G-GLWCLNHF5K"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);

export { auth, db };
