import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { addDoc, collection, serverTimestamp, getDocs } from "firebase/firestore";

import PageLayout from "../components/layout/PageLayout";


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

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageText, setMessageText] = useState("");
  
  useEffect(() => {
    console.log("Modal state changed:", showMessageModal, messageTarget);
  }, [showMessageModal, messageTarget]);

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
    <table className="table">
      <thead>
        <tr>
          <th>Sender</th>
          <th>Parcel Type</th>
          <th>Origin</th>
          <th>Destination</th>
          <th>Pickup Window From</th>
          <th>Pickup Window To</th>
          <th>Description</th>
          <th>Message</th>
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
            <td>
            <button
              onClick={() => {
                console.log("MESSAGE CLICKED - parcel:", p);
                console.log("current auth user:", auth.currentUser);
                setMessageTarget({
                receiverId: p.userId,
                parcelId: p.id,
                receiverName: p.name,
                parcelType: p.parcelType,
              });
                setShowMessageModal(true);
              }}

              // disabled={p.userId === auth.currentUser?.uid}
              style={{
                background: "none",
                border: "none",
                // cursor: p.userId === auth.currentUser?.uid ? "not-allowed" : "pointer",
                cursor: "pointer",
                fontSize: 18,
                opacity: p.userId === auth.currentUser?.uid ? 0.4 : 1,
              }}
              title="Message parcel owner"
            >
              💬
            </button>
          </td>

          </tr>
        ))}
      </tbody>
    </table>
  );

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 400,
};

const sendMessageHandler = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser || !messageTarget || !messageText.trim()) return;

  const {
    receiverId,
    parcelId,
    receiverName,
    parcelType,
  } = messageTarget;

  // 1️⃣ Create conversation
  const conversationRef = await addDoc(collection(db, "conversations"), {
    participants: [currentUser.uid, receiverId],
    parcelId,
    initiatorName: currentUser.displayName || "",
    otherUserName: receiverName || "",
    parcelType: parcelType || "",
    lastMessage: messageText.trim(),
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });

  // 2️⃣ Create message
  await addDoc(collection(db, "messages"), {
    conversationId: conversationRef.id,
    senderId: currentUser.uid,
    senderName: currentUser.displayName || "",
    text: messageText.trim(),
    createdAt: serverTimestamp(),
  });

  setMessageText("");
  setShowMessageModal(false);
};

return (

    <PageLayout title="Parcel Dashboard">
      <div>
        <div className="filters-row">
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

      {showMessageModal && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <h3>Send message</h3>

      <textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Write your message..."
        rows={4}
        style={{ width: "100%", padding: 8 }}
      />

      <div style={{ marginTop: 12, textAlign: "right" }}>
        <button onClick={() => setShowMessageModal(false)}>
          Cancel
        </button>
        <button
          onClick={sendMessageHandler}
          disabled={!messageText.trim()}
          style={{ marginLeft: 8 }}
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}

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
