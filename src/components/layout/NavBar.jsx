import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SignOut from "../SignOut";
import { Navigate } from "react-router-dom";

const NavBar = () => {
  const { user, role } = useAuth();
  console.log("NavBar useAuth:", { user, role }); // debug line

//   if (!user) return null;
  if (!user) return <Navigate to="/login" replace />;

//   // Admin: only show admin links
//   if (role === "admin") {
//     return (
//       <nav className="navbar">
//         <Link to="/admin">Admin Dashboard</Link>
//         <Link to="/admin/users">Show All Users</Link>
//         <SignOut />
//       </nav>
//     );
//   }

  return (
    <nav className="navbar">
      {/* Regular user links */}
      <Link to="/sender">Send Parcel</Link>
      <Link to="/courier">Courier Form</Link>
      <Link to="/parcels">Parcel Dashboard</Link>
      <Link to="/couriers">Courier Dashboard</Link>
      <Link to="/profile/edit">Profile</Link>

      {/* Admin-only links */}
      {role === "admin" && (
        <>
          <Link to="/admin">Admin Dashboard</Link>
          <Link to="/admin/users">Show All Users</Link>
        </>
      )}

      <SignOut />
    </nav>
  );
};

export default NavBar;