import { BrowserRouter as Router, Route, Navigate } from "react-router-dom";
import { Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NavBar from "./components/layout/NavBar";

import GoogleLogin from "./pages/GoogleLogin";
import DashboardPage from "./pages/DashboardPage";
import CourierPage from "./pages/CourierPage";
import CourierForm from "./components/CourierForm";
import CourierDashboardPage from "./pages/CourierDashboardPage";
import ParcelPage from "./pages/ParcelPage";
import ParcelDashboardPage from "./pages/ParcelDashboardPage";
import EditProfilePage from "./pages/EditProfilePage";
import ShowAllUsersPage from "./pages/admin/ShowAllUsersPage";
import { getOrCreateConversation } from "./utils/conversations";
import { auth } from "./config/firebase";
import MessagesPage from "./pages/MessagesPage";

function HomeRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <div style={{ padding: 20 }}>Checking login...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  console.log("App rendered");

  return (
    
    <AuthProvider>
        <Router>
          <NavBar />
          <Routes>
            <Route path="/login" element={<GoogleLogin />} />
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/sender" element={<ProtectedRoute><ParcelPage /></ProtectedRoute>} />
            <Route path="/courier" element={<ProtectedRoute><CourierForm /></ProtectedRoute>} />
            <Route path="/parcels" element={<ProtectedRoute><ParcelDashboardPage /></ProtectedRoute>} />
            <Route path="/couriers" element={<ProtectedRoute><CourierDashboardPage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><ShowAllUsersPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;