import React, { useEffect, useState } from "react";
import { getData } from "../utils/localStorage";

/**
 * ParcelDashboardPage
 * - Displays only Parcels
 * - Adds filters for couriers including date range with flexible filtering
 */
export default function ParcelDashboardPage() {
  const [parcels, setParcels] = useState([]);
  const [filteredParcels, setFilteredParcels] = useState([]);

  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const storedParcels = getData("parcels") || [];
    setParcels(storedParcels);
    setFilteredParcels(storedParcels);
  }, []);

  useEffect(() => {
    let data = parcels;

    if (originFilter) {
      data = data.filter(p => p.origin?.city?.toLowerCase().includes(originFilter.toLowerCase()));
    }
    if (destinationFilter) {
      data = data.filter(p => p.destination?.city?.toLowerCase().includes(destinationFilter.toLowerCase()));
    }
    if (typeFilter) {
      data = data.filter(p => p.parcelType?.toLowerCase() === typeFilter.toLowerCase());
    }
    if (searchText) {
      data = data.filter(p => (p.description || '').toLowerCase().includes(searchText.toLowerCase()));
    }

    if (dateRange.start || dateRange.end) {
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;

      if (start && end && end < start) {
        setDateError("End date cannot be before Start date");
        data = [];
      } else {
        setDateError("");
        data = data.filter(p => {
          const pickupStart = new Date(p.pickupWindow?.start);
          const pickupEnd = new Date(p.pickupWindow?.end);

          if (start && end) {
            return pickupStart <= end && pickupEnd >= start;
          } else if (start) {
            return pickupEnd >= start;
          } else if (end) {
            return pickupStart <= end;
          }
          return true;
        });
      }
    } else {
      setDateError("");
    }

    setFilteredParcels(data);
  }, [originFilter, destinationFilter, typeFilter, searchText, dateRange, parcels]);

  const renderTable = (data) => (
    <table style={styles.table}>
      <thead style={styles.thead}>
        <tr>
          <th>Name</th>
          <th>Parcel Type</th>
          <th>Origin</th>
          <th>Destination</th>
          <th>Pickup Window</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr key={p.id} style={styles.row}>
            <td>{p.name || '-'}</td>
            <td>{p.parcelType || '-'}</td>
            <td>{p.origin?.city || '-'}, {p.origin?.country || '-'}</td>
            <td>{p.destination?.city || '-'}, {p.destination?.country || '-'}</td>
            <td>{p.pickupWindow?.start || '-'} → {p.pickupWindow?.end || '-'}</td>
            <td>{p.description || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Parcel Dashboard</h2>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Filter by Origin City"
          value={originFilter}
          onChange={e => setOriginFilter(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Filter by Destination City"
          value={destinationFilter}
          onChange={e => setDestinationFilter(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Filter by Parcel Type"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Search Description"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={styles.input}
        />
        <input
          type="date"
          placeholder="Start Date"
          value={dateRange.start}
          onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
          style={styles.input}
        />
        <input
          type="date"
          placeholder="End Date"
          value={dateRange.end}
          onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
          style={styles.input}
        />
      </div>

      {dateError && <p style={{ color: 'red', marginBottom: 8 }}>{dateError}</p>}

      {filteredParcels.length === 0 ? (
        <p style={styles.empty}>No parcels match the filters.</p>
      ) : (
        renderTable(filteredParcels)
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "20px auto", padding: 16, fontFamily: 'Arial, sans-serif' },
  h2: { marginBottom: 16, fontSize: 24, color: '#111827' },
  filters: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', minWidth: 160 },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: '0 8px', backgroundColor: '#f9fafb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  thead: { backgroundColor: '#1f2937', color: '#fff', textAlign: 'left', fontWeight: 600 },
  row: { backgroundColor: '#fff', transition: 'background 0.2s', cursor: 'pointer' },
  td: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '12px 16px' },
  empty: { fontStyle: 'italic', color: '#6b7280', marginTop: 8 },
};
