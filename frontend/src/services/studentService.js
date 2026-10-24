import api from "./api";

const studentService = {
  async getAll() {
    const response = await api.get("/students");
    return response.data;
  },

  async getById(studentId) {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  async create(studentData) {
    const response = await api.post("/students", studentData);
    return response.data;
  },

  async update(studentId, studentData) {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data;
  },

  async delete(studentId) {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },
};

export default studentService;