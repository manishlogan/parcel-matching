import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

import PageLayout from "../components/layout/PageLayout";


const EditProfilePage = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    email: "",
  });

  const [originalForm, setOriginalForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const userId = auth.currentUser?.uid;

  useEffect(() => {
  const fetchProfile = async () => {
    if (!userId) return;

    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const data = snap.data();

      setForm({
        name: data.name || "",
        phone: data.phone || "",
        bio: data.bio || "",
        email: auth.currentUser.email || "",
      });

      setOriginalForm({
        name: data.name || "",
        phone: data.phone || "",
        bio: data.bio || "",
      });
    }
  };

  fetchProfile();
}, [userId]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = "success", ms = 3000) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), ms);
  };

  const handleSave = async () => {
    if (!userId) {
      showToast("Unable to save: not signed in.", "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
      });

      setOriginalForm({
        name: form.name,
        phone: form.phone,
        bio: form.bio,
      });

      showToast("Profile updated", "success");
    } catch (err) {
      console.error("Failed to update profile", err);
      showToast("Failed to update profile. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isChanged =
      originalForm &&
      (form.name !== originalForm.name ||
      form.phone !== originalForm.phone ||
      form.bio !== originalForm.bio);

  return (
    <PageLayout title="Edit Profile">
      <div className="form-group">
        <label>Name</label>
        <input
        name="name"
        value={form.name}
        onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input value={form.email} disabled />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Bio</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
        />
      </div>

      <button disabled={!isChanged || isSaving} onClick={handleSave}>
        {isSaving ? "Saving..." : "Save"}
      </button>

      {toast.visible && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 24,
            padding: "10px 16px",
            color: "#fff",
            background: toast.type === "success" ? "#16a34a" : "#dc2626",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            zIndex: 9999,
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          {toast.message}
        </div>
      )}

    </PageLayout>
  );
};

export default EditProfilePage;