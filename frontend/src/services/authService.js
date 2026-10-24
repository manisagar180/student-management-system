import api from "./api";

const authService = {
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login", credentials);

    const token = response.data.access_token;

    if (token) {
      localStorage.setItem("access_token", token);
    }

    return response.data;
  },

  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout() {
    localStorage.removeItem("access_token");
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem("access_token"));
  },
};

export default authService;