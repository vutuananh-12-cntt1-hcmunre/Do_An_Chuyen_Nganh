
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  Armchair,
  RefreshCw,
  XCircle,
  CheckCircle2,
  LoaderCircle,
  ClipboardList,
} from "lucide-react";

import api from "../services/api";

function getLocalDateTimeParts(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function formatDateTime(value) {
  if (!value) return "Chưa có thông tin";

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

function getStatusInfo(status) {
  const statuses = {
    PENDING: {
      label: "Chờ xác nhận",
      className: "bg-amber-100 text-amber-700",
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      className: "bg-green-100 text-green-700",
    },
    SEATED: {
      label: "Đang sử dụng bàn",
      className: "bg-blue-100 text-blue-700",
    },
    COMPLETED: {
      label: "Đã hoàn thành",
      className: "bg-gray-100 text-gray-700",
    },
    CANCELLED: {
      label: "Đã hủy",
      className: "bg-red-100 text-red-700",
    },
    NO_SHOW: {
      label: "Không đến",
      className: "bg-red-100 text-red-700",
    },
  };

  return statuses[status] || {
    label: status || "Không xác định",
    className: "bg-gray-100 text-gray-700",
  };
}

function getReservationId(item) {
  return item.reservationId ?? item.id;
}

export default function ReservationPage() {
  const initialDateTime = getLocalDateTimeParts(
    new Date(Date.now() + 60 * 60 * 1000)
  );

  const [reservationDate, setReservationDate] = useState(
    initialDateTime.date
  );
  const [reservationTime, setReservationTime] = useState(
    initialDateTime.time
  );
  const [guestCount, setGuestCount] = useState(2);
  const [tableId, setTableId] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [reservationResult, tableResult] = await Promise.allSettled([
        api.get("/reservations/my"),
        api.get("/tables"),
      ]);

      if (reservationResult.status === "fulfilled") {
        const data = reservationResult.value.data;
        setReservations(Array.isArray(data) ? data : []);
      } else {
        setError("Không thể tải lịch sử đặt bàn.");
      }

      if (tableResult.status === "fulfilled") {
        const data = tableResult.value.data;
        const tableList = Array.isArray(data) ? data : [];

        setTables(
          tableList.filter(
            (table) =>
              table.isActive === true &&
              table.tableStatus === "AVAILABLE"
          )
        );
      } else {
        setTables([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể kết nối đến máy chủ."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!reservationDate || !reservationTime) {
      setError("Vui lòng chọn ngày và giờ đặt bàn.");
      return;
    }

    const startDateTime = new Date(
      `${reservationDate}T${reservationTime}:00`
    );

    if (Number.isNaN(startDateTime.getTime())) {
      setError("Thời gian đặt bàn không hợp lệ.");
      return;
    }

    if (startDateTime <= new Date()) {
      setError("Thời gian đặt bàn phải ở tương lai.");
      return;
    }

    if (!Number.isInteger(Number(guestCount)) || Number(guestCount) <= 0) {
      setError("Số lượng khách phải lớn hơn 0.");
      return;
    }

    // Thời lượng mặc định của một lượt đặt bàn là 2 giờ.
    const endDateTime = new Date(
      startDateTime.getTime() + 2 * 60 * 60 * 1000
    );

    const toLocalDateTimeString = (date) => {
      const pad = (value) => String(value).padStart(2, "0");

      return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
      );
    };

    const requestData = {
      tableId: tableId ? Number(tableId) : null,
      reservationTime: toLocalDateTimeString(startDateTime),
      reservationEndTime: toLocalDateTimeString(endDateTime),
      guestCount: Number(guestCount),
      customerNote: customerNote.trim(),
    };

    setSubmitting(true);

    try {
      await api.post("/reservations", requestData);

      setSuccess(
        "Đặt bàn thành công! Yêu cầu đang chờ nhà hàng xác nhận."
      );

      setCustomerNote("");
      setTableId("");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Đặt bàn thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy lượt đặt bàn này?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setCancellingId(reservationId);

    try {
      await api.patch(
        `/reservations/${reservationId}/cancel`
      );

      setSuccess("Đã gửi yêu cầu hủy đặt bàn thành công.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể hủy lượt đặt bàn này."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const minimumDateTime = getLocalDateTimeParts(
    new Date(Date.now() + 60 * 60 * 1000)
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
            Bếp Mận & Lửa
          </p>

          <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
            Đặt bàn trước
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Đặt trước chỗ ngồi để nhà hàng chuẩn bị và phục vụ
            bạn chu đáo hơn.
          </p>
        </div>

        {(error || success) && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          {/* FORM ĐẶT BÀN */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-700">
                <CalendarDays size={23} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Thông tin đặt bàn
                </h2>
                <p className="text-sm text-gray-500">
                  Vui lòng điền thông tin bên dưới
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ngày đặt bàn
                </label>

                <input
                  type="date"
                  required
                  min={minimumDateTime.date}
                  value={reservationDate}
                  onChange={(event) =>
                    setReservationDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giờ đến
                </label>

                <div className="relative">
                  <Clock3
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="time"
                    required
                    value={reservationTime}
                    onChange={(event) =>
                      setReservationTime(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Thời lượng đặt bàn mặc định là 2 giờ.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Số lượng khách
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={guestCount}
                    onChange={(event) =>
                      setGuestCount(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Chọn bàn (không bắt buộc)
                </label>

                <div className="relative">
                  <Armchair
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <select
                    value={tableId}
                    onChange={(event) =>
                      setTableId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">
                      Nhà hàng sắp xếp bàn phù hợp
                    </option>

                    {tables.map((table) => (
                      <option
                        key={table.tableId}
                        value={table.tableId}
                        disabled={
                          Number(table.capacity) < Number(guestCount)
                        }
                      >
                        {table.tableCode} - {table.capacity} người
                        {Number(table.capacity) < Number(guestCount)
                          ? " (Không đủ chỗ)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Bàn được xác nhận dựa trên tình trạng thực tế
                  và lịch đặt của nhà hàng.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ghi chú
                </label>

                <textarea
                  rows="3"
                  value={customerNote}
                  onChange={(event) =>
                    setCustomerNote(event.target.value)
                  }
                  placeholder="Ví dụ: cần ghế trẻ em, vị trí gần cửa sổ..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  <>
                    <CalendarDays size={19} />
                    Gửi yêu cầu đặt bàn
                  </>
                )}
              </button>
            </form>
          </section>

          {/* THÔNG TIN */}
          <section className="space-y-6">
            <div className="rounded-2xl bg-[#3b241b] p-6 text-white sm:p-8">
              <CalendarDays
                size={30}
                className="mb-5 text-orange-300"
              />

              <h2 className="text-xl font-bold">
                Đặt bàn dễ dàng
              </h2>

              <p className="mt-3 text-sm leading-7 text-orange-100">
                Gửi yêu cầu đặt bàn trực tuyến. Nhà hàng sẽ kiểm
                tra lịch bàn và xác nhận yêu cầu của bạn.
              </p>

              <div className="mt-6 space-y-3 text-sm text-orange-100">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Chủ động chọn thời gian
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Có thể yêu cầu chọn bàn
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Theo dõi trạng thái đặt bàn
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">
                Lưu ý khi đặt bàn
              </h3>

              <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-6 text-gray-600">
                <li>Thời gian đặt bàn phải ở tương lai.</li>
                <li>Yêu cầu mới sẽ ở trạng thái chờ xác nhận.</li>
                <li>Nhà hàng kiểm tra sức chứa và lịch bàn trước khi xác nhận.</li>
                <li>Bạn có thể hủy yêu cầu khi chưa đến thời gian sử dụng bàn.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* LỊCH SỬ ĐẶT BÀN */}
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Lịch sử đặt bàn
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi các yêu cầu đặt bàn của bạn
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center rounded-2xl border border-gray-100 bg-white py-12">
              <LoaderCircle
                size={28}
                className="animate-spin text-orange-700"
              />
            </div>
          ) : reservations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <ClipboardList
                size={38}
                className="mx-auto text-gray-300"
              />
              <p className="mt-3 font-semibold text-gray-700">
                Bạn chưa có lượt đặt bàn nào
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Các yêu cầu đặt bàn sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reservations.map((item) => {
                const reservationId = getReservationId(item);
                const status = getStatusInfo(
                  item.reservationStatus
                );

                const canCancel =
                  item.reservationStatus === "PENDING" ||
                  item.reservationStatus === "CONFIRMED";

                return (
                  <article
                    key={reservationId}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                          Mã đặt bàn
                        </p>

                        <h3 className="mt-1 font-bold text-gray-900">
                          {item.reservationCode ||
                            `#${reservationId}`}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays
                          size={17}
                          className="text-orange-700"
                        />
                        {formatDateTime(item.reservationTime)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Clock3
                          size={17}
                          className="text-orange-700"
                        />
                        Kết thúc:{" "}
                        {formatDateTime(item.reservationEndTime)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Users
                          size={17}
                          className="text-orange-700"
                        />
                        {item.guestCount} khách
                      </p>

                      <p className="flex items-center gap-2">
                        <Armchair
                          size={17}
                          className="text-orange-700"
                        />
                        {item.tableCode || "Nhà hàng sắp xếp bàn"}
                      </p>

                      {item.customerNote && (
                        <p className="rounded-lg bg-gray-50 p-3 text-gray-600">
                          Ghi chú: {item.customerNote}
                        </p>
                      )}
                    </div>

                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancellingId === reservationId}
                        onClick={() => handleCancel(reservationId)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {cancellingId === reservationId ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={17} />
                        )}
                        Hủy đặt bàn
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
