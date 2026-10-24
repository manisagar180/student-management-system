import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import courseService from "../services/courseService";
import studentService from "../services/studentService";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  duration: "",
};

function Courses() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [courseData, studentData] = await Promise.all([
        courseService.getAll(),
        studentService.getAll(),
      ]);

      setCourses(courseData);
      setStudents(studentData);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await courseService.update(editingId, form);
        setMessage("Course updated successfully.");
      } else {
        await courseService.create(form);
        setMessage("Course created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save course.");
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setForm({
      name: course.name || "",
      code: course.code || "",
      description: course.description || "",
      duration: course.duration || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await courseService.delete(id);
      setMessage("Course deleted successfully.");
      await loadData();

      if (String(selectedCourse) === String(id)) {
        setSelectedCourse("");
        setEnrolledStudents([]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete course.");
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await courseService.enrollStudent(
        selectedCourse,
        Number(selectedStudent)
      );

      setMessage("Student enrolled successfully.");
      await loadEnrolled(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.detail || "Enrollment failed.");
    }
  };

  const loadEnrolled = async (courseId) => {
    if (!courseId) {
      setError("Please select a course first.");
      return;
    }

    setError("");
    setMessage("");

    try {
      const data = await courseService.getEnrolledStudents(courseId);
      setEnrolledStudents(data);
      setMessage("Enrolled students loaded successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load enrollments."
      );
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.container}>
        <h1>Course Management</h1>
        <p style={styles.subtitle}>
          Manage courses and student enrollments.
        </p>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>{editingId ? "Update Course" : "Add New Course"}</h2>

          {Object.keys(emptyForm).map((field) => (
            <input
              key={field}
              placeholder={
                field.charAt(0).toUpperCase() + field.slice(1)
              }
              value={form[field]}
              required={field === "name" || field === "code"}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              style={styles.input}
            />
          ))}

          <div>
            <button type="submit" style={styles.primary}>
              {editingId ? "Update Course" : "Add Course"}
            </button>

            {editingId && (
              <button
                type="button"
                style={styles.secondary}
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2>Available Courses ({courses.length})</h2>

        <div style={styles.grid}>
          {courses.map((course) => (
            <div key={course.id} style={styles.card}>
              <h3>{course.name}</h3>
              <p><b>Code:</b> {course.code}</p>
              <p>{course.description || "No description available."}</p>
              <p><b>Duration:</b> {course.duration || "-"}</p>

              <button
                type="button"
                style={styles.edit}
                onClick={() => handleEdit(course)}
              >
                Edit
              </button>

              <button
                type="button"
                style={styles.delete}
                onClick={() => handleDelete(course.id)}
              >
                Delete
              </button>
            </div>
          ))}

          {courses.length === 0 && <p>No courses available.</p>}
        </div>

        <section style={styles.enrollment}>
          <h2>Enroll Student in Course</h2>

          <form onSubmit={handleEnroll} style={styles.enrollForm}>
            <select
              value={selectedCourse}
              onChange={(e) => {
                console.log("Selected Course ID:", e.target.value);
                setSelectedCourse(e.target.value);
                setEnrolledStudents([]);
                setError("");
                setMessage("");
              }}
              required
              style={styles.input}
            >
              <option value="">Select Course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">Select Student</option>

              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} (ID: {student.id})
                </option>
              ))}
            </select>

            <button type="submit" style={styles.primary}>
              Enroll Student
            </button>
          </form>

          <button
            type="button"
            style={{
              ...styles.secondary,
              opacity: selectedCourse ? 1 : 0.6,
              cursor: selectedCourse ? "pointer" : "not-allowed",
            }}
            onClick={() => loadEnrolled(selectedCourse)}
          >
            View Enrolled Students
          </button>

          <div style={styles.enrolledList}>
            <h3>Enrolled Students</h3>

            {enrolledStudents.length > 0 ? (
              enrolledStudents.map((item, index) => (
                <p key={item.id || index}>
                  Student ID: {item.student_id}
                </p>
              ))
            ) : (
              <p>No enrolled students to display.</p>
            )}
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
    padding: "30px 20px",
  },
  subtitle: {
    color: "#64748b",
  },
  form: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    display: "grid",
    gap: "12px",
    margin: "25px 0",
  },
  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    margin: "5px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
  },
  primary: {
    padding: "11px 16px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: "7px",
    cursor: "pointer",
    margin: "5px",
  },
  secondary: {
    padding: "11px 16px",
    background: "#64748b",
    color: "#fff",
    border: 0,
    borderRadius: "7px",
    cursor: "pointer",
    margin: "5px",
  },
  edit: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: "5px",
    margin: "5px",
    cursor: "pointer",
  },
  delete: {
    padding: "8px 12px",
    background: "#dc2626",
    color: "#fff",
    border: 0,
    borderRadius: "5px",
    margin: "5px",
    cursor: "pointer",
  },
  enrollment: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    marginTop: "35px",
  },
  enrollForm: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  enrolledList: {
    marginTop: "20px",
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    padding: "12px",
  },
  success: {
    color: "#166534",
    background: "#dcfce7",
    padding: "12px",
  },
};

export default Courses;