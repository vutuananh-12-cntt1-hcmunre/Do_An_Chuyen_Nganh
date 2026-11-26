import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api",
  headers: {
    Accept: "application/json",
  },
});

// Tự động đính kèm JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi phản hồi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isLoginRequest = requestUrl.includes("/auth/login");

    // Không tự đăng xuất khi API upload ảnh bị lỗi.
    // Giữ nguyên token để có thể xem lỗi và xử lý tiếp.
    const isUploadRequest = requestUrl.includes("/dishes/upload");

    if (status === 401 && !isLoginRequest && !isUploadRequest) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      console.warn("Bạn không có quyền thực hiện thao tác này.");
    }

    return Promise.reject(error);
  }
);

export default api;