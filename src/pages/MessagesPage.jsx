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
  const [messageText, setMessageText] = useState("");


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

  // 🔹 Load messages for active conversation (top-level "messages" collection)
  useEffect(() => {
    if (!activeConversation) return;

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", activeConversation.id),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // mark received messages as read (top-level messages collection)
      msgs.forEach((msg) => {
        if (!msg.read && msg.senderId !== user?.uid) {
          updateDoc(doc(db, "messages", msg.id), { read: true }).catch(() => {
            // ignore errors for now
          });
        }
      });
    });

    return () => unsub();
  }, [activeConversation, user]);

  // ✉️ Reply / send message (uses top-level "messages")
  const sendReplyHandler = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !activeConversation) return;

    const textTrimmed = messageText.trim();

    // create the message in Firestore
    const docRef = await addDoc(collection(db, "messages"), {
      conversationId: activeConversation.id,
      senderId: auth.currentUser.uid,
      text: textTrimmed,
      createdAt: serverTimestamp(),
      read: false,
    });

    // optimistic local append so user sees the message immediately
    const optimisticMsg = {
      id: docRef.id,
      conversationId: activeConversation.id,
      senderId: auth.currentUser.uid,
      text: textTrimmed,
      createdAt: new Date(), // local timestamp for ordering until server value arrives
      read: false,
      pending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);


    // update conversation meta (fire-and-forget)
    // TODO: handle errors?
    updateDoc(doc(db, "conversations", activeConversation.id), {
      lastMessage: textTrimmed,
      lastMessageAt: serverTimestamp(),
    }).catch(() => {});

    setMessageText("");
  };

  return (
    <div style={{ display: "flex", height: "80vh", gap: 16 }}>
      {/* Left: Conversations */}
      <div style={{ width: 300, borderRight: "1px solid #ddd" }}>
        <h3>Messages</h3>
        {conversations.map((c) => {
          // find the other participant uid
          const otherUid = (c.participants || []).find((p) => p !== user?.uid);
          // simplified rule: prefer initiatorName if present, otherwise use otherUserName, then fallbacks
          const otherDisplay =
            (c.initiatorName && c.initiatorName.trim()) ||
            c.otherUserName ||
            (c.participantNames && otherUid && c.participantNames[otherUid]) ||
            otherUid ||
            "Unknown";

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
              <div style={{ fontWeight: 600 }}>{otherDisplay}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                <div>
                    <strong>{otherDisplay}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {c.parcelType}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {c.route}
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Message thread */}
      <div
        className="messages-right"
        style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
      >
        {!activeConversation ? (
            <p style={{ padding: 16 }}>Select a conversation</p>
        ) : (
            <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
            }}
            >
            {/* 🧵 Message thread */}
            <div
                style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                }}
            >
                {messages.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No messages yet</p>
                ) : (
                messages.map((m) => (
                    <div
                    key={m.id}
                    style={{
                        textAlign:
                        m.senderId === auth.currentUser.uid ? "right" : "left",
                        marginBottom: 8,
                    }}
                    >
                    <span
                        style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: 12,
                        background:
                            m.senderId === auth.currentUser.uid
                            ? "#bfdbfe"   // light blue for our messages
                            : "#bbf7d0",  // light green for other person's messages
                        color: "#0f172a", // dark text for readability
                        maxWidth: "70%",
                        }}
                    >
                        {/* prefer consistent displayName field on messages, fallback to legacy senderName or conversation map */}
                        <div style={{ fontSize: 12, color: "#0f172a", marginBottom: 6 }}>
                          {(m.displayName ||
                            m.senderName ||
                            (activeConversation?.participantNames && activeConversation.participantNames[m.senderId]) ||
                            m.senderId) && (
                            <strong style={{ fontSize: 12 }}>
                              {m.displayName ||
                                m.senderName ||
                                (activeConversation?.participantNames && activeConversation.participantNames[m.senderId]) ||
                                m.senderId}
                            </strong>
                          )}
                        </div>
                        <div>{m.text}</div>
                    </span>
                    </div>
                ))
                )}
            </div>

            {/* ✍️ Reply box */}
            <form
                onSubmit={sendReplyHandler}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 12,
                  borderTop: "1px solid #e5e7eb",
                }}
            >
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message…"
                  style={{
                    width: "100%",
                    height: 80,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    resize: "none",
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      backgroundColor: "#2563eb",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </div>
            </form>
            </div>
        )}
        </div>

    </div>
  );
};

export default MessagesPage;