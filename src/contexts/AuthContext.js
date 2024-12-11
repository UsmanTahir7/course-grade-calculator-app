import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    const localData = {
      calculators: JSON.parse(localStorage.getItem("calculators") || "[]"),
      theme: localStorage.getItem("theme") || "light",
      gpaGrades: JSON.parse(localStorage.getItem("gpaGrades") || "[]"),
    };
    document.documentElement.classList.toggle(
      "dark",
      localData.theme === "dark"
    );
  };

  const value = {
    user,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
