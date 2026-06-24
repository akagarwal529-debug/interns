// ============================================================
// firebase-config.js — InternSaathi Firebase Configuration
// ------------------------------------------------------------
// SETUP STEPS:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → name it "internsaathi"
// 3. Go to Project Settings (gear icon) → General → "Your apps"
// 4. Click </> (Web) → Register app → copy the firebaseConfig
// 5. Replace the values below with YOUR project values
// 6. Go to Authentication → Sign-in method → Enable Google + Email/Password
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔴 REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIG
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut };
