
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  ChefHat,
  Utensils,
  Truck,
  Clock,
  PackageCheck,
  MapPin,
  CalendarDays,
  User,
  X,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "bg-amber-100 text-amber-700",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-700",
  },
  PREPARING: {
    label: "Đang chế biến",
    className: "bg-orange-100 text-orange-700",
  },
  READY: {
    label: "Sẵn sàng",
    className: "bg-emerald-100 text-emerald-700",
  },
  DELIVERING: {
    label: "Đang giao",
    className: "bg-purple-100 text-purple-700",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700",
  },
};

const FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang chế biến" },
  { value: "READY", label: "Sẵn sàng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

const formatDate = (value) => {
  if (!value) return "Chưa có thông tin";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa có thông tin";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatus = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Không xác định",
      className: "bg-gray-100 text-gray-600",
    }
  );
};

function StatusBadge({ status }) {
  const config = getStatus(status);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Chi tiết đơn hàng
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Mã đơn: {order.orderCode || `#${order.orderId}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={order.orderStatus} />

            <span className="text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </span>
          </div>

          <div className="grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="mt-1 text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-500">Khách hàng</p>
                <p className="font-medium text-gray-800">
                  {order.username || "Khách hàng"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {order.orderType === "DELIVERY" ? (
                <Truck className="mt-1 text-gray-400" size={18} />
              ) : (
                <Utensils className="mt-1 text-gray-400" size={18} />
              )}

              <div>
                <p className="text-xs text-gray-500">Loại đơn</p>
                <p className="font-medium text-gray-800">
                  {order.orderType === "DELIVERY"
                    ? "Giao tận nơi"
                    : "Dùng tại nhà hàng"}
                </p>
              </div>
            </div>

            {order.orderType === "DINE_IN" && (
              <div className="flex items-start gap-3">
                <Utensils className="mt-1 text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Bàn</p>
                  <p className="font-medium text-gray-800">
                    {order.tableCode || "Chưa chọn bàn"}
                  </p>
                </div>
              </div>
            )}

            {order.orderType === "DELIVERY" && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                  <p className="font-medium text-gray-800">
                    {order.deliveryAddress || "Chưa có địa chỉ"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-gray-800">
              Danh sách món ăn
            </h3>

            <div className="divide-y rounded-xl border">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="flex items-start justify-between gap-4 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800">
                        {item.dishName || `Món #${item.dishId}`}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>

                      {item.itemNote && (
                        <p className="mt-1 text-sm italic text-gray-500">
                          Ghi chú: {item.itemNote}
                        </p>
                      )}

                      {item.itemStatus && (
                        <p className="mt-1 text-xs text-gray-400">
                          Trạng thái món: {item.itemStatus}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 font-semibold text-gray-800">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500">
                  Không có thông tin món ăn.
                </p>
              )}
            </div>
          </div>

          {order.customerNote && (
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Ghi chú đơn hàng
              </p>
              <p className="mt-1 text-sm text-amber-700">
                {order.customerNote}
              </p>
            </div>
          )}

          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tạm tính</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Giảm giá</span>
              <span className="text-green-600">
                -{formatCurrency(order.discountAmount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Phí giao hàng</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Tổng thanh toán</span>
              <span className="text-purple-700">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t p-4 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeOrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      const data = response.data;

      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.orders)
              ? data.orders
              : [];

      setOrders(orderList);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn hàng:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Không thể tải danh sách đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        filter === "ALL" || order.orderStatus === filter;

      const matchesSearch =
        !keyword ||
        String(order.orderCode || "").toLowerCase().includes(keyword) ||
        String(order.orderId || "").includes(keyword) ||
        String(order.username || "").toLowerCase().includes(keyword) ||
        String(order.tableCode || "").toLowerCase().includes(keyword) ||
        String(order.deliveryAddress || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [orders, filter, search]);

  const statistics = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "PENDING").length,
      preparing: orders.filter((o) => o.orderStatus === "PREPARING").length,
      completed: orders.filter((o) => o.orderStatus === "COMPLETED").length,
    };
  }, [orders]);

  const performAction = async (order, action, message) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${message.toLowerCase()} đơn hàng ${
        order.orderCode || `#${order.orderId}`
      }?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(order.orderId);
      setError("");
      setSuccess("");

      await api.patch(`/orders/${order.orderId}/${action}`);

      setSuccess(message + " thành công!");

      if (selectedOrder?.orderId === order.orderId) {
        setSelectedOrder(null);
      }

      await fetchOrders();
    } catch (err) {
      console.error("Lỗi cập nhật đơn hàng:", err);

      const responseMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null);

      setError(
        responseMessage ||
          "Không thể cập nhật đơn hàng. Vui lòng kiểm tra trạng thái hiện tại."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const renderActions = (order) => {
    const isBusy = actionLoading === order.orderId;

    return (
      <div className="flex flex-wrap gap-2">
        {order.orderStatus === "PENDING" && (
          <>
            <button
              disabled={isBusy}
              onClick={() =>
                performAction(order, "confirm", "Xác nhận đơn hàng")
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              Xác nhận
            </button>

            <button
              disabled={isBusy}
              onClick={() =>
                performAction(order, "cancel", "Hủy đơn hàng")
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle size={15} />
              Hủy
            </button>
          </>
        )}

        {order.orderStatus === "CONFIRMED" && (
          <>
            <button
              disabled={isBusy}
              onClick={() =>
                performAction(order, "preparing", "Bắt đầu chế biến")
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              <ChefHat size={15} />
              Bắt đầu chế biến
            </button>

            <button
              disabled={isBusy}
              onClick={() =>
                performAction(order, "cancel", "Hủy đơn hàng")
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle size={15} />
              Hủy
            </button>
          </>
        )}

        {order.orderStatus === "PREPARING" && (
          <button
            disabled={isBusy}
            onClick={() =>
              performAction(order, "ready", "Hoàn thành chế biến")
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <PackageCheck size={15} />
            Đã chế biến xong
          </button>
        )}

        {order.orderStatus === "READY" &&
          order.orderType === "DINE_IN" && (
            <button
              disabled={isBusy}
              onClick={() =>
                performAction(order, "complete", "Hoàn tất đơn hàng")
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              Hoàn tất
            </button>
          )}

        {order.orderStatus === "READY" &&
          order.orderType === "DELIVERY" && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700">
              <Truck size={15} />
              Chờ xử lý giao hàng
            </span>
          )}

        {order.orderStatus === "DELIVERING" && (
          <span className="text-xs text-purple-600">
            Đang được nhân viên giao hàng xử lý
          </span>
        )}

        {isBusy && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <RefreshCw size={13} className="animate-spin" />
            Đang xử lý...
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và xử lý đơn hàng của nhà hàng
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* Thông báo */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{typeof error === "string" ? error : "Có lỗi xảy ra."}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng đơn hàng"
          value={statistics.total}
          icon={ShoppingBag}
          color="bg-purple-100 text-purple-600"
        />

        <StatCard
          title="Chờ xác nhận"
          value={statistics.pending}
          icon={Clock}
          color="bg-amber-100 text-amber-600"
        />

        <StatCard
          title="Đang chế biến"
          value={statistics.preparing}
          icon={ChefHat}
          color="bg-orange-100 text-orange-600"
        />

        <StatCard
          title="Đã hoàn thành"
          value={statistics.completed}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Tìm kiếm */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã đơn, khách hàng, bàn..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <p className="text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-semibold text-gray-800">
              {filteredOrders.length}
            </span>{" "}
            / {orders.length} đơn hàng
          </p>
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                filter === item.value
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item.label}
              {item.value !== "ALL" && (
                <span className="ml-1">
                  (
                  {
                    orders.filter(
                      (order) => order.orderStatus === item.value
                    ).length
                  }
                  )
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-bold text-gray-800">
            Danh sách đơn hàng
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <RefreshCw size={28} className="animate-spin text-purple-500" />
            <p className="mt-3 text-sm">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingBag size={42} strokeWidth={1.5} />
            <p className="mt-3 font-medium text-gray-600">
              Không tìm thấy đơn hàng
            </p>
            <p className="mt-1 text-sm">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Mã đơn hàng</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Loại đơn</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4">Tổng tiền</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-800">
                        {order.orderCode || `#${order.orderId}`}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        ID: {order.orderId}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700">
                        {order.username || "Khách hàng"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {order.orderType === "DINE_IN"
                          ? order.tableCode || "Chưa chọn bàn"
                          : "Giao tận nơi"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {order.orderType === "DELIVERY" ? (
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <Truck size={15} />
                          Giao hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <Utensils size={15} />
                          Tại nhà hàng
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          <Eye size={15} />
                          Chi tiết
                        </button>

                        {renderActions(order)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ghi chú nghiệp vụ */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div className="text-sm text-blue-800">
            <p className="font-semibold">Lưu ý xử lý đơn hàng</p>
            <p className="mt-1 leading-relaxed">
              Đơn giao tận nơi sau khi chế biến xong sẽ được chuyển sang
              chức năng quản lý giao hàng. Nhân viên không hoàn tất đơn
              giao hàng trực tiếp tại màn hình này.
            </p>
          </div>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
