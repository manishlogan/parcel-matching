import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

// Add parcel
export const addParcel = (data) =>
  addDoc(collection(db, "parcels"), data);

// Add courier
export const addCourier = (data) =>
  addDoc(collection(db, "couriers"), data);

// Get user parcels
export const getUserParcels = (uid) => {
  const q = query(collection(db, "parcels"), where("senderId", "==", uid));
  return getDocs(q);
};

// Get user couriers
export const getUserCouriers = (uid) => {
  const q = query(collection(db, "couriers"), where("courierId", "==", uid));
  return getDocs(q);
};