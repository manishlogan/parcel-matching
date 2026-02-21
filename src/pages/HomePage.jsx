import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import PageLayout from "../components/layout/PageLayout";

const HomePage = () => {
  const [counts, setCounts] = useState({ users: 0, parcels: 0, companions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);

      const next = { users: null, parcels: null, companions: null };

      // Fetch users count
      try {
        const snap = await getDocs(collection(db, "users"));
        next.users = snap.size || snap.docs.length;
      } catch (err) {
        console.warn("Unable to read users collection:", err);
        next.users = null; // restricted
      }

      // Fetch parcels count
      try {
        const snap = await getDocs(collection(db, "parcels"));
        next.parcels = snap.size || snap.docs.length;
      } catch (err) {
        console.warn("Unable to read parcels collection:", err);
        next.parcels = null;
      }

      // Fetch companions (couriers) count
      try {
        const snap = await getDocs(collection(db, "couriers"));
        next.companions = snap.size || snap.docs.length;
      } catch (err) {
        console.warn("Unable to read couriers collection:", err);
        next.companions = null;
      }

      setCounts((c) => ({ ...c, ...next }));
      setLoading(false);
    };

    fetchCounts();
  }, []);

  return (
    <PageLayout title="">
      {loading ? (
        <p>Loading summary...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{counts.users}</div>
            <div className="stat-label">Registered Users</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{counts.parcels}</div>
            <div className="stat-label">Registered Parcels</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{counts.companions}</div>
            <div className="stat-label">Registered Companions</div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default HomePage;
