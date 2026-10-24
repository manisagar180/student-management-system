import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import studentService from "../services/studentService";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  course: "",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load students.");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingId) {
        await studentService.update(editingId, form);
      } else {
        await studentService.create(form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save student.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      department: student.department || "",
      course: student.course || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await studentService.delete(id);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete student.");
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.container}>
        <h1>Student Management</h1>
        <p style={styles.subtitle}>Add, view, update and delete students.</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>{editingId ? "Update Student" : "Add New Student"}</h2>

          {Object.keys(emptyForm).map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              type={field === "email" ? "email" : "text"}
              value={form[field]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              required={field === "name" || field === "email"}
              style={styles.input}
            />
          ))}

          <div style={styles.actions}>
            <button disabled={loading} style={styles.save}>
              {loading ? "Saving..." : editingId ? "Update Student" : "Add Student"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                style={styles.cancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2>Student List ({students.length})</h2>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone || "-"}</td>
                  <td>{student.department || "-"}</td>
                  <td>{student.course || "-"}</td>
                  <td>
                    <button onClick={() => handleEdit(student)} style={styles.edit}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(student.id)} style={styles.delete}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan="7" style={styles.empty}>No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f1f5f9" },
  container: { maxWidth: "1200px", margin: "auto", padding: "30px 20px" },
  subtitle: { color: "#64748b" },
  form: {
    background: "#fff", padding: "24px", borderRadius: "12px",
    margin: "25px 0", display: "grid", gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  input: { padding: "12px", border: "1px solid #cbd5e1", borderRadius: "7px" },
  actions: { display: "flex", gap: "10px", alignItems: "center" },
  save: { padding: "12px 18px", background: "#2563eb", color: "#fff", border: 0, borderRadius: "7px", cursor: "pointer" },
  cancel: { padding: "12px 18px", background: "#64748b", color: "#fff", border: 0, borderRadius: "7px", cursor: "pointer" },
  tableWrapper: { overflowX: "auto", background: "#fff", borderRadius: "10px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  edit: { margin: "4px", padding: "7px 10px", background: "#2563eb", color: "#fff", border: 0, borderRadius: "5px", cursor: "pointer" },
  delete: { margin: "4px", padding: "7px 10px", background: "#dc2626", color: "#fff", border: 0, borderRadius: "5px", cursor: "pointer" },
  empty: { textAlign: "center", padding: "20px" },
  error: { color: "#b91c1c", background: "#fee2e2", padding: "12px", borderRadius: "8px" },
};

export default Students;