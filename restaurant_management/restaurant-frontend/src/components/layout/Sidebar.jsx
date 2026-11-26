
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  CalendarDays,
  CreditCard,
  Users,
  Package,
  Truck,
  MessageSquare,
  ChartNoAxesCombined,
  Settings,
  ChefHat,
  Store,
  Tags,
  Armchair,
  Building2,
  TicketPercent,
  ShoppingCart,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const adminMenuGroups = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "VẬN HÀNH",
    items: [
      {
        label: "Đơn hàng",
        path: "/admin/orders",
        icon: ClipboardList,
      },
      {
        label: "Bán hàng tại quầy",
        path: "/pos",
        icon: ShoppingCart,
      },
      {
        label: "Thực đơn",
        path: "/admin/dishes",
        icon: UtensilsCrossed,
      },
      {
        label: "Danh mục",
        path: "/admin/categories",
        icon: Tags,
      },
      {
        label: "Quản lý bàn",
        path: "/admin/tables",
        icon: Armchair,
      },
      {
        label: "Đặt bàn",
        path: "/admin/reservations",
        icon: CalendarDays,
      },
      {
        label: "Thanh toán",
        path: "/admin/payments",
        icon: CreditCard,
      },
      {
        label: "Bếp (KDS)",
        path: "/kitchen",
        icon: ChefHat,
      },
      {
        label: "Giao hàng",
        path: "/admin/deliveries",
        icon: Truck,
      },
    ],
  },
  {
    title: "QUẢN LÝ",
    items: [
      {
        label: "Khách hàng & nhân viên",
        path: "/admin/users",
        icon: Users,
      },
      {
        label: "Nguyên liệu",
        path: "/admin/ingredients",
        icon: Package,
      },
      {
        label: "Nhà cung cấp",
        path: "/admin/suppliers",
        icon: Building2,
      },
      {
        label: "Phiếu nhập kho",
        path: "/admin/purchase-receipts",
        icon: ClipboardList,
      },
      {
        label: "Mã khuyến mãi",
        path: "/admin/promotions",
        icon: TicketPercent,
      },
      {
        label: "Phản hồi khách hàng",
        path: "/admin/feedbacks",
        icon: MessageSquare,
      },
      {
        label: "Thống kê",
        path: "/admin/statistics",
        icon: ChartNoAxesCombined,
      },
    ],
  },
];

const employeeMenuGroups = [
  {
    title: "CÔNG VIỆC",
    items: [
      {
        label: "Tổng quan nhân viên",
        path: "/employee",
        icon: LayoutDashboard,
      },
      {
        label: "Bán hàng tại quầy",
        path: "/pos",
        icon: ShoppingCart,
      },
      {
        label: "Đơn hàng tại quầy",
        path: "/employee/orders",
        icon: ClipboardList,
      },
      {
        label: "Quản lý bếp (KDS)",
        path: "/kitchen",
        icon: ChefHat,
      },
      {
        label: "Đơn giao hàng",
        path: "/employee/deliveries",
        icon: Truck,
      },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();

  const roles = (user?.roles || []).map((role) =>
    String(role).replace("ROLE_", "").toUpperCase()
  );

  const isAdminOrManager =
    roles.includes("ADMIN") || roles.includes("MANAGER");

  const menuGroups = isAdminOrManager
    ? adminMenuGroups
    : employeeMenuGroups;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col border-r border-border bg-white">
      {/* LOGO */}
      <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-border px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
          <Store size={21} />
        </div>

        <div>
          <h1 className="font-heading text-base font-extrabold text-brand">
            Bếp Mận & Lửa
          </h1>

          <p className="text-[10px] font-semibold tracking-[2px] text-gray-400">
            RESTAURANT SYSTEM
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.8px] text-gray-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={
                      item.path === "/admin" ||
                      item.path === "/employee" ||
                      item.path === "/pos" ||
                      item.path === "/kitchen"
                    }
                    className={({ isActive }) =>
                      [
                        "sidebar-nav-link",
                        isActive ? "active" : "",
                      ].join(" ")
                    }
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* SETTINGS */}
      <div className="shrink-0 border-t border-border p-4">
        <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-500">
          <Settings size={18} />
          <span>Cài đặt</span>
        </div>
      </div>
    </aside>
  );
}
