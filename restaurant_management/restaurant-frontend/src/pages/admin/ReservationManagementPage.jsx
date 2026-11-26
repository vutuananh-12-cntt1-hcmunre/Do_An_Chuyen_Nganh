
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Check,
  X,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Armchair,
  Filter,
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
  SEATED: {
    label: "Đã nhận bàn",
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
  NO_SHOW: {
    label: "Khách không đến",
    className: "bg-gray-100 text-gray-700",
  },
};

const EMPTY_FORM = {
  tableId: "",
  reservationTime: "",
  reservationEndTime: "",
  guestCount: 2,
  customerNote: "",
};

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toDateTimeLocal(value) {
  if (!value) return "";

  // LocalDateTime từ Spring thường có dạng yyyy-MM-ddTHH:mm:ss
  return String(value).slice(0, 16);
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || {
    label: status || "Không xác định",
    className: "bg-gray-100 text-gray-700",
  };
}

function getActionError(error) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data ||
    "Đã xảy ra lỗi. Vui lòng thử lại."
  );
}

export default function ReservationManagementPage() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [reservationResponse, tableResponse] = await Promise.all([
        api.get("/reservations"),
        api.get("/tables"),
      ]);

      setReservations(
        Array.isArray(reservationResponse.data)
          ? reservationResponse.data
          : []
      );

      setTables(
        Array.isArray(tableResponse.data) ? tableResponse.data : []
      );
    } catch (error) {
      console.error("Lỗi tải dữ liệu đặt bàn:", error);
      setMessage({
        type: "error",
        text: getActionError(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      const searchValue = keyword.trim().toLowerCase();

      const matchesKeyword =
        !searchValue ||
        String(item.reservationCode || "").toLowerCase().includes(searchValue) ||
        String(item.username || "").toLowerCase().includes(searchValue) ||
        String(item.tableCode || "").toLowerCase().includes(searchValue) ||
        String(item.reservationId || "").includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.reservationStatus === statusFilter;

      const reservationDate = item.reservationTime
        ? String(item.reservationTime).slice(0, 10)
        : "";

      const matchesDate =
        !dateFilter || reservationDate === dateFilter;

      return matchesKeyword && matchesStatus && matchesDate;
    });
  }, [reservations, keyword, statusFilter, dateFilter]);

  const statistics = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter(
        (item) => item.reservationStatus === "PENDING"
      ).length,
      confirmed: reservations.filter(
        (item) => item.reservationStatus === "CONFIRMED"
      ).length,
      seated: reservations.filter(
        (item) => item.reservationStatus === "SEATED"
      ).length,
      completed: reservations.filter(
        (item) => item.reservationStatus === "COMPLETED"
      ).length,
    };
  }, [reservations]);

  function showMessage(type, text) {
    setMessage({ type, text });

    window.setTimeout(() => {
      setMessage(null);
    }, 4000);
  }

  async function handleStatusAction(reservation, action, successText) {
    const actionNames = {
      confirm: "xác nhận",
      cancel: "hủy",
      seat: "xác nhận khách đã nhận bàn",
      complete: "hoàn thành",
      "no-show": "đánh dấu khách không đến",
    };

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${actionNames[action]} phiếu ${reservation.reservationCode}?`
    );

    if (!confirmed) return;

    try {
      setProcessing(true);

      await api.patch(
        `/reservations/${reservation.reservationId}/${action}`
      );

      showMessage("success", successText);
      await fetchData();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đặt bàn:", error);
      showMessage("error", getActionError(error));
    } finally {
      setProcessing(false);
    }
  }

  function openDetail(reservation) {
    setSelectedReservation(reservation);
    setShowDetail(true);
  }

  function openEdit(reservation) {
    setSelectedReservation(reservation);

    setForm({
      tableId: reservation.tableId
        ? String(reservation.tableId)
        : "",
      reservationTime: toDateTimeLocal(reservation.reservationTime),
      reservationEndTime: toDateTimeLocal(
        reservation.reservationEndTime
      ),
      guestCount: reservation.guestCount || 1,
      customerNote: reservation.customerNote || "",
    });

    setShowEdit(true);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleUpdateReservation(event) {
    event.preventDefault();

    if (!selectedReservation) return;

    if (!form.reservationTime || !form.reservationEndTime) {
      showMessage("error", "Vui lòng nhập đầy đủ thời gian đặt bàn.");
      return;
    }

    if (
      new Date(form.reservationEndTime) <=
      new Date(form.reservationTime)
    ) {
      showMessage(
        "error",
        "Thời gian kết thúc phải sau thời gian bắt đầu."
      );
      return;
    }

    if (new Date(form.reservationTime) <= new Date()) {
      showMessage(
        "error",
        "Thời gian đặt bàn phải ở tương lai."
      );
      return;
    }

    if (
      new Date(form.reservationEndTime) <= new Date()
    ) {
      showMessage(
        "error",
        "Thời gian kết thúc phải ở tương lai."
      );
      return;
    }

    const payload = {
      tableId: form.tableId ? Number(form.tableId) : null,
      reservationTime: form.reservationTime,
      reservationEndTime: form.reservationEndTime,
      guestCount: Number(form.guestCount),
      customerNote: form.customerNote.trim(),
    };

    try {
      setProcessing(true);

      await api.put(
        `/reservations/${selectedReservation.reservationId}`,
        payload
      );

      setShowEdit(false);
      setSelectedReservation(null);

      showMessage("success", "Cập nhật phiếu đặt bàn thành công.");
      await fetchData();
    } catch (error) {
      console.error("Lỗi cập nhật đặt bàn:", error);
      showMessage("error", getActionError(error));
    } finally {
      setProcessing(false);
    }
  }

  function renderStatus(status) {
    const config = getStatusConfig(status);

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  }

  function renderActions(reservation) {
    const status = reservation.reservationStatus;

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => openDetail(reservation)}
          title="Xem chi tiết"
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
        >
          <Eye size={16} />
        </button>

        {status === "PENDING" && (
          <>
            <button
              type="button"
              onClick={() => openEdit(reservation)}
              title="Chỉnh sửa"
              className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
            >
              <Pencil size={16} />
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleStatusAction(
                  reservation,
                  "confirm",
                  "Đã xác nhận đặt bàn thành công."
                )
              }
              title="Xác nhận"
              className="rounded-lg border border-green-200 p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
            >
              <Check size={16} />
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleStatusAction(
                  reservation,
                  "cancel",
                  "Đã hủy lượt đặt bàn."
                )
              }
              title="Hủy đặt bàn"
              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </>
        )}

        {status === "CONFIRMED" && (
          <>
            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleStatusAction(
                  reservation,
                  "seat",
                  "Đã xác nhận khách nhận bàn."
                )
              }
              title="Khách nhận bàn"
              className="rounded-lg border border-violet-200 p-2 text-violet-600 hover:bg-violet-50 disabled:opacity-50"
            >
              <UserCheck size={16} />
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleStatusAction(
                  reservation,
                  "no-show",
                  "Đã đánh dấu khách không đến."
                )
              }
              title="Khách không đến"
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              <UserX size={16} />
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleStatusAction(
                  reservation,
                  "cancel",
                  "Đã hủy lượt đặt bàn."
                )
              }
              title="Hủy đặt bàn"
              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </>
        )}

        {status === "SEATED" && (
          <button
            type="button"
            disabled={processing}
            onClick={() =>
              handleStatusAction(
                reservation,
                "complete",
                "Đã hoàn thành lượt đặt bàn."
              )
            }
            title="Hoàn thành"
            className="rounded-lg border border-green-200 p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý đặt bàn
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và xử lý các lượt đặt bàn của khách hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Thông báo */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {String(message.text)}
        </div>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Tổng lượt đặt"
          value={statistics.total}
          icon={CalendarDays}
          color="blue"
        />
        <StatCard
          title="Chờ xác nhận"
          value={statistics.pending}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Đã xác nhận"
          value={statistics.confirmed}
          icon={Check}
          color="sky"
        />
        <StatCard
          title="Đã nhận bàn"
          value={statistics.seated}
          icon={Armchair}
          color="violet"
        />
        <StatCard
          title="Hoàn thành"
          value={statistics.completed}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Bộ lọc */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm mã đặt bàn, khách hàng, bàn..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {/* Danh sách */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              Danh sách phiếu đặt bàn
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Hiển thị {filteredReservations.length} / {reservations.length} phiếu
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <RefreshCw size={18} className="animate-spin" />
            Đang tải dữ liệu...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-gray-600">
              Không tìm thấy phiếu đặt bàn
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Mã đặt bàn</th>
                  <th className="px-5 py-3 font-semibold">Khách hàng</th>
                  <th className="px-5 py-3 font-semibold">Bàn</th>
                  <th className="px-5 py-3 font-semibold">Thời gian đặt</th>
                  <th className="px-5 py-3 font-semibold">Số khách</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.reservationId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-orange-700">
                      {reservation.reservationCode || `#${reservation.reservationId}`}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {reservation.username || "Khách hàng"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        ID: {reservation.userId ?? "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {reservation.tableCode ||
                        (reservation.tableId
                          ? `Bàn #${reservation.tableId}`
                          : "Chưa chọn bàn")}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDateTime(reservation.reservationTime)}
                      <p className="mt-1 text-xs text-gray-400">
                        Đến: {formatDateTime(reservation.reservationEndTime)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Users size={15} className="text-gray-400" />
                        {reservation.guestCount}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {renderStatus(reservation.reservationStatus)}
                    </td>

                    <td className="px-5 py-4">
                      {renderActions(reservation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {showDetail && selectedReservation && (
        <Modal
          title="Chi tiết đặt bàn"
          onClose={() => {
            setShowDetail(false);
            setSelectedReservation(null);
          }}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg font-bold text-orange-700">
                {selectedReservation.reservationCode}
              </span>
              {renderStatus(selectedReservation.reservationStatus)}
            </div>

            <DetailRow
              label="Khách hàng"
              value={selectedReservation.username || "—"}
            />
            <DetailRow
              label="Mã khách hàng"
              value={selectedReservation.userId ?? "—"}
            />
            <DetailRow
              label="Bàn"
              value={
                selectedReservation.tableCode ||
                (selectedReservation.tableId
                  ? `Bàn #${selectedReservation.tableId}`
                  : "Chưa chọn bàn")
              }
            />
            <DetailRow
              label="Thời gian bắt đầu"
              value={formatDateTime(selectedReservation.reservationTime)}
            />
            <DetailRow
              label="Thời gian kết thúc"
              value={formatDateTime(selectedReservation.reservationEndTime)}
            />
            <DetailRow
              label="Số lượng khách"
              value={`${selectedReservation.guestCount} người`}
            />
            <DetailRow
              label="Ghi chú"
              value={selectedReservation.customerNote || "Không có ghi chú"}
            />
            <DetailRow
              label="Ngày tạo"
              value={formatDateTime(selectedReservation.createdAt)}
            />
            <DetailRow
              label="Cập nhật lần cuối"
              value={formatDateTime(selectedReservation.updatedAt)}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowDetail(false);
                setSelectedReservation(null);
              }}
              className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
        </Modal>
      )}

      {/* Modal chỉnh sửa */}
      {showEdit && selectedReservation && (
        <Modal
          title={`Chỉnh sửa ${selectedReservation.reservationCode}`}
          onClose={() => {
            if (processing) return;
            setShowEdit(false);
            setSelectedReservation(null);
          }}
        >
          <form onSubmit={handleUpdateReservation} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Chọn bàn
              </label>
              <select
                name="tableId"
                value={form.tableId}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Để nhà hàng sắp xếp bàn</option>
                {tables
                  .filter(
                    (table) =>
                      table.isActive &&
                      table.tableStatus !== "MAINTENANCE"
                  )
                  .map((table) => (
                    <option
                      key={table.tableId}
                      value={table.tableId}
                    >
                      {table.tableCode} - {table.capacity} chỗ
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Bàn sẽ được kiểm tra sức chứa và lịch đặt trùng ở backend.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  name="reservationTime"
                  value={form.reservationTime}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Thời gian kết thúc
                </label>
                <input
                  type="datetime-local"
                  name="reservationEndTime"
                  value={form.reservationEndTime}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Số lượng khách
              </label>
              <input
                type="number"
                name="guestCount"
                min="1"
                max="100"
                value={form.guestCount}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Ghi chú của khách hàng
              </label>
              <textarea
                name="customerNote"
                value={form.customerNote}
                onChange={handleFormChange}
                rows={3}
                maxLength={1000}
                placeholder="Nhập ghi chú nếu có..."
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                disabled={processing}
                onClick={() => {
                  setShowEdit(false);
                  setSelectedReservation(null);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Đóng
              </button>

              <button
                type="submit"
                disabled={processing}
                className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {processing ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 pb-3 sm:grid-cols-[170px_1fr] sm:gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="break-words text-sm font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}
