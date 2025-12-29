import React, { useState, useMemo } from "react";
import { getData, saveData } from "../utils/localStorage";

/**
 * SenderForm
 * - Adds a pickup date *range* (start + end) so couriers can see the window.
 * - Persists to localStorage under key "parcels".
 */
export default function SenderForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    parcelType: "Documents",
    otherType: "",
    description: "",
    pickupStart: "",
    pickupEnd: "",
    originCountry: "",
    originCity: "",
    destinationCountry: "",
    destinationCity: "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const isOther = useMemo(() => form.parcelType === "Others", [form.parcelType]);

  const update = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.parcelType) e.parcelType = "Parcel type is required";
    if (isOther && !form.otherType.trim()) e.otherType = "Please specify the type";

    if (!form.originCountry.trim()) e.originCountry = "Origin country is required";
    if (!form.originCity.trim()) e.originCity = "Origin city is required";
    if (!form.destinationCountry.trim()) e.destinationCountry = "Destination country is required";
    if (!form.destinationCity.trim()) e.destinationCity = "Destination city is required";

    if (!form.pickupStart) e.pickupStart = "Pick-up start date required";
    if (!form.pickupEnd) e.pickupEnd = "Pick-up end date required";
    if (form.pickupStart && form.pickupEnd && form.pickupEnd < form.pickupStart) {
      e.pickupEnd = "End date cannot be before start date";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      parcelType: form.parcelType === "Others" ? form.otherType.trim() : form.parcelType,
      description: form.description.trim(),
      origin: { country: form.originCountry.trim(), city: form.originCity.trim() },
      destination: { country: form.destinationCountry.trim(), city: form.destinationCity.trim() },
      pickupWindow: { start: form.pickupStart, end: form.pickupEnd }, // YYYY-MM-DD
      createdAt: new Date().toISOString(),
    };

    const existing = getData("parcels");
    saveData("parcels", [...existing, payload]);

    setSaved(true);
    setForm({
      name: "",
      email: "",
      parcelType: "Documents",
      otherType: "",
      description: "",
      pickupStart: "",
      pickupEnd: "",
      originCountry: "",
      originCity: "",
      destinationCountry: "",
      destinationCity: "",
    });
    setErrors({});
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const minEnd = form.pickupStart || today;

  return (
    <form onSubmit={handleSubmit} className="sender-form" style={styles.form}>
      <h2 style={styles.h2}>Send a Parcel</h2>

      <div style={styles.row}>
        <label style={styles.label}>Name *</label>
        <input style={styles.input} value={form.name} onChange={update("name")} placeholder="Your name" />
        {errors.name && <span style={styles.error}>{errors.name}</span>}
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Email *</label>
        <input style={styles.input} type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" />
        {errors.email && <span style={styles.error}>{errors.email}</span>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.row}>
          <label style={styles.label}>Origin Country *</label>
          <input style={styles.input} value={form.originCountry} onChange={update("originCountry")} placeholder="India / Germany" />
          {errors.originCountry && <span style={styles.error}>{errors.originCountry}</span>}
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Origin City *</label>
          <input style={styles.input} value={form.originCity} onChange={update("originCity")} placeholder="Delhi / Berlin" />
          {errors.originCity && <span style={styles.error}>{errors.originCity}</span>}
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.row}>
          <label style={styles.label}>Destination Country *</label>
          <input style={styles.input} value={form.destinationCountry} onChange={update("destinationCountry")} placeholder="Germany / India" />
          {errors.destinationCountry && <span style={styles.error}>{errors.destinationCountry}</span>}
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Destination City *</label>
          <input style={styles.input} value={form.destinationCity} onChange={update("destinationCity")} placeholder="Berlin / Mumbai" />
          {errors.destinationCity && <span style={styles.error}>{errors.destinationCity}</span>}
        </div>
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Parcel Type *</label>
        <select style={styles.input} value={form.parcelType} onChange={update("parcelType")}>
          <option>Documents</option>
          <option>Medicines</option>
          <option>Others</option>
        </select>
        {errors.parcelType && <span style={styles.error}>{errors.parcelType}</span>}
      </div>

      {isOther && (
        <div style={styles.row}>
          <label style={styles.label}>Specify Type *</label>
          <input style={styles.input} value={form.otherType} onChange={update("otherType")} placeholder="e.g., Electronics, Clothes" />
          {errors.otherType && <span style={styles.error}>{errors.otherType}</span>}
        </div>
      )}

      <div style={styles.row}>
        <label style={styles.label}>Description</label>
        <textarea style={{ ...styles.input, height: 80 }} value={form.description} onChange={update("description")} placeholder="Optional details (size, weight, notes)" />
      </div>

      {/* NEW: Pickup date range */}
      <div style={styles.grid2}>
        <div style={styles.row}>
          <label style={styles.label}>Pickup Window Start *</label>
          <input
            style={styles.input}
            type="date"
            value={form.pickupStart}
            min={today}
            onChange={update("pickupStart")}
          />
          {errors.pickupStart && <span style={styles.error}>{errors.pickupStart}</span>}
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Pickup Window End *</label>
          <input
            style={styles.input}
            type="date"
            value={form.pickupEnd}
            min={minEnd}
            onChange={update("pickupEnd")}
          />
          {errors.pickupEnd && <span style={styles.error}>{errors.pickupEnd}</span>}
        </div>
      </div>

      <button type="submit" style={styles.button}>Save Parcel</button>
      {saved && <div style={styles.success}>Saved! Your parcel is now visible to couriers within the selected window.</div>}
    </form>
  );
}

const styles = {
  form: {
    maxWidth: 720,
    margin: "0 auto",
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
  },
  h2: { margin: "0 0 12px 0", fontSize: 22 },
  row: { display: "flex", flexDirection: "column", marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    outline: "none",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  button: {
    marginTop: 8,
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    background: "black",
    color: "white",
    fontWeight: 600,
  },
  error: { color: "#b91c1c", fontSize: 12, marginTop: 4 },
  success: { color: "#065f46", fontSize: 13, marginTop: 10 },
};
