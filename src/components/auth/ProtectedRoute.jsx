import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
  return <div style={{ padding: "20px" }}>Checking login...</div>;
}


  if (!user) return <Navigate to="/login" />;

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;