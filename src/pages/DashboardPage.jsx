import React, { useEffect, useState } from "react";
import { getData } from "../utils/localStorage";
import { collection, getDocs, deleteDoc, doc} from "firebase/firestore";
import { db } from "../config/firebase";
import PageLayout from "../components/layout/PageLayout";

/**
 * DashboardPage
 * - Displays both Parcels and Companions
 * - Styled for better visual presentation
 */
export default function DashboardPage() {
  const [parcels, setParcels] = useState([]);
  const [companions, setCompanions] = useState([]);

  // confirmation modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { id, type: 'parcel'|'companion', name }
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
  const loadData = async () => {
    try {
      // Fetch parcels
      const parcelsSnap = await getDocs(collection(db, "parcels"));
      const allParcels = parcelsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch companions
      const companionsSnap = await getDocs(collection(db, "couriers"));
      const allCompanions = companionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setParcels(allParcels);
      setCompanions(allCompanions);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  loadData();
}, []);

const openConfirm = ({ id, type, name }) => {
    setConfirmTarget({ id, type, name });
    setConfirmVisible(true);
  };

  const closeConfirm = () => {
    setConfirmVisible(false);
    setConfirmTarget(null);
    setConfirmLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    const { id, type } = confirmTarget;
    const collectionName = type === "parcel" ? "parcels" : "couriers";

    try {
      await deleteDoc(doc(db, collectionName, id));
      if (type === "parcel") {
        setParcels((p) => p.filter((r) => r.id !== id));
      } else {
        setCompanions((c) => c.filter((r) => r.id !== id));
      }
      closeConfirm();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. Check console for details.");
      setConfirmLoading(false);
    }
  };

  const renderTable = (data, columns, rowType) => (
    <table style={styles.table}>
      <thead style={styles.thead}>
        <tr>
          {columns.map((col) => <th key={col}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} style={styles.row}>
            {columns.map((col) => {
              switch(col) {
                case 'Name': return <td key={col}>{row.name || '-'}</td>;
                case 'Parcel Type': return <td key={col}>{row.parcelType || '-'}</td>;
                case 'Origin': return <td key={col}>{row.origin?.city || '-'}, {row.origin?.country || '-'}</td>;
                case 'Destination': return <td key={col}>{row.destination?.city || '-'}, {row.destination?.country || '-'}</td>;
                case 'Pickup Window': return <td key={col}>{row.pickupWindow?.start || '-'} → {row.pickupWindow?.end || '-'}</td>;
                case 'Available Window': return <td key={col}>{row.availableWindow?.start || '-'} → {row.availableWindow?.end || '-'}</td>;
                case 'Description': return <td key={col}>{row.description || '-'}</td>;
                case 'Notes': return <td key={col}>{row.notes || '-'}</td>;
                default: return <td key={col} style={styles.td}>
                  <button
                    onClick={() => openConfirm({ id: row.id, type: rowType === "parcel" ? "parcel" : "companion", name: row.name })}
                    style={styles.deleteButton}
                    aria-label={`Delete ${rowType}`}
                  >
                    ✖
                  </button></td>;
              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <PageLayout title="Dashboard">
      <div style={styles.container}>
        <h2 style={styles.h2}>Parcel Dashboard</h2>
        {parcels.length === 0 ? <p style={styles.empty}>No parcels available yet.</p> : renderTable(parcels, ['Name','Parcel Type','Origin','Destination','Pickup Window','Description', ''], 'parcel')}

        <h2 style={{...styles.h2, marginTop: 40}}>Companion Dashboard</h2>
        {companions.length === 0 ? <p style={styles.empty}>No companions available yet.</p> : renderTable(companions, ['Name','Origin','Destination','Available Window','Description', ''], 'companion')}
      </div>

      {confirmVisible && confirmTarget && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm delete</h3>
            <p>Delete {confirmTarget.type === "parcel" ? "parcel from" : "companion"} <strong>{confirmTarget.name || confirmTarget.id}</strong>?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={closeConfirm} style={modalStyles.cancelButton} disabled={confirmLoading}>Cancel</button>
              <button onClick={handleConfirmDelete} style={modalStyles.deleteButton} disabled={confirmLoading}>
                {confirmLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "20px auto", padding: 16, fontFamily: 'Arial, sans-serif' },
  h2: { marginBottom: 16, fontSize: 24, color: '#111827' },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: '0 8px', backgroundColor: '#f9fafb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  thead: { backgroundColor: '#1f2937', color: '#fff', textAlign: 'left', fontWeight: 600 },
  row: { backgroundColor: '#fff', transition: 'background 0.2s', cursor: 'pointer' },
  td: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '12px 16px' },
  empty: { fontStyle: 'italic', color: '#6b7280', marginTop: 8 },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: 420,
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
  },
  cancelButton: { padding: "8px 12px", borderRadius: 6, background: "#e5e7eb", border: "none" },
  deleteButton: { padding: "8px 12px", borderRadius: 6, background: "#b91c1c", color: "#fff", border: "none" },
};