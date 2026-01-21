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

  const handleSave = async () => {
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

  alert("Profile updated");
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

      <button disabled={!isChanged} onClick={handleSave}>
        Save
      </button>

    </PageLayout>
  );
};

export default EditProfilePage;