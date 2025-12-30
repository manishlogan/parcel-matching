import React, { useEffect, useState } from "react";
import { getData } from "../utils/localStorage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

import PageLayout from "../components/layout/PageLayout";


/**
 * ParcelDashboardPage
 * - Displays only Parcels
 * - Adds filters for couriers including date range with flexible filtering
 */
export default function ParcelDashboardPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filteredParcels, setFilteredParcels] = useState([]);

  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const snap = await getDocs(collection(db, "parcels"));
        const allParcels = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParcels(allParcels);
      } catch (err) {
        console.error("Error fetching parcels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
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
    <table>
      <thead>
        <tr>
          <th>Sender</th>
          <th>Parcel Type</th>
          <th>Origin</th>
          <th>Destination</th>
          <th>Pickup Window From</th>
          <th>Pickup Window To</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr key={p.id}>
            <td>{p.name || '-'}</td>
            <td>{p.parcelType || '-'}</td>
            <td>{p.origin?.city || '-'}, {p.origin?.country || '-'}</td>
            <td>{p.destination?.city || '-'}, {p.destination?.country || '-'}</td>
            <td>{p.pickupWindow?.start || '-'}</td>
            <td>{p.pickupWindow?.end || '-'}</td>
            <td>{p.description || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

return (
    <PageLayout title="Parcel Dashboard">
      <div>
        <div>
        <input
          type="text"
          placeholder="Filter by Origin City"
          value={originFilter}
          onChange={e => setOriginFilter(e.target.value)}

        />
        <input
          type="text"
          placeholder="Filter by Destination City"
          value={destinationFilter}
          onChange={e => setDestinationFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Parcel Type"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          
        />
        <input
          type="text"
          placeholder="Search Description"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          
        />
        <input
          type="date"
          placeholder="Start Date"
          value={dateRange.start}
          onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
          
        />
        <input
          type="date"
          placeholder="End Date"
          value={dateRange.end}
          onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
          
        />
      </div>

      {dateError && <p>{dateError}</p>}

      {filteredParcels.length === 0 ? (
        <p>No parcels match the filters.</p>
      ) : (
        renderTable(filteredParcels)
      )}
    </div>

    </PageLayout>
  );
}
