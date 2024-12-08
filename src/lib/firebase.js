import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPRN9QAwrylUKQy5S8peYelLl00NgJwxc",
  authDomain: "course-grade-calculator.firebaseapp.com",
  projectId: "course-grade-calculator",
  storageBucket: "course-grade-calculator.firebasestorage.app",
  messagingSenderId: "581408695192",
  appId: "1:581408695192:web:a9a1f133c895ca4a44c1ed",
  measurementId: "G-292Z4GT8CJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);