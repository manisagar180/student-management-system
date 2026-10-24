import { NavLink, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#ffffff" : "#cbd5e1",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    background: isActive ? "#334155" : "transparent",
    fontWeight: 500,
  });

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>Student Management</div>

      <div style={styles.links}>
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/students" style={linkStyle}>
          Students
        </NavLink>

        <NavLink to="/courses" style={linkStyle}>
          Courses
        </NavLink>
      </div>

      <button onClick={handleLogout} style={styles.logout}>
        Logout
      </button>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 5%",
    background: "#0f172a",
    color: "#ffffff",
    gap: "20px",
    flexWrap: "wrap",
  },
  brand: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  links: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  logout: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Navbar;