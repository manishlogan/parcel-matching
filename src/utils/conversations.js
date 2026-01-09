import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Create or get existing conversation between two users
 */
export const getOrCreateConversation = async ({
  currentUserId,
  targetUserId,
  parcelId = null,
  courierId = null,
}) => {
  if (!currentUserId || !targetUserId) {
    throw new Error("Missing user ids");
  }

  // 🚫 Prevent self messaging
  if (currentUserId === targetUserId) {
    throw new Error("Cannot create conversation with yourself");
  }

  // 🔍 Look for existing conversation
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUserId)
  );

  const snapshot = await getDocs(q);

  const existing = snapshot.docs.find((doc) => {
    const data = doc.data();
    return (
      data.participants.includes(targetUserId) &&
      (parcelId ? data.parcelId === parcelId : true) &&
      (courierId ? data.courierId === courierId : true)
    );
  });

  if (existing) {
    return existing.id;
  }

  // 🆕 Create new conversation
  const docRef = await addDoc(collection(db, "conversations"), {
    participants: [currentUserId, targetUserId],
    parcelId,
    courierId,
    lastMessage: "",
    lastMessageAt: null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};
