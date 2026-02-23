import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SignOut from "../SignOut";
import SahaayLogo from "../../assets/Sahaay.png";

const NavBar = () => {
  const { user, role } = useAuth();
  console.log("NavBar useAuth:", { user, role }); // debug line

// If user is not signed in, show a simple nav with a Login link.
  if (!user) {
    return (
      <>
      </>
    );
  }

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
    <>
      <div className="top-panel">
        <img src={SahaayLogo} alt="Sahaay" className="nav-logo" />
      </div>
      <nav className="navbar">
      {/* Regular user links */}
      <Link to="/sender">Send Parcel</Link>
      <Link to="/companion">Become a Saathi</Link>
      <Link to="/parcels">Parcel Dashboard</Link>
      <Link to="/companions">Saathi Dashboard</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/profile/edit">Profile</Link>

      {/* Admin-only links */}
      {role === "admin" && (
        <>
          <Link to="/admin">Admin Dashboard</Link>
          <Link to="/admin/users">Show All Users</Link>
        </>
      )}

      <div className="nav-right">
        <SignOut />
      </div>
    </nav>
    </>
  );
};

export default NavBar;