import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { getOrCreateConversation } from "../utils/conversations"; // from Step 1
import { auth } from "../config/firebase";


/**
 * CompanionDashboardPage
 * - Displays only Companions (formerly "Couriers")
 * - Uses same styling as ParcelDashboardPage and main Dashboard
 */
export default function CompanionDashboardPage() {
  const [companions, setCompanions] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null); // { userId, courierId }
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const q = query(
          collection(db, "couriers"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCompanions(results);

      } catch (err) {
        console.error("Failed to fetch companions:", err);
      }
    };

    fetchCompanions();
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
            <td style={styles.td}>
        
      {/* disable if no signed-in user or missing receiver id; guard before opening modal */}
      <button
        onClick={() => {
          // defensive: ensure receiver id exists and user is signed in
          const me = auth.currentUser?.uid;
          if (!me) {
            // UI-level validation: ask user to sign in
            alert("Please sign in to message couriers.");
            return;
          }
          if (!c.userId) {
            console.warn("Cannot message: courier has no userId", c);
            alert("Cannot message this courier.");
            return;
          }
          // normalize user id and open modal
          setMessageTarget({ userId: String(c.userId), courierId: c.id });
          setShowMessageModal(true);
        }}
        disabled={!auth.currentUser?.uid || !c.userId}
        style={{
          background: "none",
          border: "none",
          cursor: (!auth.currentUser?.uid || !c.userId) ? "not-allowed" : "pointer",
          fontSize: 18,
          opacity: (!auth.currentUser?.uid || c.userId === auth.currentUser?.uid) ? 0.4 : 1,
        }}
        title={!auth.currentUser?.uid ? "Sign in to message" : c.userId ? "Message courier" : "Unavailable"}
      >
        💬
      </button>
  </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

const navigate = useNavigate();

// send initial message from modal: create/ensure conversation, create message, update convo meta, navigate to messages page
const sendMessageHandler = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser || !messageTarget || !messageText.trim()) return;

  try {
    const conversationId = await getOrCreateConversation({
      currentUserId: currentUser.uid,
      targetUserId: messageTarget.userId,
      courierId: messageTarget.courierId || null,
    });

    // create message doc
    await addDoc(collection(db, "messages"), {
      conversationId,
      senderId: currentUser.uid,
      displayName: currentUser.displayName || "",
      text: messageText.trim(),
      createdAt: serverTimestamp(),
      read: false,
    });

    // update conversation meta (fire-and-forget)
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: messageText.trim(),
        lastMessageAt: serverTimestamp(),
      });
    } catch (err) {
      // not critical if it fails
      console.warn("Could not update conversation meta:", err);
    }

    // ensure conversation has sender's name so left-pane shows it
    try {
      const convoRef = doc(db, "conversations", conversationId);
      // set participantNames.<uid> = displayName (creates map if missing)
      await updateDoc(convoRef, {
        [`participantNames.${currentUser.uid}`]: currentUser.displayName || "",
      });
        // also set initiatorName if it's not already present (don't overwrite existing value)
      const convoSnap = await getDoc(convoRef);
      if (convoSnap.exists()) {
        const cdata = convoSnap.data();
        if (!cdata?.initiatorName || !cdata.initiatorName.trim()) {
          await updateDoc(convoRef, { initiatorName: currentUser.displayName || "" });
        }
      }
    } catch (err) {
      console.warn("Could not set participant name on conversation:", err);
    }


    setMessageText("");
    setShowMessageModal(false);
    navigate(`/messages/${conversationId}`);
  } catch (err) {
    console.error("Failed to send message:", err);
  }
};

const closeModal = () => {
  setShowMessageModal(false);
  setMessageText("");
  setMessageTarget(null);
};

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Companion Dashboard</h2>
      {companions.length === 0 ? (
        <p style={styles.empty}>No companions available yet.</p>
      ) : (
        renderTable(companions)
      )}

      {/* Simple message compose modal */}
      {showMessageModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={{ marginTop: 0 }}>Message Companion</h3>
            <textarea
              placeholder="Write your message…"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{ width: "100%", height: 120, padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", resize: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={closeModal} style={{ padding: "8px 12px", borderRadius: 6, background: "#e5e7eb", border: "none" }}>Cancel</button>
              <button onClick={sendMessageHandler} style={{ padding: "8px 12px", borderRadius: 6, background: "#2563eb", color: "#fff", border: "none" }} disabled={!messageText.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
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
    width: 560,
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
  },
};