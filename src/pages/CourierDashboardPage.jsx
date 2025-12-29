import React, { useEffect, useState } from "react";
import { getData } from "../utils/localStorage";

/**
 * CourierDashboardPage
 * - Displays only Couriers
 * - Uses same styling as ParcelDashboardPage and main Dashboard
 */
export default function CourierDashboardPage() {
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
    setCouriers(getData("couriers") || []);
  }, []);

  const renderTable = (data) => (
    <table style={styles.table}>
      <thead style={styles.thead}>
        <tr>
          <th>Name</th>
          <th>Origin</th>
          <th>Destination</th>
          <th>Available Window</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c) => (
          <tr key={c.id} style={styles.row}>
            <td>{c.name || '-'}</td>
            <td>{c.origin?.city || '-'}, {c.origin?.country || '-'}</td>
            <td>{c.destination?.city || '-'}, {c.destination?.country || '-'}</td>
            <td>{c.availableWindow?.start || '-'} → {c.availableWindow?.end || '-'}</td>
            <td>{c.notes || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Courier Dashboard</h2>
      {couriers.length === 0 ? (
        <p style={styles.empty}>No couriers available yet.</p>
      ) : (
        renderTable(couriers)
      )}
    </div>
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
