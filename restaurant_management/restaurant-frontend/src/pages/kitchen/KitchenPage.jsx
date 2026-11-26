
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChefHat,
  Clock,
  RefreshCw,
  Play,
  CheckCircle2,
  Utensils,
  ClipboardList,
  AlertCircle,
  Search,
  X,
  History,
  Printer,
} from "lucide-react";
import api from "../../services/api";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ chế biến",
    color: "bg-amber-100 text-amber-700",
    button: "Bắt đầu chế biến",
  },
  PREPARING: {
    label: "Đang chế biến",
    color: "bg-blue-100 text-blue-700",
    button: "Hoàn thành món",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700",
  },
};

const formatDateTime = (value) => {
  if (!value) return "Chưa có thông tin";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa có thông tin";
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.response?.data?.detail ||
  error.message ||
  "Đã xảy ra lỗi. Vui lòng thử lại.";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function KitchenPage() {
  const [items, setItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keyword, setKeyword] = useState("");

  const fetchKitchenItems = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [activeResponse, completedResponse] = await Promise.all([
        api.get("/kitchen/items"),
        api.get("/kitchen/items/completed"),
      ]);

      setItems(
        Array.isArray(activeResponse.data)
          ? activeResponse.data
          : []
      );

      setCompletedItems(
        Array.isArray(completedResponse.data)
          ? completedResponse.data
          : []
      );

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchKitchenItems();

    const interval = setInterval(() => {
      fetchKitchenItems(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchKitchenItems]);

  // In phiếu bếp 80mm theo toàn bộ món thuộc cùng đơn hàng.
  const handlePrintTicket = (selectedItem) => {
    const orderItems = [...items, ...completedItems].filter(
      (item) =>
        String(item.orderId) === String(selectedItem.orderId)
    );

    const uniqueItems = Array.from(
      new Map(
        orderItems.map((item) => [
          item.orderItemId,
          item,
        ])
      ).values()
    );

    if (uniqueItems.length === 0) {
      setError("Không tìm thấy món ăn để in phiếu.");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=450,height=700"
    );

    if (!printWindow) {
      setError(
        "Trình duyệt đã chặn cửa sổ in. Hãy cho phép cửa sổ bật lên rồi thử lại."
      );
      return;
    }

    const firstItem = uniqueItems[0];

    const itemRows = uniqueItems
      .map(
        (item, index) => `
          <div class="item">
            <div class="item-main">
              <span class="dish-name">
                ${index + 1}. ${escapeHtml(item.dishName)}
              </span>
              <span class="quantity">
                x${escapeHtml(item.quantity)}
              </span>
            </div>

            ${
              item.itemNote
                ? `
                  <div class="note">
                    GHI CHÚ: ${escapeHtml(item.itemNote)}
                  </div>
                `
                : ""
            }
          </div>
        `
      )
      .join("");

    const orderType =
      firstItem.orderType === "DINE_IN"
        ? "ĂN TẠI QUÁN"
        : "GIAO HÀNG";

    const tableInfo =
      firstItem.orderType === "DINE_IN"
        ? `
          <div class="info-row">
            <span>Bàn:</span>
            <strong>${escapeHtml(
              firstItem.tableCode || "Chưa xác định"
            )}</strong>
          </div>
        `
        : "";

    const printDocument = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>Phiếu bếp ${escapeHtml(
          firstItem.orderCode || firstItem.orderId
        )}</title>

        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
            color: #000;
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            padding: 4mm;
            font-size: 12px;
            line-height: 1.45;
            overflow-wrap: break-word;
          }

          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }

          h1 {
            font-size: 21px;
            font-weight: 900;
            margin: 0 0 4px;
            letter-spacing: 1px;
          }

          .subtitle {
            font-size: 11px;
            font-weight: bold;
            margin: 0;
          }

          .order-info {
            border-bottom: 1px dashed #000;
            padding-bottom: 9px;
            margin-bottom: 9px;
          }

          .order-code {
            text-align: center;
            font-size: 19px;
            font-weight: 900;
            margin-bottom: 9px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin: 4px 0;
          }

          .order-type {
            text-align: center;
            font-size: 13px;
            font-weight: 900;
            border: 1px solid #000;
            padding: 5px;
            margin-top: 8px;
          }

          .items-title {
            font-size: 13px;
            font-weight: 900;
            margin: 10px 0 4px;
          }

          .item {
            padding: 9px 0;
            border-bottom: 1px dotted #555;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .item-main {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
            font-size: 15px;
            font-weight: 900;
          }

          .dish-name {
            flex: 1;
            overflow-wrap: anywhere;
          }

          .quantity {
            font-size: 16px;
            white-space: nowrap;
          }

          .note {
            margin-top: 6px;
            padding: 5px 6px;
            border: 1px dashed #000;
            font-size: 12px;
            font-weight: bold;
            overflow-wrap: anywhere;
          }

          .footer {
            text-align: center;
            margin-top: 14px;
            padding-top: 9px;
            border-top: 1px dashed #000;
            font-size: 12px;
            font-weight: 900;
          }

          @media screen {
            body {
              width: 80mm;
              margin: 0 auto;
            }
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1>PHIẾU BẾP</h1>
          <p class="subtitle">KITCHEN ORDER TICKET</p>
        </div>

        <div class="order-info">
          <div class="order-code">
            ${escapeHtml(
              firstItem.orderCode || `ĐƠN #${firstItem.orderId}`
            )}
          </div>

          <div class="info-row">
            <span>Thời gian:</span>
            <strong>
              ${escapeHtml(
                formatDateTime(firstItem.sentToKitchenAt)
              )}
            </strong>
          </div>

          ${tableInfo}

          <div class="order-type">
            ${orderType}
          </div>
        </div>

        <div class="items-title">
          DANH SÁCH MÓN (${uniqueItems.length})
        </div>

        ${itemRows}

        <div class="footer">
          VUI LÒNG CHẾ BIẾN ĐÚNG YÊU CẦU
        </div>

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.focus();
              window.print();
            }, 300);
          };

          window.onafterprint = function () {
            window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setError("");
  };

  const handleUpdateStatus = async (item) => {
    const itemId = item.orderItemId;
    const isPending = item.itemStatus === "PENDING";

    const endpoint = isPending
      ? `/kitchen/items/${itemId}/preparing`
      : `/kitchen/items/${itemId}/complete`;

    try {
      setProcessingId(itemId);
      setError("");
      setSuccess("");

      await api.patch(endpoint);

      setSuccess(
        isPending
          ? `Đã bắt đầu chế biến: ${item.dishName}`
          : `Đã hoàn thành: ${item.dishName}`
      );

      await fetchKitchenItems(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const pendingItems = useMemo(
    () => items.filter((item) => item.itemStatus === "PENDING"),
    [items]
  );

  const preparingItems = useMemo(
    () => items.filter((item) => item.itemStatus === "PREPARING"),
    [items]
  );

  const filteredCompletedItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return completedItems;

    return completedItems.filter((item) =>
      [
        item.orderCode,
        item.dishName,
        item.tableCode,
        String(item.orderId || ""),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [completedItems, keyword]);

  const filteredPendingItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return pendingItems;

    return pendingItems.filter((item) =>
      [
        item.orderCode,
        item.dishName,
        item.tableCode,
        String(item.orderId || ""),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [pendingItems, keyword]);

  const filteredPreparingItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return preparingItems;

    return preparingItems.filter((item) =>
      [
        item.orderCode,
        item.dishName,
        item.tableCode,
        String(item.orderId || ""),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [preparingItems, keyword]);

  const renderItemCard = (item, isCompleted = false) => {
    const config = STATUS_CONFIG[item.itemStatus];
    const isPending = item.itemStatus === "PENDING";
    const isProcessing = processingId === item.orderItemId;

    return (
      <div
        key={item.orderItemId}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-900">
              {item.orderCode || `Đơn #${item.orderId}`}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {item.orderType === "DINE_IN"
                ? `Tại bàn: ${item.tableCode || "Chưa xác định"}`
                : "Đơn giao hàng"}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              config?.color || "bg-gray-100 text-gray-600"
            }`}
          >
            {config?.label || item.itemStatus}
          </span>
        </div>

        <div className="border-t border-dashed border-gray-200 py-3">
          <div className="flex items-start gap-2">
            <Utensils
              size={18}
              className="mt-0.5 shrink-0 text-orange-600"
            />

            <div>
              <p className="font-semibold text-gray-900">
                {item.dishName}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Số lượng:{" "}
                <span className="font-bold text-gray-800">
                  x{item.quantity}
                </span>
              </p>
            </div>
          </div>

          {item.itemNote && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase text-amber-700">
                Ghi chú món ăn
              </p>

              <p className="mt-1 text-sm text-amber-900">
                {item.itemNote}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>
              Gửi xuống bếp: {formatDateTime(item.sentToKitchenAt)}
            </span>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-2 font-medium text-green-700">
              <CheckCircle2 size={14} />
              <span>
                Hoàn thành lúc: {formatDateTime(item.completedAt)}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handlePrintTicket(item)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
        >
          <Printer size={16} />
          In phiếu bếp
        </button>

        {!isCompleted && (
          <button
            type="button"
            onClick={() => handleUpdateStatus(item)}
            disabled={isProcessing}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isPending
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isProcessing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : isPending ? (
              <Play size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}

            {isProcessing
              ? "Đang cập nhật..."
              : config?.button || "Cập nhật"}
          </button>
        )}
      </div>
    );
  };

  const renderColumn = (
    title,
    description,
    data,
    color,
    icon,
    isCompleted = false
  ) => (
    <section className="min-w-0 rounded-xl bg-gray-100 p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}

          <div>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${color}`}
        >
          {data.length}
        </span>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <ClipboardList
              size={28}
              className="mx-auto mb-2 text-gray-300"
            />

            <p className="text-sm text-gray-500">
              {keyword
                ? "Không tìm thấy món phù hợp"
                : "Không có món ăn"}
            </p>
          </div>
        ) : (
          data.map((item) => renderItemCard(item, isCompleted))
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen space-y-5 bg-gray-50 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="text-orange-600" size={30} />

            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý bếp
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và cập nhật trạng thái chế biến món ăn
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchKitchenItems(false)}
          disabled={refreshing || loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing || loading ? "animate-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Tổng món đang xử lý</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {items.length}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4">
          <p className="text-sm text-gray-500">Chờ chế biến</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {pendingItems.length}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-white p-4">
          <p className="text-sm text-gray-500">Đang chế biến</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {preparingItems.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo mã đơn, tên món hoặc bàn..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Xóa tìm kiếm"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white p-12 text-center text-gray-500">
          <RefreshCw
            size={28}
            className="mx-auto mb-3 animate-spin"
          />
          Đang tải danh sách món ăn...
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          {renderColumn(
            "Chờ chế biến",
            "Món mới gửi xuống bếp",
            filteredPendingItems,
            "bg-amber-100 text-amber-700",
            <Clock className="text-amber-600" size={20} />
          )}

          {renderColumn(
            "Đang chế biến",
            "Các món đang được thực hiện",
            filteredPreparingItems,
            "bg-blue-100 text-blue-700",
            <ChefHat className="text-blue-600" size={20} />
          )}

          {renderColumn(
            "Vừa hoàn thành",
            "Lịch sử 100 món hoàn thành gần nhất",
            filteredCompletedItems,
            "bg-green-100 text-green-700",
            <History className="text-green-600" size={20} />,
            true
          )}
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Danh sách tự động cập nhật mỗi 15 giây.
      </p>
    </div>
  );
}

export default KitchenPage;
