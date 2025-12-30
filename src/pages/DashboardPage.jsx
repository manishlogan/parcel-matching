import React, { useEffect, useState } from "react";
import { getData } from "../utils/localStorage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import PageLayout from "../components/layout/PageLayout";

/**
 * DashboardPage
 * - Displays both Parcels and Couriers
 * - Styled for better visual presentation
 */
export default function DashboardPage() {
  const [parcels, setParcels] = useState([]);
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
  const loadData = async () => {
    try {
      // Fetch parcels
      const parcelsSnap = await getDocs(collection(db, "parcels"));
      const allParcels = parcelsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch couriers
      const couriersSnap = await getDocs(collection(db, "couriers"));
      const allCouriers = couriersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setParcels(allParcels);
      setCouriers(allCouriers);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  loadData();
}, []);


  const renderTable = (data, columns) => (
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
                default: return <td key={col}>-</td>;
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
        {parcels.length === 0 ? <p style={styles.empty}>No parcels available yet.</p> : renderTable(parcels, ['Name','Parcel Type','Origin','Destination','Pickup Window','Description'])}

        <h2 style={{...styles.h2, marginTop: 40}}>Courier Dashboard</h2>
        {couriers.length === 0 ? <p style={styles.empty}>No couriers available yet.</p> : renderTable(couriers, ['Name','Origin','Destination','Available Window','Notes'])}
      </div>
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
