import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    setUser(firebaseUser);

    // 🔑 TEMP ROLE LOGIC
    const role =
      firebaseUser.email === "manishjain.forever@gmail.com"
        ? "admin"
        : "user";

    setRole(role);

    // ✅ NEW: Save / update user in Firestore
    await setDoc(
      doc(db, "users", firebaseUser.uid),
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: role,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    setUser(null);
    setRole(null);
  }

  setLoading(false);
});


    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);