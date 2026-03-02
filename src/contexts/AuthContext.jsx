import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { db } from "../config/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Enrich the Firebase Auth user with Firestore data (incl. base64 photo) ──
  const enrichUserWithFirestore = async (authUser) => {
    if (!authUser) return null;
    try {
      const snap = await getDoc(doc(db, "users", authUser.uid));
      if (snap.exists()) {
        const firestoreData = snap.data();
        // Merge Firestore fields on top of the Auth user object.
        // This means currentUser.photoURL will be the base64 string
        // from Firestore if it exists, otherwise the Auth URL.
        return {
          ...authUser,
          displayName: firestoreData.displayName || authUser.displayName || "",
          photoURL:    firestoreData.photoURL    || authUser.photoURL    || "",
          bio:         firestoreData.bio         || "",
          skillsToTeach: firestoreData.skillsToTeach || [],
          skillsToLearn: firestoreData.skillsToLearn || [],
          // keep the raw uid accessible
          uid: authUser.uid,
          email: authUser.email,
        };
      }
    } catch (err) {
      console.error("Failed to enrich user from Firestore:", err);
    }
    return authUser; // fallback to plain Auth user
  };

  // ── Update Firebase Auth profile (never passes base64 to Auth) ────────────
  function updateUserProfile(profileData) {
    const authUpdate = {
      displayName: profileData.displayName || "",
    };
    // Firebase Auth only accepts real URLs for photoURL, not base64
    if (profileData.photoURL && !profileData.photoURL.startsWith("data:")) {
      authUpdate.photoURL = profileData.photoURL;
    }
    return updateProfile(auth.currentUser, authUpdate);
  }

  // ── Reload and re-enrich the user (call after saving profile) ─────────────
  async function reloadUser() {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    const enriched = await enrichUserWithFirestore(auth.currentUser);
    setCurrentUser(enriched);
  }

  // ── Listen for auth state changes ─────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const enriched = await enrichUserWithFirestore(authUser);
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
    updateUserProfile,
    reloadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
