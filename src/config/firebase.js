// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhTK4E-CX9i40Jb21qgRcqUH2jY3cOEhg",
  authDomain: "parcel-matcher.firebaseapp.com",
  projectId: "parcel-matcher",
  storageBucket: "parcel-matcher.firebasestorage.app",
  messagingSenderId: "859226198228",
  appId: "1:859226198228:web:0f31451d7a498b8d9b2b41",
  measurementId: "G-DRWCCNX3MF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);