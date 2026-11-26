
import {
  createContext,
  useContext,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

// Đọc phiên đăng nhập đã lưu
function getSavedUser() {
  try {
    const token = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (!token || !savedUser) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      return null;
    }

    const parsedUser = JSON.parse(savedUser);

    if (
      !parsedUser ||
      !parsedUser.username ||
      !Array.isArray(parsedUser.roles)
    ) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      return null;
    }

    return parsedUser;
  } catch {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(
    user && localStorage.getItem("auth_token")
  );

  // Đăng nhập
  const login = async (username, password) => {
    setLoading(true);

    try {
      const response = await authService.login(
        username,
        password
      );

      if (!response?.token) {
        throw new Error("Máy chủ không trả về JWT.");
      }

      const currentUser = {
        userId: response.userId,
        username: response.username,
        fullName: response.fullName,
        roles: Array.isArray(response.roles)
          ? response.roles
          : [],
      };

      if (!currentUser.username || currentUser.roles.length === 0) {
        throw new Error(
          "Thông tin người dùng hoặc quyền truy cập không hợp lệ."
        );
      }

      localStorage.setItem("auth_token", response.token);
      localStorage.setItem(
        "auth_user",
        JSON.stringify(currentUser)
      );

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    setUser(null);
  };

  // Kiểm tra quyền
  const hasRole = (allowedRoles = []) => {
    if (!user || !Array.isArray(user.roles)) {
      return false;
    }

    return user.roles.some((role) =>
      allowedRoles.includes(role)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải được sử dụng bên trong AuthProvider"
    );
  }

  return context;
}
