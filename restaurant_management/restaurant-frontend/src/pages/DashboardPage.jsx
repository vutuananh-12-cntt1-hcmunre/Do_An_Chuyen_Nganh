
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Wallet,
  Users,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

// ==========================================
// HÀM HỖ TRỢ XỬ LÝ DỮ LIỆU
// ==========================================

function unwrap(response) {
  let data = response?.data;

  if (data?.data !== undefined) {
    data = data.data;
  }

  return data;
}

function getArray(response) {
  const data = unwrap(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "0đ";

  return amount.toLocaleString("vi-VN") + "đ";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getOrderStatus(order) {
  return String(
    order.orderStatus ??
    order.status ??
    ""
  ).toUpperCase();
}

function getStatusLabel(status) {
  const labels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PREPARING: "Đang chế biến",
    READY: "Chờ giao món",
    DELIVERING: "Đang giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  return labels[status] || status || "Không xác định";
}

function getStatusStyle(status) {
  const styles = {
    PENDING: "bg-gray-100 text-gray-600",
    CONFIRMED: "bg-indigo-50 text-indigo-700",
    PREPARING: "bg-amber-50 text-amber-700",
    READY: "bg-purple-50 text-purple-700",
    DELIVERING: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
  };

  return styles[status] || "bg-gray-100 text-gray-600";
}

function getOrderCode(order) {
  return (
    order.orderCode ||
    order.orderNumber ||
    (order.orderId ? `ORD-${order.orderId}` : "—")
  );
}

function getCustomerName(order) {
  return (
    order.customerName ||
    order.fullName ||
    order.userFullName ||
    order.customer?.fullName ||
    order.user?.fullName ||
    order.username ||
    order.customer?.username ||
    "Khách hàng"
  );
}

function getOrderType(order) {
  const type = String(order.orderType || "").toUpperCase();

  if (type === "DELIVERY") return "Giao hàng";
  if (type === "DINE_IN") return "Tại bàn";

  return type || "—";
}

function getOrderTotal(order) {
  return (
    order.totalAmount ??
    order.totalPrice ??
    order.finalAmount ??
    0
  );
}

// Kiểm tra một tài khoản có vai trò CUSTOMER hay không.
function isCustomer(user) {
  const rawRoles =
    user.roles ??
    user.roleNames ??
    user.role ??
    [];

  const roles = Array.isArray(rawRoles)
    ? rawRoles
    : [rawRoles];

  return roles.some((role) => {
    const name =
      typeof role === "string"
        ? role
        : role?.roleName ??
          role?.name ??
          role?.authority ??
          "";

    return String(name).toUpperCase() === "CUSTOMER";
  });
}

// ==========================================
// COMPONENT DASHBOARD
// ==========================================

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customerCount, setCustomerCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ==========================================
  // TẢI DỮ LIỆU TỪ BACKEND
  // ==========================================

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrors([]);

      // Mỗi API được xử lý độc lập.
      // Một API lỗi không làm mất dữ liệu của các API còn lại.
      const results = await Promise.allSettled([
        api.get("/statistics/overview"),
        api.get("/orders"),
        api.get("/users"),
      ]);

      const newErrors = [];

      // 1. THỐNG KÊ TỔNG QUAN
      if (results[0].status === "fulfilled") {
        const data = unwrap(results[0].value);
        setOverview(data || null);
      } else {
        newErrors.push("Không tải được thống kê tổng quan.");
      }

      // 2. DANH SÁCH ĐƠN HÀNG
      if (results[1].status === "fulfilled") {
        const data = getArray(results[1].value);

        // Sắp xếp đơn mới nhất lên trước.
        const sortedOrders = [...data].sort((a, b) => {
          const dateA = new Date(
            a.createdAt || a.orderDate || 0
          ).getTime();

          const dateB = new Date(
            b.createdAt || b.orderDate || 0
          ).getTime();

          return dateB - dateA;
        });

        setOrders(sortedOrders);
      } else {
        newErrors.push("Không tải được danh sách đơn hàng.");
      }

      // 3. SỐ LƯỢNG KHÁCH HÀNG
      if (results[2].status === "fulfilled") {
        const users = getArray(results[2].value);

        // Chỉ đếm khi dữ liệu có thông tin vai trò.
        const hasRoleInformation = users.some(
          (user) =>
            user.roles !== undefined ||
            user.roleNames !== undefined ||
            user.role !== undefined
        );

        if (hasRoleInformation) {
          setCustomerCount(
            users.filter(isCustomer).length
          );
        } else {
          setCustomerCount(null);
          newErrors.push(
            "API người dùng chưa trả về thông tin vai trò để xác định số khách hàng."
          );
        }
      } else {
        setCustomerCount(null);
        newErrors.push("Không tải được danh sách khách hàng.");
      }

      setErrors(newErrors);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Lỗi tải Dashboard:", error);

      setErrors([
        "Không thể tải dữ liệu Dashboard. Vui lòng kiểm tra kết nối backend.",
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ==========================================
  // TÍNH TOÁN DỮ LIỆU HIỂN THỊ
  // ==========================================

  const totalOrders = Number(
    overview?.totalOrders ?? orders.length
  );

  const totalRevenue = Number(
    overview?.totalRevenue ?? 0
  );

  const completedOrders = Number(
    overview?.completedOrders ??
    orders.filter(
      (order) => getOrderStatus(order) === "COMPLETED"
    ).length
  );

  const pendingOrders = orders.filter(
    (order) => getOrderStatus(order) === "PENDING"
  ).length;

  const preparingOrders = orders.filter(
    (order) => getOrderStatus(order) === "PREPARING"
  ).length;

  const deliveringOrders = orders.filter(
    (order) => getOrderStatus(order) === "DELIVERING"
  ).length;

  const statusItems = [
    {
      label: "Đơn chờ xác nhận",
      value: pendingOrders,
      color: "bg-amber-500",
    },
    {
      label: "Đơn đang chế biến",
      value: preparingOrders,
      color: "bg-brand",
    },
    {
      label: "Đơn đang giao",
      value: deliveringOrders,
      color: "bg-blue-500",
    },
    {
      label: "Đơn hoàn thành",
      value: completedOrders,
      color: "bg-green-600",
    },
  ];

  const maxStatusValue = Math.max(
    ...statusItems.map((item) => item.value),
    1
  );

  const stats = [
    {
      title: "Tổng đơn hàng",
      value: totalOrders.toLocaleString("vi-VN"),
      icon: ShoppingBag,
    },
    {
      title: "Doanh thu",
      value: formatCurrency(totalRevenue),
      icon: Wallet,
    },
    {
      title: "Khách hàng",
      value:
        customerCount === null
          ? "Chưa xác định"
          : customerCount.toLocaleString("vi-VN"),
      icon: Users,
    },
    {
      title: "Đơn hoàn thành",
      value: completedOrders.toLocaleString("vi-VN"),
      icon: ClipboardCheck,
    },
  ];

  // ==========================================
  // GIAO DIỆN
  // ==========================================

  return (
    <div className="space-y-7">

      {/* TIÊU ĐỀ */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-sm text-gray-400">
            {formatDate(new Date())}
          </p>

          <h1 className="font-heading text-2xl font-extrabold text-brand">
            Tổng quan hoạt động
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Theo dõi tình hình kinh doanh nhà hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboard(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-page disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Làm mới
          </button>

          <Link
          to="/admin/statistics"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[#54115e]"
            >
            Xem báo cáo
          </Link>
        </div>
      </div>

      {/* THÔNG BÁO LỖI API */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                Một số dữ liệu chưa thể tải
              </p>

              <ul className="mt-1 space-y-1 text-xs text-amber-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* THẺ THỐNG KÊ */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-xl border border-border bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <div className="rounded-lg bg-page p-2.5 text-brand">
                  <Icon size={19} />
                </div>
              </div>

              <h2 className="mt-4 break-words font-heading text-2xl font-extrabold text-gray-900">
                {loading ? "..." : item.value}
              </h2>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <Clock3 size={13} />
                Dữ liệu thực tế từ hệ thống
              </div>
            </article>
          );
        })}
      </section>

      {/* ĐƠN HÀNG VÀ TÌNH TRẠNG VẬN HÀNH */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">

        {/* ĐƠN HÀNG GẦN ĐÂY */}
        <article className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-brand">
                Hoạt động đơn hàng
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Các đơn hàng mới nhất từ hệ thống
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-gray-400">
                  <th className="pb-3 font-medium">
                    Mã đơn
                  </th>

                  <th className="pb-3 font-medium">
                    Khách hàng
                  </th>

                  <th className="pb-3 font-medium">
                    Loại đơn
                  </th>

                  <th className="pb-3 font-medium">
                    Tổng tiền
                  </th>

                  <th className="pb-3 font-medium">
                    Trạng thái
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-gray-400"
                    >
                      Đang tải đơn hàng...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-gray-400"
                    >
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order, index) => {
                    const status = getOrderStatus(order);

                    return (
                      <tr
                        key={
                          order.orderId ??
                          order.id ??
                          index
                        }
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-4 font-semibold text-brand">
                          {getOrderCode(order)}
                        </td>

                        <td className="py-4 text-gray-700">
                          {getCustomerName(order)}
                        </td>

                        <td className="py-4 text-gray-500">
                          {getOrderType(order)}
                        </td>

                        <td className="py-4 font-semibold text-gray-800">
                          {formatCurrency(
                            getOrderTotal(order)
                          )}
                        </td>

                        <td className="py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(status)}`}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* TÌNH TRẠNG VẬN HÀNH */}
        <article className="rounded-xl border border-border bg-white p-5">
          <h3 className="font-heading font-bold text-brand">
            Tình trạng vận hành
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Số lượng đơn hàng theo trạng thái
          </p>

          <div className="mt-5 space-y-5">
            {statusItems.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.label}
                  </span>

                  <span className="font-bold text-gray-800">
                    {loading
                      ? "..."
                      : item.value.toLocaleString("vi-VN")}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-page">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{
                      width: loading
                        ? "0%"
                        : `${(item.value / maxStatusValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-page p-3 text-xs text-gray-500">
            <Clock3
              size={16}
              className="shrink-0 text-brand-orange"
            />

            {lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString("vi-VN")}`
              : "Đang chờ dữ liệu từ máy chủ."}
          </div>
        </article>
      </section>
    </div>
  );
}
