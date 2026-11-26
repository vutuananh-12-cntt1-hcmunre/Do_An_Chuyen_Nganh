
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

const pageTitles = [
  { path: "/admin", title: "Bảng điều khiển" },
  { path: "/admin/orders", title: "Quản lý đơn hàng" },
  { path: "/admin/payments", title: "Quản lý thanh toán" },
  { path: "/admin/deliveries", title: "Quản lý giao hàng" },
  { path: "/admin/reservations", title: "Quản lý đặt bàn" },
  { path: "/admin/categories", title: "Quản lý danh mục" },
  { path: "/admin/dishes", title: "Quản lý thực đơn" },
  { path: "/admin/tables", title: "Quản lý bàn" },
  { path: "/admin/users", title: "Quản lý người dùng" },
  { path: "/admin/promotions", title: "Quản lý khuyến mãi" },
  { path: "/admin/ingredients", title: "Quản lý nguyên liệu" },
  { path: "/admin/purchase-receipts", title: "Quản lý phiếu nhập kho" },
  { path: "/admin/suppliers", title: "Quản lý nhà cung cấp" },
  { path: "/admin/feedbacks", title: "Phản hồi khách hàng" },
  { path: "/admin/statistics", title: "Thống kê kinh doanh" },

  { path: "/employee", title: "Tổng quan nhân viên" },
  { path: "/employee/orders", title: "Quản lý đơn hàng tại quầy" },
  { path: "/employee/deliveries", title: "Quản lý đơn giao hàng" },

  { path: "/pos", title: "Bán hàng tại quầy" },
  { path: "/kitchen", title: "Quản lý bếp (KDS)" },
  { path: "/deliveries", title: "Quản lý giao hàng" },

  { path: "/customer", title: "Trang khách hàng" },
  { path: "/customer/orders", title: "Đơn hàng của tôi" },
  { path: "/customer/reservations", title: "Đặt bàn" },
];

function getPageTitle(pathname) {
  const matchedPage = pageTitles.find(
    (page) =>
      page.path === pathname ||
      (page.path !== "/admin" &&
        page.path !== "/employee" &&
        page.path !== "/customer" &&
        pathname.startsWith(`${page.path}/`))
  );

  return matchedPage?.title || "Hệ thống quản lý";
}

export default function Header() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fullName =
    user?.fullName || user?.username || "Người dùng";

  const firstLetter = fullName.charAt(0).toUpperCase();

  const roles = (user?.roles || []).map((role) =>
    String(role).replace("ROLE_", "").toUpperCase()
  );

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border bg-white px-8">
      {/* PAGE TITLE */}
      <div>
        <p className="text-xs text-gray-400">
          Hệ thống quản lý
        </p>

        <h2 className="font-heading text-lg font-bold text-brand">
          {pageTitle}
        </h2>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-5">
        {/* SEARCH */}
        <div className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 md:flex">
          <Search size={16} className="text-gray-400" />

          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-40 bg-transparent text-xs outline-none"
          />
        </div>

        {/* NOTIFICATION */}
        <button
          type="button"
          className="relative text-gray-500 transition hover:text-brand"
          aria-label="Thông báo"
        >
          <Bell size={20} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-orange" />
        </button>

        {/* USER INFO */}
        <div className="flex items-center gap-3 border-l border-border pl-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">
            {firstLetter}
          </div>

          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-800">
              {fullName}
            </p>

            <p className="text-[10px] text-gray-400">
              {roles.join(", ")}
            </p>
          </div>

          <ChevronDown
            size={15}
            className="text-gray-400"
          />

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">
              Đăng xuất
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
