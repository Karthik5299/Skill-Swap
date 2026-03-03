import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";

import {
  onAuthStateChanged,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();

// ✅ Custom Hook
export function useAuth() {
  return useContext(AuthContext);
}

// ✅ Provider
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  // 🛡 SESSION-BASED LOGIN (Logout when browser closes)
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log("Session persistence enabled");
      })
      .catch((error) => {
        console.error("Persistence error:", error);
      });
  }, []);

  // 🔥 Enrich user with Firestore data
  const enrichUserWithFirestore = async (authUser) => {
    if (!authUser) return null;

    try {
      const snap = await getDoc(doc(db, "users", authUser.uid));

      if (snap.exists()) {
        const data = snap.data();

        return {
          ...authUser,
          displayName: data.displayName || authUser.displayName || "",
          photoURL: data.photoURL || authUser.photoURL || "",
          bio: data.bio || "",
          skillsToTeach: data.skillsToTeach || [],
          skillsToLearn: data.skillsToLearn || [],
          uid: authUser.uid,
          email: authUser.email,
        };
      }
    } catch (error) {
      console.error("Error enriching user:", error);
    }

    return authUser;
  };

  // 🔐 Register
  async function register(email, password, displayName = "") {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;

    await updateProfile(user, { displayName });

    await setDoc(doc(db, "users", user.uid), {
      displayName: displayName || "",
      email: user.email,
      photoURL: "",
      bio: "",
      skillsToTeach: [],
      skillsToLearn: [],
      createdAt: serverTimestamp(),
    });

    return user;
  }

  // 🔐 Email Login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // 🔐 Logout
  function logout() {
    return signOut(auth);
  }

  // 🔥 Google Login / Signup
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        bio: "",
        skillsToTeach: [],
        skillsToLearn: [],
        createdAt: serverTimestamp(),
      });
    }

    return user;
  }

  // 🔐 Password Reset
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // 🔄 Update profile safely
  function updateUserProfile(profileData) {
    const authUpdate = {
      displayName: profileData.displayName || "",
    };

    if (
      profileData.photoURL &&
      !profileData.photoURL.startsWith("data:")
    ) {
      authUpdate.photoURL = profileData.photoURL;
    }

    return updateProfile(auth.currentUser, authUpdate);
  }

  // 🔄 Reload user
  async function reloadUser() {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    const enriched = await enrichUserWithFirestore(auth.currentUser);
    setCurrentUser(enriched);
  }

  // 👀 Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const enriched = await enrichUserWithFirestore(user);
        setCurrentUser(enriched);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    updateUserProfile,
    reloadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}