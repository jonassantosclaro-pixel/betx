/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserProfile, UserRole } from "../types";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginCustom: (email: string, pass: string) => Promise<void>;
  registerUserProfile: (uid: string, name: string, email: string, role: UserRole) => Promise<void>;
  registerCustom: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBalance: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto monitor login states
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // Sync Firestore User Profile
        const userRef = doc(db, "users", fUser.uid);
        
        // Listen live
        const unsubSnap = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            // First login, bootstrap standard profile
            const isDefaultAdmin = fUser.email === "phbet@x.com" || fUser.email === "jonassantosclaro@gmail.com";
            const initialProfile: UserProfile = {
              userId: fUser.uid,
              name: fUser.displayName || fUser.email?.split("@")[0] || "Apostador PH",
              email: fUser.email || "",
              role: isDefaultAdmin ? "admin" : "usuario",
              balance: isDefaultAdmin ? 999999.00 : 500.00, // 500.00 BRL to test betting
              status: "active",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setDoc(userRef, initialProfile).then(() => {
              setUserProfile(initialProfile);
            });
          }
          setLoading(false);
        });

        return () => unsubSnap();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Quick register for custom users/cambistas
  const registerUserProfile = async (uid: string, name: string, email: string, role: UserRole) => {
    const userRef = doc(db, "users", uid);
    const initialProfile: UserProfile = {
      userId: uid,
      name,
      email,
      role,
      balance: role === "cambista" ? 0.0 : 500.0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, initialProfile);
  };

  // Real register using Firebase Auth
  const registerCustom = async (email: string, pass: string, name: string, role: UserRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await registerUserProfile(cred.user.uid, name, email, role);
  };

  const loginCustom = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateUserBalance = async (amount: number) => {
    if (!userProfile) return;
    const newBalance = Number((userProfile.balance + amount).toFixed(2));
    
    // If we're authenticated, save to Firestore
    if (firebaseUser) {
      const userRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userRef, { balance: newBalance }, { merge: true });
    } else {
      // Offline local sandbox sync
      setUserProfile(prev => prev ? { ...prev, balance: newBalance } : null);
    }
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      userProfile,
      loading,
      loginCustom,
      registerUserProfile,
      registerCustom,
      logout,
      updateUserBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
