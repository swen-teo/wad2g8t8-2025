import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// (You provided this)
export const firebaseConfig = {
  apiKey: 'AIzaSyDrcESDuT2jbQjllA8LXQN8vL9RkpF0qbg',
  authDomain: 'questpass-b3680.firebaseapp.com',
  projectId: 'questpass-b3680',
  storageBucket: 'questpass-b3680.appspot.com',
  messagingSenderId: '702360140919',
  appId: '1:702360140919:web:48db31942382151a5e5a72',
  measurementId: 'G-7XLXKQVQ33',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
// These are what your components (Login, App, Profile, etc.)
// will import and use.
export const auth = getAuth(app);
// export const db = getFirestore(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,  
});
// You can also export the main 'app' if you need it elsewhere
export default app;
export const functions = getFunctions(app);