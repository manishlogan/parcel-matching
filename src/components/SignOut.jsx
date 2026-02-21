import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export default function SignOut() {
  return <button onClick={() => signOut(auth)}>Logout</button>;
}
