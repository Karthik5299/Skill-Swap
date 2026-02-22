import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { 
  onAuthStateChanged, 
  updateProfile, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The function your ProfilePage is looking for
  function updateUserProfile(profileData) {
    return updateProfile(auth.currentUser, {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL
    });
  }

  // Login function
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Signup function
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Logout function
  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    updateUserProfile,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}