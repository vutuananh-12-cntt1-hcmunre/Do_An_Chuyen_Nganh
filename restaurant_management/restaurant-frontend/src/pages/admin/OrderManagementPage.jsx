
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  User,
  Utensils,
  Receipt,
  Filter,
  LoaderCircle,
  ClipboardList,
} from "lucide-react";
import api from "../../services/api";

const PAGE_SIZE = 8;

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
    className: "bg-violet-100 text-violet-700",
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

const TYPE_CONFIG = {
  DINE_IN: "Tại nhà hàng",
  DELIVERY: "Giao hàng",
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.message ||
    data?.detail ||
    error?.message ||
    "Đã xảy ra lỗi. Vui lòng thử lại."
  );
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Không xác định",
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color, description }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          )}
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

  const items = order.items || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Chi tiết đơn hàng
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Mã đơn: {order.orderCode}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Trạng thái đơn hàng</p>
              <div className="mt-2">
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Ngày đặt hàng</p>
              <p className="mt-1 font-medium text-gray-800">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 text-gray-500" size={19} />
              <div>
                <p className="text-xs text-gray-500">Khách hàng</p>
                <p className="font-medium text-gray-800">
                  {order.username || `Khách hàng #${order.userId}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShoppingBag className="mt-0.5 text-gray-500" size={19} />
              <div>
                <p className="text-xs text-gray-500">Loại đơn hàng</p>
                <p className="font-medium text-gray-800">
                  {TYPE_CONFIG[order.orderType] || order.orderType}
                </p>
              </div>
            </div>

            {order.orderType === "DINE_IN" ? (
              <div className="flex items-start gap-3">
                <Utensils className="mt-0.5 text-gray-500" size={19} />
                <div>
                  <p className="text-xs text-gray-500">Bàn</p>
                  <p className="font-medium text-gray-800">
                    {order.tableCode || `Bàn #${order.tableId}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-gray-500" size={19} />
                <div>
                  <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                  <p className="font-medium text-gray-800">
                    {order.deliveryAddress || "Chưa có địa chỉ"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 text-gray-500" size={19} />
              <div>
                <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                <p className="font-medium text-gray-800">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {order.customerNote && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Ghi chú đơn hàng
              </p>
              <p className="mt-1 text-sm text-amber-700">
                {order.customerNote}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
              <Receipt size={19} />
              Danh sách món ăn ({items.length})
            </h3>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
                Đơn hàng chưa có thông tin món ăn.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <div className="hidden grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 sm:grid">
                  <div className="col-span-5">Món ăn</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Đơn giá</div>
                  <div className="col-span-3 text-right">Thành tiền</div>
                </div>

                <div className="divide-y">
                  {items.map((item) => (
                    <div
                      key={item.orderItemId}
                      className="grid grid-cols-2 gap-2 px-4 py-4 sm:grid-cols-12 sm:items-center"
                    >
                      <div className="col-span-2 sm:col-span-5">
                        <p className="font-medium text-gray-800">
                          {item.dishName || `Món #${item.dishId}`}
                        </p>

                        {item.itemNote && (
                          <p className="mt-1 text-xs text-gray-500">
                            Ghi chú: {item.itemNote}
                          </p>
                        )}

                        {item.itemStatus && (
                          <p className="mt-1 text-xs text-gray-400">
                            Trạng thái món: {item.itemStatus}
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 sm:col-span-2 sm:text-center">
                        SL: {item.quantity}
                      </div>

                      <div className="text-sm text-gray-600 sm:col-span-2 sm:text-right">
                        {formatCurrency(item.unitPrice)}
                      </div>

                      <div className="text-right text-sm font-semibold text-gray-800 sm:col-span-3">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ml-auto max-w-sm space-y-2 rounded-xl bg-gray-50 p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tạm tính</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Giảm giá</span>
              <span>{formatCurrency(order.discountAmount)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí giao hàng</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between gap-3">
                <span className="font-semibold text-gray-800">
                  Tổng thanh toán
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/orders");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timeout);
  }, [message]);

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        String(order.orderCode || "").toLowerCase().includes(keyword) ||
        String(order.username || "").toLowerCase().includes(keyword) ||
        String(order.deliveryAddress || "").toLowerCase().includes(keyword) ||
        String(order.tableCode || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || order.orderStatus === statusFilter;

      const matchesType =
        typeFilter === "ALL" || order.orderType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / PAGE_SIZE)
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statistics = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "PENDING").length,
      preparing: orders.filter(
        (o) =>
          o.orderStatus === "PREPARING" ||
          o.orderStatus === "CONFIRMED"
      ).length,
      completed: orders.filter((o) => o.orderStatus === "COMPLETED").length,
      revenue: orders
        .filter((o) => o.orderStatus === "COMPLETED")
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    };
  }, [orders]);

  const openOrderDetail = async (order) => {
    try {
      const response = await api.get(`/orders/${order.orderId}`);
      setSelectedOrder(response.data);
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const handleStatusAction = async (order, action, successMessage) => {
    const actionLabels = {
      confirm: "xác nhận",
      cancel: "hủy",
      preparing: "chuyển sang đang chế biến",
      ready: "đánh dấu sẵn sàng",
      complete: "hoàn thành",
    };

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${actionLabels[action]} đơn ${order.orderCode}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(order.orderId);
      setMessage("");

      await api.patch(`/orders/${order.orderId}/${action}`);

      setMessage(successMessage);
      await fetchOrders(true);

      if (selectedOrder?.orderId === order.orderId) {
        try {
          const response = await api.get(`/orders/${order.orderId}`);
          setSelectedOrder(response.data);
        } catch {
          setSelectedOrder(null);
        }
      }
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const renderActions = (order) => {
    const busy = processingId === order.orderId;

    const actionButton = (label, action, className, Icon) => (
      <button
        key={action}
        disabled={busy}
        onClick={() =>
          handleStatusAction(
            order,
            action,
            `${label} đơn hàng ${order.orderCode} thành công.`
          )
        }
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {busy ? (
          <LoaderCircle size={14} className="animate-spin" />
        ) : (
          <Icon size={14} />
        )}
        {label}
      </button>
    );

    switch (order.orderStatus) {
      case "PENDING":
        return (
          <>
            {actionButton(
              "Xác nhận",
              "confirm",
              "bg-blue-600 text-white hover:bg-blue-700",
              CheckCircle
            )}
            {actionButton(
              "Hủy",
              "cancel",
              "bg-red-50 text-red-600 hover:bg-red-100",
              XCircle
            )}
          </>
        );

      case "CONFIRMED":
        return (
          <>
            {actionButton(
              "Chế biến",
              "preparing",
              "bg-orange-500 text-white hover:bg-orange-600",
              ChefHat
            )}
            {actionButton(
              "Hủy",
              "cancel",
              "bg-red-50 text-red-600 hover:bg-red-100",
              XCircle
            )}
          </>
        );

      case "PREPARING":
        return actionButton(
          "Sẵn sàng",
          "ready",
          "bg-violet-600 text-white hover:bg-violet-700",
          CheckCircle
        );

      case "READY":
        return actionButton(
          "Hoàn thành",
          "complete",
          "bg-green-600 text-white hover:bg-green-700",
          CheckCircle
        );

      default:
        return (
          <span className="text-xs text-gray-400">
            Không có thao tác
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và xử lý các đơn hàng của nhà hàng.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {message && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => fetchOrders()}
            className="shrink-0 font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Tổng đơn hàng"
          value={statistics.total}
          icon={ShoppingBag}
          color="bg-blue-50 text-blue-600"
          description="Tất cả đơn hàng"
        />

        <StatCard
          title="Chờ xác nhận"
          value={statistics.pending}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          description="Đang chờ xử lý"
        />

        <StatCard
          title="Đang xử lý"
          value={statistics.preparing}
          icon={ChefHat}
          color="bg-orange-50 text-orange-600"
          description="Đã xác nhận hoặc chế biến"
        />

        <StatCard
          title="Đã hoàn thành"
          value={statistics.completed}
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
          description="Đơn hàng hoàn tất"
        />

        <StatCard
          title="Doanh thu hoàn thành"
          value={formatCurrency(statistics.revenue)}
          icon={Truck}
          color="bg-violet-50 text-violet-600"
          description="Chỉ tính đơn đã hoàn thành"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 font-semibold text-gray-700">
          <Filter size={18} />
          Bộ lọc đơn hàng
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, khách hàng, bàn..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
          >
            <option value="ALL">Tất cả loại đơn</option>
            <option value="DINE_IN">Tại nhà hàng</option>
            <option value="DELIVERY">Giao hàng</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-gray-800">
              Danh sách đơn hàng
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Tìm thấy {filteredOrders.length} đơn hàng
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <LoaderCircle className="mb-3 animate-spin" size={30} />
            <p className="text-sm">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ClipboardList size={42} className="mb-3" />
            <p className="font-medium">Không tìm thấy đơn hàng</p>
            <p className="mt-1 text-sm">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Mã đơn hàng</th>
                    <th className="px-5 py-4 font-semibold">Khách hàng</th>
                    <th className="px-5 py-4 font-semibold">Loại đơn</th>
                    <th className="px-5 py-4 font-semibold">Ngày đặt</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Tổng tiền
                    </th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {order.orderCode}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          #{order.orderId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-700">
                          {order.username || `Khách #${order.userId}`}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {order.orderType === "DINE_IN"
                            ? order.tableCode || `Bàn #${order.tableId}`
                            : "Giao tận nơi"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {TYPE_CONFIG[order.orderType] || order.orderType}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-gray-800">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={order.orderStatus} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => openOrderDetail(order)}
                            title="Xem chi tiết"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                          >
                            <Eye size={14} />
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

            <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row">
              <p className="text-sm text-gray-500">
                Hiển thị{" "}
                {filteredOrders.length === 0
                  ? 0
                  : (currentPage - 1) * PAGE_SIZE + 1}
                {" - "}
                {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}
                {" / "}
                {filteredOrders.length} đơn hàng
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="px-2 text-sm font-medium text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
