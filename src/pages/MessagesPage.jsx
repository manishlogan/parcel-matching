import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const user = auth.currentUser;

  // 🔹 Load conversations
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(list);
    });

    return () => unsub();
  }, [user]);

  // 🔹 Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const q = query(
      collection(db, "conversations", activeConversation.id, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(msgs);

      // mark received messages as read
      msgs.forEach((msg) => {
        if (!msg.read && msg.senderId !== user.uid) {
          updateDoc(
            doc(
              db,
              "conversations",
              activeConversation.id,
              "messages",
              msg.id
            ),
            { read: true }
          );
        }
      });
    });

    return () => unsub();
  }, [activeConversation, user]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!text.trim() || !activeConversation) return;

    await addDoc(
      collection(db, "conversations", activeConversation.id, "messages"),
      {
        senderId: user.uid,
        text,
        createdAt: serverTimestamp(),
        read: false,
      }
    );

    await updateDoc(
      doc(db, "conversations", activeConversation.id),
      {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      }
    );

    setText("");
  };

  return (
    <div style={{ display: "flex", height: "80vh", gap: 16 }}>
      {/* Left: Conversations */}
      <div style={{ width: 300, borderRight: "1px solid #ddd" }}>
        <h3>Messages</h3>
        {conversations.map((c) => {
          const otherUser = c.participants.find((p) => p !== user.uid);
          return (
            <div
              key={c.id}
              onClick={() => setActiveConversation(c)}
              style={{
                padding: 12,
                cursor: "pointer",
                background:
                  activeConversation?.id === c.id ? "#f3f4f6" : "transparent",
              }}
            >
              <div style={{ fontWeight: 600 }}>{otherUser}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {c.lastMessage || "No messages yet"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Message thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeConversation ? (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: 8,
                    textAlign:
                      m.senderId === user.uid ? "right" : "left",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: 12,
                      background:
                        m.senderId === user.uid
                          ? "#2563eb"
                          : "#e5e7eb",
                      color:
                        m.senderId === user.uid ? "#fff" : "#111",
                    }}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", padding: 12, gap: 8 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message"
                style={{ flex: 1, padding: 8 }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ padding: 32, color: "#6b7280" }}>
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;