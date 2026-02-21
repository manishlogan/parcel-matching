import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../config/firebase";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ...existing code...

const ADMIN_EMAIL = "manishjain.forever@gmail.com";

const GoogleLogin = () => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Checking login...</div>;
  if (user) return <Navigate to="/home" replace />;

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

  return (
    <button className="google-btn" onClick={handleLogin}>
      <span className="google-icon" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.6-37.4-4.9-55.4H272v104.9h146.9c-6.4 34.9-25.6 64.5-54.6 84.4v69h88.1c51.6-47.5 81.1-117.8 81.1-202.9z"/>
          <path fill="#34A853" d="M272 544.3c73.9 0 135.9-24.6 181.2-66.8l-88.1-69c-24.5 16.5-56 26.2-93.1 26.2-71.6 0-132.3-48.3-154-113.1H29.2v71.2C74 489.9 166 544.3 272 544.3z"/>
          <path fill="#FBBC05" d="M118 324.6c-10.9-32.4-10.9-67.2 0-99.6V153.8H29.2C10.6 196.7 0 236.6 0 272s10.6 75.3 29.2 118.2L118 324.6z"/>
          <path fill="#EA4335" d="M272 107.7c39.9 0 75.8 13.7 104.1 40.6l78-78C403.8 24.6 341.8 0 272 0 166 0 74 54.4 29.2 153.8l88.8 71.2C139.7 156 200.4 107.7 272 107.7z"/>
        </svg>
      </span>
      <span className="google-text">Sign in with Google</span>
    </button>
  );
};

export default GoogleLogin;