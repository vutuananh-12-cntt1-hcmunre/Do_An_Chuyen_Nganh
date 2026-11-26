
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Truck,
  RefreshCw,
  Plus,
  Search,
  UserRound,
  MapPin,
  Clock,
  FileText,
  Pencil,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

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

const NEXT_STATUSES = {
  PENDING: ["CANCELLED"],
  ASSIGNED: ["PICKED_UP", "FAILED", "CANCELLED"],
  PICKED_UP: ["DELIVERING", "FAILED"],
  DELIVERING: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
};

const STATUS_ACTIONS = {
  PICKED_UP: "Xác nhận đã lấy hàng",
  DELIVERING: "Bắt đầu giao hàng",
  DELIVERED: "Xác nhận đã giao",
  FAILED: "Đánh dấu giao thất bại",
  CANCELLED: "Hủy giao hàng",
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

function DeliveryManagementPage() {
  const { user } = useAuth();

  const roles = user?.roles || [];

  const isEmployee =
    roles.includes("EMPLOYEE") &&
    !roles.includes("ADMIN") &&
    !roles.includes("MANAGER");

  const isManager =
    roles.includes("ADMIN") || roles.includes("MANAGER");

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showNote, setShowNote] = useState(null);

  const [orderId, setOrderId] = useState("");
  const [initialNote, setInitialNote] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  // Lấy danh sách giao hàng
  const fetchDeliveries = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await api.get("/deliveries");

      setDeliveries(
        Array.isArray(response.data) ? response.data : []
      );

      setError("");
    } catch (err) {
      setError(formatError(err));
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const showMessage = (message) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  // Tạo phiếu giao hàng
  const handleCreate = async (event) => {
    event.preventDefault();

    if (!orderId || Number(orderId) <= 0) {
      setError("Vui lòng nhập mã đơn hàng hợp lệ.");
      return;
    }

    try {
      setError("");

      await api.post("/deliveries", {
        orderId: Number(orderId),
        deliveryNote: initialNote.trim() || null,
      });

      setShowCreate(false);
      setOrderId("");
      setInitialNote("");

      showMessage("Tạo phiếu giao hàng thành công.");

      await fetchDeliveries(false);
    } catch (err) {
      setError(formatError(err));
    }
  };

  // Phân công nhân viên
  const handleAssign = async (event) => {
    event.preventDefault();

    if (!employeeId || Number(employeeId) <= 0) {
      setError("Vui lòng nhập mã nhân viên hợp lệ.");
      return;
    }

    try {
      setProcessingId(showAssign.deliveryId);
      setError("");

      await api.patch(
        `/deliveries/${showAssign.deliveryId}/assign`,
        {
          employeeId: Number(employeeId),
        }
      );

      setShowAssign(null);
      setEmployeeId("");

      showMessage("Phân công nhân viên thành công.");

      await fetchDeliveries(false);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setProcessingId(null);
    }
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async (delivery, newStatus) => {
    const confirmMessage =
      `Bạn có chắc muốn chuyển phiếu giao hàng ${
        delivery.orderCode || delivery.deliveryId
      } sang trạng thái "${STATUS[newStatus]?.label}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setProcessingId(delivery.deliveryId);
      setError("");

      await api.patch(
        `/deliveries/${delivery.deliveryId}/status`,
        {
          deliveryStatus: newStatus,
        }
      );

      showMessage("Cập nhật trạng thái giao hàng thành công.");

      await fetchDeliveries(false);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setProcessingId(null);
    }
  };

  // Mở form chỉnh sửa ghi chú
  const openNoteEditor = (delivery) => {
    setShowNote(delivery);
    setDeliveryNote(delivery.deliveryNote || "");
  };

  // Cập nhật ghi chú
  const handleUpdateNote = async (event) => {
    event.preventDefault();

    try {
      setProcessingId(showNote.deliveryId);
      setError("");

      await api.patch(
        `/deliveries/${showNote.deliveryId}/note`,
        {
          deliveryNote: deliveryNote.trim() || null,
        }
      );

      setShowNote(null);

      showMessage("Cập nhật ghi chú thành công.");

      await fetchDeliveries(false);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setProcessingId(null);
    }
  };

  // Lọc dữ liệu, bao gồm cả địa chỉ giao hàng
  const filteredDeliveries = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const matchesSearch =
        !keyword ||
        String(delivery.deliveryId).includes(keyword) ||
        String(delivery.orderId).includes(keyword) ||
        (delivery.orderCode || "").toLowerCase().includes(keyword) ||
        (delivery.employeeName || "").toLowerCase().includes(keyword) ||
        (delivery.deliveryAddress || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        delivery.deliveryStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, statusFilter]);

  const countStatus = (status) =>
    deliveries.filter(
      (item) => item.deliveryStatus === status
    ).length;

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="text-orange-600" size={30} />

            <h1 className="text-2xl font-bold text-gray-900">
              {isEmployee
                ? "Đơn giao hàng của tôi"
                : "Quản lý giao hàng"}
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {isEmployee
              ? "Theo dõi địa chỉ và cập nhật các đơn hàng được phân công"
              : "Quản lý phiếu giao hàng, địa chỉ nhận hàng và phân công nhân viên"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isManager && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              <Plus size={17} />
              Tạo phiếu giao
            </button>
          )}

          <button
            onClick={() => fetchDeliveries()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>
      </div>

      {/* ALERTS */}
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
          <p className="text-sm text-gray-500">
            Tổng phiếu giao
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {deliveries.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Chờ phân công
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {countStatus("PENDING")}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Đang giao
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {countStatus("DELIVERING")}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Đã giao thành công
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {countStatus("DELIVERED")}
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã đơn, nhân viên hoặc địa chỉ giao hàng..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500"
        >
          <option value="ALL">Tất cả trạng thái</option>

          {Object.entries(STATUS).map(([value, config]) => (
            <option key={value} value={value}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* DELIVERY LIST */}
      {loading ? (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-500">
          <RefreshCw
            size={28}
            className="mx-auto mb-3 animate-spin"
          />

          Đang tải danh sách giao hàng...
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Truck
            size={40}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="font-medium text-gray-700">
            Không tìm thấy phiếu giao hàng
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Thử thay đổi từ khóa hoặc bộ lọc.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">
                    Phiếu giao
                  </th>

                  <th className="px-4 py-3">
                    Đơn hàng
                  </th>

                  <th className="min-w-[280px] px-4 py-3">
                    Địa chỉ giao hàng
                  </th>

                  <th className="px-4 py-3">
                    Nhân viên
                  </th>

                  <th className="px-4 py-3">
                    Trạng thái
                  </th>

                  <th className="px-4 py-3">
                    Thời gian
                  </th>

                  <th className="px-4 py-3">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredDeliveries.map((delivery) => {
                  const status = delivery.deliveryStatus;

                  const nextStatuses =
                    NEXT_STATUSES[status] || [];

                  const isBusy =
                    processingId === delivery.deliveryId;

                  return (
                    <tr
                      key={delivery.deliveryId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        #{delivery.deliveryId}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">
                          {delivery.orderCode ||
                            `Đơn #${delivery.orderId}`}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Order ID: {delivery.orderId}
                        </p>
                      </td>

                      {/* ĐỊA CHỈ GIAO HÀNG */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-orange-600"
                          />

                          <span
                            className="max-w-[320px] whitespace-normal break-words leading-5 text-gray-700"
                            title={delivery.deliveryAddress || ""}
                          >
                            {delivery.deliveryAddress ||
                              "Chưa có địa chỉ giao hàng"}
                          </span>
                        </div>
                      </td>

                      {/* NHÂN VIÊN */}
                      <td className="px-4 py-4">
                        {delivery.employeeName ? (
                          <div className="flex items-center gap-2">
                            <UserRound
                              size={16}
                              className="text-gray-400"
                            />

                            {delivery.employeeName}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Chưa phân công
                          </span>
                        )}
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            STATUS[status]?.color ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS[status]?.label || status}
                        </span>
                      </td>

                      {/* THỜI GIAN */}
                      <td className="px-4 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />

                          {formatDate(delivery.createdAt)}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-4">
                        <div className="flex min-w-[180px] flex-wrap gap-2">
                          {isManager && status === "PENDING" && (
                            <button
                              disabled={isBusy}
                              onClick={() => {
                                setShowAssign(delivery);
                                setEmployeeId("");
                              }}
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            >
                              Phân công
                            </button>
                          )}

                          {nextStatuses.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              disabled={isBusy}
                              onClick={() =>
                                handleUpdateStatus(
                                  delivery,
                                  nextStatus
                                )
                              }
                              className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                            >
                              {isBusy
                                ? "Đang xử lý..."
                                : STATUS_ACTIONS[nextStatus]}
                            </button>
                          ))}

                          <button
                            onClick={() => openNoteEditor(delivery)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            <Pencil size={13} />
                            Ghi chú
                          </button>
                        </div>

                        {delivery.deliveryNote && (
                          <p className="mt-2 max-w-xs truncate text-xs text-gray-400">
                            <FileText
                              size={12}
                              className="mr-1 inline"
                            />

                            {delivery.deliveryNote}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t bg-gray-50 px-4 py-3 text-xs text-gray-500">
            Hiển thị {filteredDeliveries.length} /{" "}
            {deliveries.length} phiếu giao hàng
          </div>
        </div>
      )}

      {/* CREATE DELIVERY MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Tạo phiếu giao hàng
              </h2>

              <button onClick={() => setShowCreate(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mã đơn hàng *
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={orderId}
                  onChange={(event) =>
                    setOrderId(event.target.value)
                  }
                  placeholder="Nhập Order ID"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Chỉ tạo phiếu cho đơn hàng có loại DELIVERY.
                  Địa chỉ sẽ tự động lấy từ đơn hàng.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ghi chú ban đầu
                </label>

                <textarea
                  rows="3"
                  maxLength="500"
                  value={initialNote}
                  onChange={(event) =>
                    setInitialNote(event.target.value)
                  }
                  placeholder="Ghi chú giao hàng..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Tạo phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN EMPLOYEE MODAL */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Phân công nhân viên
              </h2>

              <button onClick={() => setShowAssign(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 space-y-3 rounded-lg bg-gray-50 p-3">
              <div>
                <p className="text-xs text-gray-500">
                  Phiếu giao
                </p>

                <p className="font-semibold text-gray-900">
                  {showAssign.orderCode ||
                    `#${showAssign.orderId}`}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500">
                  Địa chỉ nhận hàng
                </p>

                <div className="flex items-start gap-2">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-orange-600"
                  />

                  <p className="text-sm leading-5 text-gray-700">
                    {showAssign.deliveryAddress ||
                      "Chưa có địa chỉ giao hàng"}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleAssign}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mã nhân viên (Employee ID) *
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={employeeId}
                  onChange={(event) =>
                    setEmployeeId(event.target.value)
                  }
                  placeholder="Nhập Employee ID"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Nhập mã nhân viên đang hoạt động trong hệ thống.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssign(null)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={
                    processingId === showAssign.deliveryId
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Xác nhận phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTE MODAL */}
      {showNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Ghi chú giao hàng
              </h2>

              <button onClick={() => setShowNote(null)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateNote}
              className="space-y-4"
            >
              <textarea
                rows="5"
                maxLength="1000"
                value={deliveryNote}
                onChange={(event) =>
                  setDeliveryNote(event.target.value)
                }
                placeholder="Nhập ghi chú..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
              />

              <p className="text-right text-xs text-gray-400">
                {deliveryNote.length}/1000 ký tự
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNote(null)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={
                    processingId === showNote.deliveryId
                  }
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  Lưu ghi chú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryManagementPage;
