import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBxcI5F4P5HNs4U2YBckjWyDOH2HE7RSfk",
  authDomain: "skillswap-4579b.firebaseapp.com",
  projectId: "skillswap-4579b",
  storageBucket: "skillswap-4579b.firebasestorage.app",
  messagingSenderId: "391765213809",
  appId: "1:391765213809:web:a93a11f38134b7facd91d0",
  measurementId: "G-T4L6KS5RBF"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // 🔥 IMPORTANT

export default app;
