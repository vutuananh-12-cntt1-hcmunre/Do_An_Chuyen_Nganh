import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

// =========================
// AUTH
// =========================
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ProfilePage from "../pages/ProfilePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

// =========================
// ADMIN / MANAGER
// =========================
import DashboardPage from "../pages/DashboardPage";
import FeedbackManagementPage from "../pages/admin/FeedbackManagementPage";
import StatisticsPage from "../pages/admin/StatisticsPage";
import PurchaseReceiptManagementPage from "../pages/admin/PurchaseReceiptManagementPage";
import PromotionManagementPage from "../pages/admin/PromotionManagementPage";
import DishManagementPage from "../pages/admin/DishManagementPage";
import TableManagementPage from "../pages/admin/TableManagementPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import CategoryManagementPage from "../pages/admin/CategoryManagementPage";
import ReservationManagementPage from "../pages/admin/ReservationManagementPage";
import PaymentManagementPage from "../pages/admin/PaymentManagementPage";
import OrderManagementPage from "../pages/admin/OrderManagementPage";
import DeliveryManagementPage from "../pages/admin/DeliveryManagementPage";
import IngredientManagementPage from "../pages/admin/IngredientManagementPage";
import SupplierManagementPage from "../pages/admin/SupplierManagementPage";

// =========================
// EMPLOYEE
// =========================
import EmployeeDashboardPage from "../pages/employee/EmployeeDashboardPage";
import EmployeeOrderManagementPage from "../pages/employee/EmployeeOrderManagementPage";
import EmployeeDeliveryPage from "../pages/employee/EmployeeDeliveryPage";
import PosPage from "../pages/pos/PosPage";

// =========================
// KITCHEN
// =========================
import KitchenPage from "../pages/kitchen/KitchenPage";

// =========================
// CUSTOMER
// =========================
import CustomerPage from "../pages/CustomerPage";
import CustomerOrdersPage from "../pages/CustomerOrdersPage";
import ReservationPage from "../pages/ReservationPage";

// =========================
// XÁC ĐỊNH TRANG CHỦ THEO VAI TRÒ
// =========================
function getHomePath(roles = []) {
  if (roles.includes("ADMIN") || roles.includes("MANAGER")) {
    return "/admin";
  }

  if (roles.includes("EMPLOYEE")) {
    return "/employee";
  }

  if (roles.includes("CUSTOMER")) {
    return "/customer";
  }

  return "/login";
}

// =========================
// ĐIỀU HƯỚNG TRANG CHỦ
// =========================
function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={getHomePath(user?.roles || [])}
      replace
    />
  );
}

// =========================
// APP ROUTES
// =========================
export default function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          AUTH
      ========================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* =========================
          ĐIỀU HƯỚNG TRANG CHỦ
      ========================= */}
      <Route path="/" element={<HomeRedirect />} />

      {/* =========================
          HỒ SƠ — MỌI ROLE ĐÃ ĐĂNG NHẬP
      ========================= */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE", "CUSTOMER"]}
          />
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* =========================
          ADMIN VÀ MANAGER
      ========================= */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "MANAGER"]}
          />
        }
      >
        <Route element={<AppLayout />}>
          {/* TỔNG QUAN */}
          <Route
            path="/admin"
            element={<DashboardPage />}
          />

          {/* QUẢN LÝ KINH DOANH */}
          <Route
            path="/admin/orders"
            element={<OrderManagementPage />}
          />

          <Route
            path="/admin/payments"
            element={<PaymentManagementPage />}
          />

          <Route
            path="/admin/deliveries"
            element={<DeliveryManagementPage />}
          />

          <Route
            path="/admin/reservations"
            element={<ReservationManagementPage />}
          />

          {/* QUẢN LÝ THỰC ĐƠN */}
          <Route
            path="/admin/categories"
            element={<CategoryManagementPage />}
          />

          <Route
            path="/admin/dishes"
            element={<DishManagementPage />}
          />

          <Route
            path="/admin/tables"
            element={<TableManagementPage />}
          />

          {/* QUẢN LÝ NGƯỜI DÙNG VÀ KHUYẾN MÃI */}
          <Route
            path="/admin/users"
            element={<UserManagementPage />}
          />

          <Route
            path="/admin/promotions"
            element={<PromotionManagementPage />}
          />

          {/* QUẢN LÝ KHO */}
          <Route
            path="/admin/ingredients"
            element={<IngredientManagementPage />}
          />

          <Route
            path="/admin/purchase-receipts"
            element={<PurchaseReceiptManagementPage />}
          />

          <Route
            path="/admin/suppliers"
            element={<SupplierManagementPage />}
          />

          <Route
            path="/admin/inventory"
            element={<Navigate to="/admin/ingredients" replace />}
          />

          {/* BÁO CÁO */}
          <Route
            path="/admin/feedbacks"
            element={<FeedbackManagementPage />}
          />

          <Route
            path="/admin/statistics"
            element={<StatisticsPage />}
          />
        </Route>
      </Route>

      {/* =========================
          ADMIN, MANAGER VÀ EMPLOYEE
      ========================= */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}
          />
        }
      >
        <Route element={<AppLayout />}>
          {/* TỔNG QUAN NHÂN VIÊN */}
          <Route
            path="/employee"
            element={<EmployeeDashboardPage />}
          />

          {/* QUẢN LÝ ĐƠN HÀNG */}
          <Route
            path="/employee/orders"
            element={<EmployeeOrderManagementPage />}
          />

          {/* BÁN HÀNG TẠI QUẦY */}
          <Route
            path="/pos"
            element={<PosPage />}
          />

          {/* QUẢN LÝ BẾP */}
          <Route
            path="/kitchen"
            element={<KitchenPage />}
          />

          {/* QUẢN LÝ GIAO HÀNG */}
          <Route
            path="/employee/deliveries"
            element={<EmployeeDeliveryPage />}
          />

          {/* TƯƠNG THÍCH ROUTE GIAO HÀNG CŨ */}
          <Route
            path="/deliveries"
            element={<DeliveryManagementPage />}
          />
        </Route>
      </Route>

      {/* =========================
          KHÁCH HÀNG
      ========================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]} />
        }
      >
        <Route
          path="/customer"
          element={<CustomerPage />}
        />

        <Route
          path="/customer/orders"
          element={<CustomerOrdersPage />}
        />

        <Route
          path="/customer/reservations"
          element={<ReservationPage />}
        />
      </Route>

      {/* =========================
          403 — KHÔNG CÓ QUYỀN
      ========================= */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* =========================
          404 — KHÔNG TÌM THẤY TRANG
      ========================= */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
