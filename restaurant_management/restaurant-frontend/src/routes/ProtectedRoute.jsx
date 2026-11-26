
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function getHomePath(roles = []) {
  if (roles.includes("ADMIN") || roles.includes("MANAGER")) {
    return "/admin";
  }

  if (roles.includes("EMPLOYEE")) {
    return "/pos";
  }

  if (roles.includes("CUSTOMER")) {
    return "/customer";
  }

  return "/login";
}

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const hasPermission =
    allowedRoles.length === 0 ||
    user.roles?.some((role) => allowedRoles.includes(role));

  if (!hasPermission) {
    return (
      <Navigate
        to={getHomePath(user.roles)}
        replace
      />
    );
  }

  return <Outlet />;
}
