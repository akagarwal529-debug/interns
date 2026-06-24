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
  apiKey:            "AIzaSyCQRGE3YyDI0csgkf5-fWwKD6VidJTTcto",
  authDomain:        "internsaathi-1a85a.firebaseapp.com",
  projectId:         "internsaathi-1a85a",
  storageBucket:     "internsaathi-1a85a.firebasestorage.app",
  messagingSenderId: "1085854699737",
  appId:             "1:1085854699737:web:d575637e1c4cd375ebeec8",
  measurementId:     "G-SY7RCYYPD1"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut };
