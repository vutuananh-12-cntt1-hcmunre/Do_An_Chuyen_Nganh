
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ClipboardList,
  CookingPot,
  RefreshCw,
  ShoppingCart,
  Truck,
  Utensils,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const STATUS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY: "Sẵn sàng",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_STYLE = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-orange-50 text-orange-700",
  READY: "bg-emerald-50 text-emerald-700",
  DELIVERING: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

function getOrdersFromResponse(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function getOrderStatus(order) {
  return String(
    order?.orderStatus ??
    order?.status ??
    ""
  ).toUpperCase();
}

function getOrderDate(order) {
  const value =
    order?.createdAt ??
    order?.created_at ??
    order?.orderDate ??
    order?.order_date;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatTime(value) {
  const date = getOrderDate(value);

  if (!date) return "Không rõ thời gian";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function getOrderCode(order) {
  return (
    order?.orderCode ??
    order?.order_code ??
    (order?.orderId ? `#${order.orderId}` : "Chưa có mã")
  );
}

function getOrderType(order) {
  const type = String(order?.orderType ?? order?.order_type ?? "").toUpperCase();

  if (type === "DINE_IN") return "Tại bàn";
  if (type === "DELIVERY") return "Giao hàng";

  return type || "Không xác định";
}

function StatCard({ title, value, description, icon: Icon, color }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${colorStyles[color] || colorStyles.blue}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <ClipboardList size={34} className="text-gray-300" />
      <p className="mt-3 text-sm text-gray-500">{message}</p>
    </div>
  );
}

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");
      setOrders(getOrdersFromResponse(response));
    } catch (err) {
      console.error("Lỗi tải tổng quan nhân viên:", err);

      setOrders([]);
      setError(
        err?.response?.data?.message ||
        "Không thể tải dữ liệu đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const todayOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const date = getOrderDate(order);

      return (
        date &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [orders]);

  const stats = useMemo(() => {
    const pending = todayOrders.filter(
      (order) => getOrderStatus(order) === "PENDING"
    ).length;

    const processing = todayOrders.filter((order) =>
      ["CONFIRMED", "PREPARING", "READY", "DELIVERING"].includes(
        getOrderStatus(order)
      )
    ).length;

    const completed = todayOrders.filter(
      (order) => getOrderStatus(order) === "COMPLETED"
    ).length;

    return {
      total: todayOrders.length,
      pending,
      processing,
      completed,
    };
  }, [todayOrders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = getOrderDate(a)?.getTime() ?? 0;
        const dateB = getOrderDate(b)?.getTime() ?? 0;
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [orders]);

  const needsAttention = useMemo(() => {
    return [...orders]
      .filter((order) =>
        ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(
          getOrderStatus(order)
        )
      )
      .sort((a, b) => {
        const dateA = getOrderDate(a)?.getTime() ?? 0;
        const dateB = getOrderDate(b)?.getTime() ?? 0;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [orders]);

  const shortcuts = [
    {
      title: "Bán hàng tại quầy",
      description: "Tạo đơn hàng và phục vụ khách",
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
      path: "/pos",
    },
    {
      title: "Quản lý bếp",
      description: "Theo dõi món ăn đang chế biến",
      icon: CookingPot,
      color: "bg-orange-50 text-orange-600",
      path: "/kitchen",
    },
    {
      title: "Đơn giao hàng",
      description: "Theo dõi và xử lý giao hàng",
      icon: Truck,
      color: "bg-violet-50 text-violet-600",
      path: "/employee/deliveries",
    },
    {
      title: "Quản lý đơn hàng",
      description: "Xem danh sách đơn hàng",
      icon: ClipboardList,
      color: "bg-emerald-50 text-emerald-600",
      path: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Utensils size={16} />
            Khu vực nhân viên
          </div>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Tổng quan nhân viên
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Theo dõi tình hình đơn hàng và truy cập nhanh các chức năng.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* LỖI TẢI DỮ LIỆU */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={loadOrders}
            className="font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* THỐNG KÊ */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Tình hình hôm nay</h2>
          <span className="text-xs text-gray-500">
            {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Tổng đơn hôm nay"
            value={loading ? "—" : stats.total}
            description="Số đơn được tạo trong ngày"
            icon={ClipboardList}
            color="blue"
          />
          <StatCard
            title="Đơn chờ xác nhận"
            value={loading ? "—" : stats.pending}
            description="Cần tiếp nhận và xác nhận"
            icon={Clock3}
            color="amber"
          />
          <StatCard
            title="Đơn đang xử lý"
            value={loading ? "—" : stats.processing}
            description="Đang chuẩn bị hoặc giao hàng"
            icon={Activity}
            color="orange"
          />
          <StatCard
            title="Đơn hoàn thành"
            value={loading ? "—" : stats.completed}
            description="Đã hoàn tất trong ngày"
            icon={CheckCircle2}
            color="green"
          />
        </div>
      </section>

      {/* LỐI TẮT */}
      <section>
        <h2 className="mb-3 font-semibold text-gray-900">
          Truy cập nhanh
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.description}
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-1"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* ĐƠN HÀNG */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">
                Đơn hàng gần đây
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Những đơn hàng mới được ghi nhận
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="text-sm font-medium text-brand hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {loading ? (
            <EmptyState message="Đang tải danh sách đơn hàng..." />
          ) : recentOrders.length === 0 ? (
            <EmptyState message="Chưa có đơn hàng để hiển thị." />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="px-3 py-3 font-medium">Mã đơn</th>
                    <th className="px-3 py-3 font-medium">Loại đơn</th>
                    <th className="px-3 py-3 font-medium">Thời gian</th>
                    <th className="px-3 py-3 font-medium">Trạng thái</th>
                    <th className="px-3 py-3 text-right font-medium">Tổng tiền</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order, index) => {
                    const status = getOrderStatus(order);

                    return (
                      <tr
                        key={order.orderId ?? order.order_id ?? index}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-3 py-3 font-semibold text-gray-800">
                          {getOrderCode(order)}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {getOrderType(order)}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {formatTime(order)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              STATUS_STYLE[status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {STATUS[status] || status || "Chưa xác định"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-gray-800">
                          {formatCurrency(
                            order.totalAmount ??
                            order.total_amount ??
                            order.finalAmount
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm xl:col-span-2">
          <div>
            <h2 className="font-semibold text-gray-900">
              Đơn cần xử lý
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Đơn chưa hoàn thành hoặc chưa bị hủy
            </p>
          </div>

          {loading ? (
            <EmptyState message="Đang tải đơn hàng..." />
          ) : needsAttention.length === 0 ? (
            <EmptyState message="Hiện không có đơn cần xử lý." />
          ) : (
            <div className="mt-4 space-y-3">
              {needsAttention.map((order, index) => {
                const status = getOrderStatus(order);

                return (
                  <div
                    key={order.orderId ?? order.order_id ?? index}
                    className="rounded-xl border border-gray-100 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-800">
                        {getOrderCode(order)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                          STATUS_STYLE[status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS[status] || status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500">
                      <span>{getOrderType(order)}</span>
                      <span>{formatTime(order)}</span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {formatCurrency(
                        order.totalAmount ??
                        order.total_amount ??
                        order.finalAmount
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
