import api from "./api";

const authService = {
  async login(username, password) {
    const response = await api.post("/auth/login", {
      username,
      password,
    });

    return response.data;
  },

  async register(payload) {
    // Backend: POST /api/auth/register
    // body: { username, password, email, fullName, phone }
    const response = await api.post("/auth/register", payload);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
