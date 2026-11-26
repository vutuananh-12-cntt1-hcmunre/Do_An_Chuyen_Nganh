
import { useCallback, useEffect, useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
  Pencil,
  Save,
  X,
} from "lucide-react";

import api from "../../services/api";

const STATUS = {
  PENDING: {
    label: "Chờ phân công",
    color: "bg-amber-100 text-amber-700",
  },
  ASSIGNED: {
    label: "Đã phân công",
    color: "bg-blue-100 text-blue-700",
  },
  PICKED_UP: {
    label: "Đã lấy hàng",
    color: "bg-indigo-100 text-indigo-700",
  },
  DELIVERING: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-700",
  },
  DELIVERED: {
    label: "Đã giao",
    color: "bg-green-100 text-green-700",
  },
  FAILED: {
    label: "Giao thất bại",
    color: "bg-red-100 text-red-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-600",
  },
};

const NEXT_STATUS = {
  ASSIGNED: ["PICKED_UP", "FAILED"],
  PICKED_UP: ["DELIVERING", "FAILED"],
  DELIVERING: ["DELIVERED", "FAILED"],
};

const ACTION_LABEL = {
  PICKED_UP: "Xác nhận đã lấy hàng",
  DELIVERING: "Bắt đầu giao hàng",
  DELIVERED: "Xác nhận đã giao",
  FAILED: "Báo giao thất bại",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN");
};

const formatError = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.response?.data?.detail ||
  error.message ||
  "Đã xảy ra lỗi. Vui lòng thử lại.";

export default function EmployeeDeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/deliveries");

      setDeliveries(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const showMessage = (message) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 3000);
  };

  const handleUpdateStatus = async (delivery, newStatus) => {
    const label = STATUS[newStatus]?.label || newStatus;

    if (
      !window.confirm(
        `Bạn xác nhận chuyển đơn ${delivery.orderCode || `#${delivery.orderId}`} sang trạng thái "${label}"?`
      )
    ) {
      return;
    }

    try {
      setProcessingId(delivery.deliveryId);
      setError("");

      await api.patch(
        `/deliveries/${delivery.deliveryId}/status`,
        { deliveryStatus: newStatus }
      );

      showMessage("Cập nhật trạng thái giao hàng thành công.");
      await fetchDeliveries();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setProcessingId(null);
    }
  };

  const openNoteEditor = (delivery) => {
    setEditingId(delivery.deliveryId);
    setNoteDraft(delivery.deliveryNote || "");
  };

  const handleSaveNote = async (deliveryId) => {
    try {
      setProcessingId(deliveryId);
      setError("");

      await api.patch(`/deliveries/${deliveryId}/note`, {
        deliveryNote: noteDraft.trim() || null,
      });

      setEditingId(null);
      showMessage("Đã lưu ghi chú giao hàng.");

      await fetchDeliveries();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setProcessingId(null);
    }
  };

  const countStatus = (status) =>
    deliveries.filter(
      (item) => item.deliveryStatus === status
    ).length;

  const activeDeliveries = deliveries.filter((item) =>
    ["ASSIGNED", "PICKED_UP", "DELIVERING"].includes(
      item.deliveryStatus
    )
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Truck size={30} className="text-orange-600" />

            <h1 className="text-2xl font-bold text-gray-900">
              Đơn giao hàng của tôi
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Theo dõi địa chỉ và cập nhật tiến trình giao hàng.
          </p>
        </div>

        <button
          onClick={fetchDeliveries}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* ALERT */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Tổng đơn được giao</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {deliveries.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Đơn cần xử lý</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {activeDeliveries.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Đang giao</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">
            {countStatus("DELIVERING")}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Đã giao thành công</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {countStatus("DELIVERED")}
          </p>
        </div>
      </div>

      {/* DELIVERY LIST */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            Danh sách đơn hàng
          </h2>

          <span className="text-sm text-gray-500">
            {deliveries.length} đơn
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-12 text-center text-gray-500">
            <RefreshCw
              size={28}
              className="mx-auto mb-3 animate-spin"
            />
            Đang tải đơn giao hàng...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <Package
              size={42}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="font-semibold text-gray-700">
              Bạn chưa có đơn giao hàng
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Các đơn được quản lý phân công sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const status = delivery.deliveryStatus;
              const nextStatuses = NEXT_STATUS[status] || [];
              const isBusy =
                processingId === delivery.deliveryId;

              return (
                <div
                  key={delivery.deliveryId}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  {/* ORDER HEADER */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        Phiếu giao #{delivery.deliveryId}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-gray-900">
                        {delivery.orderCode ||
                          `Đơn hàng #${delivery.orderId}`}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        STATUS[status]?.color ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS[status]?.label || status}
                    </span>
                  </div>

                  {/* ADDRESS */}
                  <div className="mt-4 rounded-lg bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={21}
                        className="mt-0.5 shrink-0 text-orange-600"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase text-orange-700">
                          Địa chỉ giao hàng
                        </p>

                        <p className="mt-1 text-sm font-medium leading-6 text-gray-800">
                          {delivery.deliveryAddress ||
                            "Đơn hàng chưa có địa chỉ giao hàng."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TIME */}
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Tạo lúc: {formatDate(delivery.createdAt)}
                    </span>

                    {delivery.assignedAt && (
                      <span>
                        Phân công: {formatDate(delivery.assignedAt)}
                      </span>
                    )}

                    {delivery.pickedUpAt && (
                      <span>
                        Lấy hàng: {formatDate(delivery.pickedUpAt)}
                      </span>
                    )}

                    {delivery.deliveredAt && (
                      <span>
                        Hoàn thành: {formatDate(delivery.deliveredAt)}
                      </span>
                    )}
                  </div>

                  {/* NOTE */}
                  <div className="mt-4 border-t pt-4">
                    {editingId === delivery.deliveryId ? (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Ghi chú giao hàng
                        </label>

                        <textarea
                          rows={3}
                          maxLength={500}
                          value={noteDraft}
                          onChange={(event) =>
                            setNoteDraft(event.target.value)
                          }
                          placeholder="Ví dụ: Gọi khách trước khi giao..."
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                        />

                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">
                            {noteDraft.length}/500 ký tự
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border px-3 py-2 text-xs font-semibold text-gray-600"
                            >
                              Hủy
                            </button>

                            <button
                              onClick={() =>
                                handleSaveNote(delivery.deliveryId)
                              }
                              disabled={isBusy}
                              className="flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                            >
                              <Save size={14} />
                              Lưu ghi chú
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-500">
                            GHI CHÚ
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                            {delivery.deliveryNote || "Chưa có ghi chú"}
                          </p>
                        </div>

                        <button
                          onClick={() => openNoteEditor(delivery)}
                          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          <Pencil size={13} />
                          Sửa ghi chú
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  {nextStatuses.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                      {nextStatuses.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          disabled={isBusy}
                          onClick={() =>
                            handleUpdateStatus(delivery, nextStatus)
                          }
                          className={`rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                            nextStatus === "FAILED"
                              ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                              : "bg-orange-600 text-white hover:bg-orange-700"
                          }`}
                        >
                          {isBusy
                            ? "Đang xử lý..."
                            : ACTION_LABEL[nextStatus]}
                        </button>
                      ))}
                    </div>
                  )}

                  {["DELIVERED", "FAILED", "CANCELLED"].includes(status) && (
                    <div className="mt-4 border-t pt-4 text-sm text-gray-500">
                      Đơn giao hàng đã kết thúc.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
