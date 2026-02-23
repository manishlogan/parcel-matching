import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

const ShowAllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  const showToast = (message, type = "info", ms = 3000) => {
    setToast({ visible: true, message, type });
    if (ms && ms > 0) {
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), ms);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setUnauthorized(false);
      setError(null);
      showToast("Loading...", "info", 0);
      try {
        if (!auth.currentUser) {
          setUsers([]);
          setUnauthorized(true);
          showToast("Unauthorized", "error");
          return;
        }

        // log claims to help debugging
        const idTokenResult = await auth.currentUser.getIdTokenResult();
        const claims = idTokenResult.claims || {};
        const isAdminClaim = claims.admin === true || (typeof claims.role === 'string' && claims.role.toLowerCase() === 'admin');
        if (!isAdminClaim) {
          setUsers([]);
          setUnauthorized(true);
          showToast("Unauthorized", "error");
          return;
        }

        const snapshot = await getDocs(collection(db, "users"));
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError(err.message || String(err));
        showToast(err.message || String(err), "error");
      } finally {
        setLoading(false);
        // hide loading toast when finished
        setToast((t) => ({ ...t, visible: false }));
      }
    };

    fetchUsers();
  }, []);

  return (
    <PageLayout title="All Users"> 
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PageLayout>
  );
};

export default ShowAllUsersPage;
