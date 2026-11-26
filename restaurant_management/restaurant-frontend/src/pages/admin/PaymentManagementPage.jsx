
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  X,
  QrCode,
  Copy,
  Wallet,
  Building2,
  Clock,
  Receipt,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import api from "../../services/api";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ thanh toán",
    className: "bg-amber-100 text-amber-700",
  },
  SUCCESS: {
    label: "Thành công",
    className: "bg-green-100 text-green-700",
  },
  FAILED: {
    label: "Thất bại",
    className: "bg-red-100 text-red-700",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "bg-purple-100 text-purple-700",
  },
};

const METHOD_CONFIG = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản VietQR",
  ONLINE: "Thanh toán trực tuyến",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN");
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.message ||
    error?.message ||
    "Đã xảy ra lỗi. Vui lòng thử lại."
  );
};

const getCurrentRoles = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem("auth_user") || "{}"
    );

    const roles =
      user?.roles ||
      user?.authorities ||
      (user?.role ? [user.role] : []);

    return roles.map((item) =>
      String(
        typeof item === "object"
          ? item.authority || item.role
          : item
      )
        .replace("ROLE_", "")
        .toUpperCase()
    );
  } catch {
    return [];
  }
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Không xác định",
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function PaymentDetailModal({
  payment,
  onClose,
  onCopy,
  onConfirmBankTransfer,
  processing,
}) {
  if (!payment) return null;

  const isBankTransfer =
    payment.paymentMethod === "BANK_TRANSFER";

  const isPending =
    payment.paymentStatus === "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Chi tiết thanh toán
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Mã thanh toán: #{payment.paymentId}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Mã đơn hàng
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {payment.orderCode || `#${payment.orderId}`}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Khách hàng
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {payment.username || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Phương thức
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {METHOD_CONFIG[payment.paymentMethod] ||
                  payment.paymentMethod}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Trạng thái
              </p>

              <div className="mt-2">
                <StatusBadge status={payment.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Tổng tiền thanh toán
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-800">
              {formatCurrency(payment.amount)}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">
                Thời gian tạo
              </p>

              <p className="mt-1 text-gray-800">
                {formatDate(payment.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Thời gian thanh toán
              </p>

              <p className="mt-1 text-gray-800">
                {formatDate(payment.paidAt)}
              </p>
            </div>
          </div>

          {isBankTransfer && isPending && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <QrCode
                  className="text-emerald-700"
                  size={21}
                />

                <h3 className="font-bold text-emerald-800">
                  Thông tin chuyển khoản VietQR
                </h3>
              </div>

              {payment.qrCodeUrl ? (
                <div className="mb-4 flex justify-center">
                  <img
                    src={payment.qrCodeUrl}
                    alt="Mã QR thanh toán"
                    className="h-56 w-56 rounded-lg border bg-white object-contain p-2"
                  />
                </div>
              ) : (
                <p className="mb-4 text-sm text-gray-600">
                  Chưa có đường dẫn mã QR. Vui lòng kiểm tra
                  thông tin thanh toán từ backend.
                </p>
              )}

              <div className="space-y-3 rounded-lg bg-white p-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Ngân hàng
                  </p>

                  <p className="font-semibold text-gray-800">
                    {payment.bankName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Số tài khoản
                  </p>

                  <p className="font-semibold text-gray-800">
                    {payment.accountNumber || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Tên chủ tài khoản
                  </p>

                  <p className="font-semibold text-gray-800">
                    {payment.accountName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Số tiền
                  </p>

                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Nội dung chuyển khoản
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="break-all font-bold text-gray-800">
                      {payment.transferContent || "—"}
                    </p>

                    {payment.transferContent && (
                      <button
                        onClick={() =>
                          onCopy(payment.transferContent)
                        }
                        className="shrink-0 rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"
                        title="Sao chép nội dung"
                      >
                        <Copy size={17} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle
                  size={17}
                  className="mr-1 inline"
                />

                Nhân viên cần kiểm tra giao dịch thực tế trên
                ứng dụng ngân hàng trước khi xác nhận. Không
                xác nhận chỉ dựa vào ảnh chụp màn hình khách
                hàng cung cấp.
              </div>

              <div className="mt-4">
                <button
                  onClick={onConfirmBankTransfer}
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? (
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <ShieldCheck size={18} />
                  )}

                  Xác nhận đã nhận tiền
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [message, setMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const roles = useMemo(() => getCurrentRoles(), []);

  const canRefund =
    roles.includes("ADMIN") || roles.includes("MANAGER");

  const showMessage = (type, text) => {
    setMessage({ type, text });

    window.setTimeout(() => {
      setMessage(null);
    }, 3500);
  };

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/payments");

      setPayments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      showMessage("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return payments
      .filter((payment) => {
        const matchesSearch =
          !keyword ||
          String(payment.paymentId).includes(keyword) ||
          String(payment.orderId).includes(keyword) ||
          String(payment.orderCode || "")
            .toLowerCase()
            .includes(keyword) ||
          String(payment.username || "")
            .toLowerCase()
            .includes(keyword);

        const matchesStatus =
          statusFilter === "ALL" ||
          payment.paymentStatus === statusFilter;

        const matchesMethod =
          methodFilter === "ALL" ||
          payment.paymentMethod === methodFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesMethod
        );
      })
      .sort((a, b) => {
        if (
          a.paymentStatus === "PENDING" &&
          b.paymentStatus !== "PENDING"
        ) {
          return -1;
        }

        if (
          a.paymentStatus !== "PENDING" &&
          b.paymentStatus === "PENDING"
        ) {
          return 1;
        }

        return (
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
        );
      });
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const statistics = useMemo(
    () => ({
      total: payments.length,

      pending: payments.filter(
        (item) => item.paymentStatus === "PENDING"
      ).length,

      success: payments.filter(
        (item) => item.paymentStatus === "SUCCESS"
      ).length,

      refunded: payments.filter(
        (item) => item.paymentStatus === "REFUNDED"
      ).length,

      revenue: payments
        .filter(
          (item) => item.paymentStatus === "SUCCESS"
        )
        .reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        ),
    }),
    [payments]
  );

  const viewPayment = async (paymentId) => {
    try {
      const response = await api.get(
        `/payments/${paymentId}`
      );

      setSelectedPayment(response.data);
    } catch (error) {
      showMessage("error", getErrorMessage(error));
    }
  };

  const performAction = async (payment, action) => {
    const actionConfig = {
      confirm: {
        url: `/payments/${payment.paymentId}/confirm`,
        label: "xác nhận thanh toán tiền mặt",
      },

      fail: {
        url: `/payments/${payment.paymentId}/fail`,
        label: "đánh dấu thanh toán thất bại",
      },

      refund: {
        url: `/payments/${payment.paymentId}/refund`,
        label: "hoàn tiền",
      },
    };

    const config = actionConfig[action];

    if (!config) return;

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn ${config.label}?`
      )
    ) {
      return;
    }

    try {
      setProcessingId(payment.paymentId);

      await api.patch(config.url);

      showMessage("success", "Thao tác thành công.");

      setSelectedPayment(null);

      await fetchPayments();
    } catch (error) {
      showMessage("error", getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  // Xác nhận chuyển khoản, không cần mã giao dịch
  const confirmBankTransfer = async () => {
    if (!selectedPayment) return;

    const confirmed = window.confirm(
      "Bạn đã kiểm tra tài khoản ngân hàng và xác nhận đã nhận đúng số tiền của đơn hàng này?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(selectedPayment.paymentId);

      // Không gửi transactionCode
      await api.patch(
        `/payments/${selectedPayment.paymentId}/confirm`
      );

      showMessage(
        "success",
        "Đã xác nhận thanh toán chuyển khoản thành công."
      );

      setSelectedPayment(null);

      await fetchPayments();
    } catch (error) {
      showMessage("error", getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);

      showMessage(
        "success",
        "Đã sao chép nội dung chuyển khoản."
      );
    } catch {
      showMessage(
        "error",
        "Không thể sao chép nội dung."
      );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý thanh toán
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Theo dõi giao dịch tiền mặt và chuyển khoản VietQR
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          Làm mới
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          {String(message.text)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Tổng giao dịch
            </p>

            <CreditCard
              className="text-blue-600"
              size={22}
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-800">
            {statistics.total}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Đang chờ
            </p>

            <Clock
              className="text-amber-500"
              size={22}
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-amber-600">
            {statistics.pending}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Thành công
            </p>

            <CheckCircle
              className="text-green-600"
              size={22}
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-green-600">
            {statistics.success}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Doanh thu đã thanh toán
            </p>

            <Wallet
              className="text-emerald-600"
              size={22}
            />
          </div>

          <p className="mt-3 text-xl font-bold text-emerald-700">
            {formatCurrency(statistics.revenue)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Tìm mã thanh toán, đơn hàng, khách hàng..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>

          <select
            value={methodFilter}
            onChange={(event) =>
              setMethodFilter(event.target.value)
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả phương thức</option>
            <option value="CASH">Tiền mặt</option>
            <option value="BANK_TRANSFER">
              Chuyển khoản VietQR
            </option>
            <option value="ONLINE">
              Thanh toán trực tuyến
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-bold text-gray-800">
            Danh sách giao dịch
          </h2>

          <span className="text-sm text-gray-500">
            {filteredPayments.length} giao dịch
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw
              size={19}
              className="animate-spin"
            />

            Đang tải dữ liệu...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Receipt size={40} className="mb-3" />

            <p>Không tìm thấy giao dịch thanh toán</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">
                    Mã thanh toán
                  </th>

                  <th className="px-5 py-4">
                    Đơn hàng
                  </th>

                  <th className="px-5 py-4">
                    Khách hàng
                  </th>

                  <th className="px-5 py-4">
                    Phương thức
                  </th>

                  <th className="px-5 py-4">
                    Số tiền
                  </th>

                  <th className="px-5 py-4">
                    Trạng thái
                  </th>

                  <th className="px-5 py-4">
                    Ngày tạo
                  </th>

                  <th className="px-5 py-4 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.paymentId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      #{payment.paymentId}
                    </td>

                    <td className="px-5 py-4 font-medium text-blue-700">
                      {payment.orderCode ||
                        `#${payment.orderId}`}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {payment.username || "—"}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        {payment.paymentMethod ===
                        "BANK_TRANSFER" ? (
                          <Building2
                            size={16}
                            className="text-blue-600"
                          />
                        ) : (
                          <Wallet
                            size={16}
                            className="text-gray-500"
                          />
                        )}

                        {METHOD_CONFIG[payment.paymentMethod] ||
                          payment.paymentMethod}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={payment.paymentStatus}
                      />
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            viewPayment(payment.paymentId)
                          }
                          title="Xem chi tiết / xác nhận chuyển khoản"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>

                        {payment.paymentStatus === "PENDING" &&
                          payment.paymentMethod === "CASH" && (
                            <button
                              onClick={() =>
                                performAction(payment, "confirm")
                              }
                              disabled={
                                processingId === payment.paymentId
                              }
                              title="Xác nhận thanh toán tiền mặt"
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                            >
                              <CheckCircle size={17} />
                            </button>
                          )}

                        {payment.paymentStatus === "PENDING" && (
                          <button
                            onClick={() =>
                              performAction(payment, "fail")
                            }
                            disabled={
                              processingId === payment.paymentId
                            }
                            title="Đánh dấu thất bại"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={17} />
                          </button>
                        )}

                        {canRefund &&
                          payment.paymentStatus === "SUCCESS" && (
                            <button
                              onClick={() =>
                                performAction(payment, "refund")
                              }
                              disabled={
                                processingId === payment.paymentId
                              }
                              title="Hoàn tiền"
                              className="rounded-lg p-2 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
                            >
                              <RotateCcw size={17} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onCopy={copyText}
          onConfirmBankTransfer={confirmBankTransfer}
          processing={
            processingId === selectedPayment.paymentId
          }
        />
      )}
    </div>
  );
}
