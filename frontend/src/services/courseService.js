import api from "./api";

const courseService = {
  async getAll() {
    const response = await api.get("/courses");
    return response.data;
  },

  async getById(courseId) {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  async create(courseData) {
    const response = await api.post("/courses", courseData);
    return response.data;
  },

  async update(courseId, courseData) {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  },

  async delete(courseId) {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  async enrollStudent(courseId, studentId) {
    const response = await api.post(
      `/courses/${courseId}/students`,
      { student_id: studentId }
    );
    return response.data;
  },

  async getEnrolledStudents(courseId) {
    const response = await api.get(`/courses/${courseId}/students`);
    return response.data;
  },
};

export default courseService;