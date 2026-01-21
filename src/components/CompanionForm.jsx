import React, { useState } from "react";
import { getData } from "../utils/localStorage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

/**
 * CompanionForm
 * - Similar look and feel as SenderForm
 * - Includes date range picker for availability
 * - Persists to localStorage under "couriers" (kept for compatibility)
 */
export default function CompanionForm() {
  const [form, setForm] = useState({
    name: "",
    originCountry: "",
    originCity: "",
    destinationCountry: "",
    destinationCity: "",
    availableStart: "",
    availableEnd: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.originCountry.trim()) e.originCountry = "Origin country required";
    if (!form.originCity.trim()) e.originCity = "Origin city required";
    if (!form.destinationCountry.trim()) e.destinationCountry = "Destination country required";
    if (!form.destinationCity.trim()) e.destinationCity = "Destination city required";
    if (!form.availableStart) e.availableStart = "Start date required";
    if (!form.availableEnd) e.availableEnd = "End date required";
    if (form.availableStart && form.availableEnd && form.availableEnd < form.availableStart) {
      e.availableEnd = "End date cannot be before start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: form.name.trim(),
      origin: { country: form.originCountry.trim(), city: form.originCity.trim() },
      destination: { country: form.destinationCountry.trim(), city: form.destinationCity.trim() },
      availableWindow: { start: form.availableStart, end: form.availableEnd },
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "couriers"), {
      ...payload,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });

    setSaved(true);
    setForm({
      name: "",
      originCountry: "",
      originCity: "",
      destinationCountry: "",
      destinationCity: "",
      availableStart: "",
      availableEnd: "",
      notes: "",
    });
    setErrors({});
  }

  const today = new Date().toISOString().slice(0, 10);
  const minEnd = form.availableStart || today;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.h2}>Companion Availability</h2>

      <div style={styles.row}>
        <label style={styles.label}>Name *</label>
        <input style={styles.input} value={form.name} onChange={update("name")} placeholder="Your name" />
        {errors.name && <span style={styles.error}>{errors.name}</span>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.row}>
          <label style={styles.label}>Origin Country *</label>
          <input style={styles.input} value={form.originCountry} onChange={update("originCountry")} placeholder="Country" />
          {errors.originCountry && <span style={styles.error}>{errors.originCountry}</span>}
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Origin City *</label>
          <input style={styles.input} value={form.originCity} onChange={update("originCity")} placeholder="City" />
          {errors.originCity && <span style={styles.error}>{errors.originCity}</span>}
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.row}>
          <label style={styles.label}>Destination Country *</label>
          <input style={styles.input} value={form.destinationCountry} onChange={update("destinationCountry")} placeholder="Country" />
          {errors.destinationCountry && <span style={styles.error}>{errors.destinationCountry}</span>}
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Destination City *</label>
          <input style={styles.input} value={form.destinationCity} onChange={update("destinationCity")} placeholder="City" />
          {errors.destinationCity && <span style={styles.error}>{errors.destinationCity}</span>}
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.row}>
          <label style={styles.label}>Available Start *</label>
          <input style={styles.input} type="date" value={form.availableStart} min={today} onChange={update("availableStart")} />
          {errors.availableStart && <span style={styles.error}>{errors.availableStart}</span>}
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Available End *</label>
          <input style={styles.input} type="date" value={form.availableEnd} min={minEnd} onChange={update("availableEnd")} />
          {errors.availableEnd && <span style={styles.error}>{errors.availableEnd}</span>}
        </div>
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Notes</label>
        <textarea style={{ ...styles.input, height: 80 }} value={form.notes} onChange={update("notes")} placeholder="Optional notes" />
      </div>

      <button type="submit" style={styles.button}>Save Availability</button>
      {saved && <div style={styles.success}>Saved! Your availability is now visible to senders.</div>}
    </form>
  );
}

const styles = {
  form: { maxWidth: 720, margin: "0 auto", padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" },
  h2: { margin: "0 0 12px 0", fontSize: 22 },
  row: { display: "flex", flexDirection: "column", marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 10, outline: "none" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  button: { marginTop: 8, padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", background: "black", color: "white", fontWeight: 600 },
  error: { color: "#b91c1c", fontSize: 12, marginTop: 4 },
  success: { color: "#065f46", fontSize: 13, marginTop: 10 },
};
