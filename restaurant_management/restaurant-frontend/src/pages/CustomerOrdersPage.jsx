
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Store,
  Receipt,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
  Star,
} from "lucide-react";

import api from "../services/api";
import FeedbackModal from "../components/feedback/FeedbackModal";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700",
  },
  PREPARING: {
    label: "Đang chế biến",
    color: "bg-orange-100 text-orange-700",
  },
  READY: {
    label: "Sẵn sàng",
    color: "bg-indigo-100 text-indigo-700",
  },
  DELIVERING: {
    label: "Đang giao hàng",
    color: "bg-purple-100 text-purple-700",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
  },
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
};

const formatDate = (value) => {
  if (!value) return "Chưa có thông tin";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Không xác định",
    color: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function OrderProgress({ status }) {
  const steps = [
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "PREPARING", label: "Đang chế biến" },
    { value: "READY", label: "Sẵn sàng" },
    { value: "COMPLETED", label: "Hoàn thành" },
  ];

  if (status === "CANCELLED") {
    return (
      <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
        Đơn hàng đã bị hủy.
      </div>
    );
  }

  const currentIndex = steps.findIndex(
    (step) => step.value === status
  );

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, index) => {
          const completed = currentIndex >= index;
          const active = currentIndex === index;

          return (
            <div
              key={step.value}
              className="flex flex-1 flex-col items-center text-center"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  completed
                    ? "bg-brand text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>

              <span
                className={`mt-2 text-[10px] sm:text-xs ${
                  active
                    ? "font-bold text-brand"
                    : completed
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{
            width:
              currentIndex < 0
                ? "0%"
                : `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {status === "DELIVERING" && (
        <p className="mt-3 text-sm font-medium text-purple-700">
          Đơn hàng đang được nhân viên giao đến bạn.
        </p>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Đơn hàng đang được mở modal đánh giá
  const [reviewingOrder, setReviewingOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/my");

      setOrders(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleOrder = (orderId) => {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId
    );
  };

  // Mở modal đánh giá cho đơn hàng đã hoàn thành
  const openFeedback = (order) => {
    const orderItems = (order.items || []).map((item) => ({
      dishId: item.dishId,
      dishName: item.dishName,
    }));

    setReviewingOrder({
      orderId: order.orderId,
      orderItems,
    });
  };

  // Đóng modal sau khi hoàn tất
  const handleFeedbackSubmitted = () => {
    setReviewingOrder(null);
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* NÚT TRỞ VỀ TRANG CHỦ */}
        <div className="mb-6">
          <Link
            to="/customer"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md"
          >
            <ArrowLeft size={17} />
            Trở về trang chủ
          </Link>
        </div>

        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-brand">
              <Package size={25} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Bếp Mận & Lửa
              </span>
            </div>

            <h1 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
              Đơn hàng của tôi
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Theo dõi trạng thái và xem lại các đơn hàng của bạn.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-brand"
            />
            <p className="mt-4 text-sm text-gray-500">
              Đang tải đơn hàng...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <AlertCircle
              size={36}
              className="mx-auto text-red-500"
            />

            <p className="mt-3 font-semibold text-red-600">
              {error}
            </p>

            <button
              onClick={fetchOrders}
              className="mt-4 rounded-lg bg-brand px-5 py-2 text-sm font-semibold !text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag
              size={52}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-lg font-bold text-gray-800">
              Bạn chưa có đơn hàng nào
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Hãy khám phá thực đơn và đặt món ngay nhé!
            </p>

            <Link
              to="/customer"
              className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-orange-600"
            >
              Khám phá thực đơn
            </Link>
          </div>
        )}

        {/* ORDER LIST */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Tổng cộng{" "}
                <strong className="text-brand">
                  {orders.length}
                </strong>{" "}
                đơn hàng
              </p>
            </div>

            {orders.map((order) => {
              const isExpanded =
                expandedOrder === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  {/* ORDER HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
                    <div>
                      <p className="text-xs text-gray-400">
                        Mã đơn hàng
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {order.orderCode}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={13} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={order.orderStatus} />
                  </div>

                  {/* ORDER CONTENT */}
                  <div className="p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Store
                          size={19}
                          className="mt-1 text-brand"
                        />

                        <div>
                          <p className="text-xs text-gray-400">
                            Hình thức
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {order.orderType === "DELIVERY"
                              ? "Giao hàng tận nơi"
                              : "Dùng tại nhà hàng"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        {order.orderType === "DELIVERY" ? (
                          <MapPin
                            size={19}
                            className="mt-1 text-brand"
                          />
                        ) : (
                          <Store
                            size={19}
                            className="mt-1 text-brand"
                          />
                        )}

                        <div>
                          <p className="text-xs text-gray-400">
                            {order.orderType === "DELIVERY"
                              ? "Địa chỉ giao hàng"
                              : "Bàn"}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {order.orderType === "DELIVERY"
                              ? order.deliveryAddress || "Chưa có địa chỉ"
                              : order.tableCode || "Chưa xác định"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* TOTAL */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#faf7f2] p-4">
                      <div className="text-sm text-gray-600">
                        <p>
                          Tạm tính:{" "}
                          {formatCurrency(order.subtotal)}
                        </p>

                        <p className="mt-1 text-green-700">
                          Giảm giá: -{formatCurrency(order.discountAmount)}
                        </p>

                        <p className="mt-1">
                          Phí giao hàng:{" "}
                          {formatCurrency(order.deliveryFee)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Tổng thanh toán
                        </p>

                        <p className="mt-1 text-xl font-bold text-brand">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <OrderProgress status={order.orderStatus} />

                    {/* REVIEW BUTTON: CHỈ ĐƠN ĐÃ HOÀN THÀNH */}
                    {order.orderStatus === "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => openFeedback(order)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        <Star size={17} />
                        Đánh giá đơn hàng
                      </button>
                    )}

                    {/* DETAILS BUTTON */}
                    <button
                      onClick={() => toggleOrder(order.orderId)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
                    >
                      <Receipt size={16} />

                      {isExpanded
                        ? "Ẩn chi tiết đơn hàng"
                        : "Xem chi tiết đơn hàng"}

                      {isExpanded ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </button>

                    {/* ORDER ITEMS */}
                    {isExpanded && (
                      <div className="mt-4 rounded-lg border border-gray-100 p-4">
                        <h3 className="mb-4 font-bold text-gray-800">
                          Chi tiết món ăn
                        </h3>

                        {order.items?.length > 0 ? (
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.orderItemId}
                                className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {item.dishName}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    Số lượng: {item.quantity}
                                  </p>

                                  {item.itemNote && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      Ghi chú: {item.itemNote}
                                    </p>
                                  )}
                                </div>

                                <p className="whitespace-nowrap text-sm font-semibold text-gray-800">
                                  {formatCurrency(item.subtotal)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Không có thông tin món ăn.
                          </p>
                        )}

                        {order.customerNote && (
                          <div className="mt-4 rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">
                              Ghi chú đơn hàng
                            </p>

                            <p className="mt-1 text-sm text-gray-700">
                              {order.customerNote}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FEEDBACK MODAL */}
      {reviewingOrder && (
        <FeedbackModal
          orderId={reviewingOrder.orderId}
          orderItems={reviewingOrder.orderItems}
          onClose={() => setReviewingOrder(null)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
}
