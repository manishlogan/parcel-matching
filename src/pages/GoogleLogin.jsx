import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../config/firebase";

const ADMIN_EMAIL = "manishjain.forever@gmail.com";

const GoogleLogin = () => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          role: user.email === ADMIN_EMAIL ? "admin" : "user",
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return <button onClick={handleLogin}>Sign in with Google</button>;
};

export default GoogleLogin;