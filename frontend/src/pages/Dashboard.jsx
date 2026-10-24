import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import studentService from "../services/studentService";
import courseService from "../services/courseService";
import authService from "../services/authService";

function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [students, courses, profile] = await Promise.all([
          studentService.getAll(),
          courseService.getAll(),
          authService.getProfile(),
        ]);

        setStudentCount(Array.isArray(students) ? students.length : 0);
        setCourseCount(Array.isArray(courses) ? courses.length : 0);
        setUser(profile);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load dashboard information."
        );
      }
    };

    loadDashboard();
  }, []);

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.container}>
        <h1>Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome{user?.full_name ? `, ${user.full_name}` : ""}! Here's your
          system overview.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>Total Students</h3>
            <p style={styles.number}>{studentCount}</p>
            <Link to="/students">Manage Students →</Link>
          </div>

          <div style={styles.card}>
            <h3>Total Courses</h3>
            <p style={styles.number}>{courseCount}</p>
            <Link to="/courses">Manage Courses →</Link>
          </div>
        </div>

        <section style={styles.section}>
          <h2>Quick Actions</h2>
          <div style={styles.actions}>
            <Link to="/students" style={styles.actionButton}>
              Manage Students
            </Link>

            <Link to="/courses" style={styles.actionButton}>
              Manage Courses
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
  },
  container: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "35px 20px",
  },
  subtitle: {
    color: "#64748b",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
  },
  number: {
    fontSize: "38px",
    fontWeight: "bold",
    color: "#2563eb",
  },
  section: {
    marginTop: "35px",
  },
  actions: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  actionButton: {
    padding: "13px 20px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    padding: "12px",
    borderRadius: "8px",
  },
};

export default Dashboard;