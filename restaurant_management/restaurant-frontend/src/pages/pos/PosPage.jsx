
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, RefreshCw,
  Utensils, Truck, ClipboardList, AlertCircle, Banknote,
  QrCode, TicketPercent, ChevronDown, X, Copy,
  CheckCircle2, Clock3,
} from "lucide-react";
import api from "../../services/api";

const API_BASE_URL = "http://localhost:8080";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

const getImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return "";
  const path = imageUrl.trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/uploads/dishes/${path}`;
};

const unwrapData = (response) => {
  const data = response?.data;
  return data?.data ?? data;
};

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  return (
    data?.message ||
    data?.error ||
    (typeof data === "string" ? data : null) ||
    err?.message ||
    fallback
  );
};

const styles = {
  page: {
    padding: "20px",
    color: "#1f2937",
    background: "#f8fafc",
    minHeight: "100%",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 750,
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    marginTop: "5px",
    fontSize: "13px",
  },
  button: {
    border: 0,
    borderRadius: "8px",
    padding: "10px 13px",
    cursor: "pointer",
    fontWeight: 650,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "13px",
    minHeight: "40px",
    transition: "background .15s ease",
  },
  primary: { background: "#2563eb", color: "#fff" },
  secondary: {
    background: "#fff",
    color: "#334155",
    border: "1px solid #cbd5e1",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 350px)",
    gap: "16px",
    alignItems: "start",
    minWidth: 0,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "10px 11px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    fontSize: "13px",
    boxSizing: "border-box",
    background: "#fff",
    color: "#1f2937",
  },
  muted: { color: "#64748b", fontSize: "12px" },
  categoryButton: {
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "8px 13px",
    cursor: "pointer",
    background: "#fff",
    whiteSpace: "nowrap",
    fontSize: "12px",
    fontWeight: 600,
    minHeight: "36px",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
    gap: "12px",
    marginTop: "15px",
  },
  product: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fff",
    minWidth: 0,
  },
  productImage: {
    width: "100%",
    height: "112px",
    objectFit: "cover",
    background: "#f1f5f9",
    display: "block",
  },
  productImageFallback: {
    width: "100%",
    height: "112px",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    background: "#f1f5f9",
  },
  productBody: { padding: "10px" },
  cartItem: {
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "7px",
    color: "#334155",
  },
  fieldError: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#dc2626",
    fontSize: "12px",
    marginTop: "6px",
  },
  successAlert: {
    padding: "11px 13px",
    borderRadius: "8px",
    marginBottom: "14px",
    fontSize: "13px",
    background: "#f0fdf4",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  errorAlert: {
    padding: "11px 13px",
    borderRadius: "8px",
    marginBottom: "14px",
    fontSize: "13px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },
  promotionWrapper: {
    position: "relative",
    marginBottom: "15px",
    zIndex: 5,
  },
  promotionTrigger: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    padding: "10px 11px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "13px",
    minHeight: "40px",
  },
  promotionPopup: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "calc(100% + 6px)",
    maxHeight: "220px",
    overflowY: "auto",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.16)",
    zIndex: 20,
  },
  promotionOption: {
    width: "100%",
    display: "block",
    padding: "10px 11px",
    border: 0,
    borderBottom: "1px solid #f1f5f9",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "8px",
    fontSize: "13px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px",
  },
  modal: {
    width: "100%",
    maxWidth: "460px",
    maxHeight: "92dvh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
  },
};

function FieldError({ children }) {
  if (!children) return null;

  return (
    <div role="alert" style={styles.fieldError}>
      <AlertCircle size={14} />
      <span>{children}</span>
    </div>
  );
}

export default function PosPage() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("DINE_IN");
  const [tableId, setTableId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [promotionCode, setPromotionCode] = useState("");
  const [promotionError, setPromotionError] = useState("");
  const [brokenImages, setBrokenImages] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dishResponse, categoryResponse, tableResponse] =
        await Promise.all([
          api.get("/dishes"),
          api.get("/categories"),
          api.get("/tables"),
        ]);

      const dishData = unwrapData(dishResponse);
      const categoryData = unwrapData(categoryResponse);
      const tableData = unwrapData(tableResponse);

      setDishes(Array.isArray(dishData) ? dishData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setTables(Array.isArray(tableData) ? tableData : []);
      setBrokenImages([]);
    } catch (err) {
      console.error("Không thể tải dữ liệu POS:", err);
      setError(
        getErrorMessage(
          err,
          "Không thể tải dữ liệu món ăn, danh mục hoặc bàn ăn."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    setPromotionLoading(true);
    setPromotionError("");

    try {
      const response = await api.get("/promotions/available");
      const data = unwrapData(response);
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Không thể tải khuyến mãi:", err);
      setPromotions([]);
      setPromotionError(
        getErrorMessage(err, "Không thể tải danh sách khuyến mãi.")
      );
    } finally {
      setPromotionLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadPromotions();
  }, [loadData, loadPromotions]);

  const availableDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const isAvailable =
        dish.isAvailable === true || dish.isAvailable === 1;

      const matchesCategory =
        selectedCategory === "ALL" ||
        String(dish.categoryId) === String(selectedCategory);

      const searchText =
        `${dish.dishName || ""} ${dish.categoryName || ""}`.toLowerCase();

      return (
        isAvailable &&
        matchesCategory &&
        searchText.includes(keyword.trim().toLowerCase())
      );
    });
  }, [dishes, selectedCategory, keyword]);

  const availableTables = useMemo(
    () =>
      tables.filter((table) => {
        const active = table.isActive === true || table.isActive === 1;
        return active && table.tableStatus === "AVAILABLE";
      }),
    [tables]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.currentPrice || 0) * item.quantity,
        0
      ),
    [cart]
  );

  const eligiblePromotions = useMemo(
    () =>
      promotions.filter(
        (promotion) =>
          Number(promotion.minOrderAmount ?? 0) <= subtotal
      ),
    [promotions, subtotal]
  );

  const selectedPromotion = useMemo(
    () =>
      eligiblePromotions.find(
        (promotion) => promotion.promotionCode === promotionCode
      ) || null,
    [eligiblePromotions, promotionCode]
  );

  const promotionDiscountPreview = useMemo(() => {
    if (!selectedPromotion || subtotal <= 0) return 0;

    const value = Number(selectedPromotion.discountValue || 0);
    let discount = 0;

    if (selectedPromotion.discountType === "PERCENTAGE") {
      discount = (subtotal * value) / 100;
    } else if (
      selectedPromotion.discountType === "FIXED_AMOUNT" ||
      selectedPromotion.discountType === "FIXED"
    ) {
      discount = value;
    }

    if (
      selectedPromotion.maxDiscountAmount !== null &&
      selectedPromotion.maxDiscountAmount !== undefined
    ) {
      discount = Math.min(
        discount,
        Number(selectedPromotion.maxDiscountAmount)
      );
    }

    return Math.max(0, Math.min(discount, subtotal));
  }, [selectedPromotion, subtotal]);

  const estimatedTotal = Math.max(0, subtotal - promotionDiscountPreview);

  useEffect(() => {
    if (!promotionCode || promotionLoading) return;

    const stillEligible = eligiblePromotions.some(
      (promotion) => promotion.promotionCode === promotionCode
    );

    if (!stillEligible) setPromotionCode("");
  }, [eligiblePromotions, promotionCode, promotionLoading]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePromotionChange = (code) => {
    setPromotionCode(code);
    setPromotionDropdownOpen(false);
    setPromotionError("");
    setError("");
  };

  const getPromotionLabel = (promotion) => {
    if (!promotion) return "Chọn mã khuyến mãi";

    return `${promotion.promotionCode} - ${
      promotion.promotionName || "Khuyến mãi"
    }`;
  };

  const addToCart = (dish) => {
    if (createdOrder) return;

    setError("");
    setSuccess("");
    clearFieldError("cart");

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.dishId === dish.dishId
      );

      if (existing) {
        return currentCart.map((item) =>
          item.dishId === dish.dishId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          dishId: dish.dishId,
          dishName: dish.dishName,
          currentPrice: Number(dish.currentPrice || 0),
          quantity: 1,
          itemNote: "",
        },
      ];
    });
  };

  const changeQuantity = (dishId, amount) => {
    if (createdOrder) return;

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.dishId === dishId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateItemNote = (dishId, itemNote) => {
    if (createdOrder) return;

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.dishId === dishId ? { ...item, itemNote } : item
      )
    );
  };

  const removeItem = (dishId) => {
    if (createdOrder) return;

    setCart((currentCart) =>
      currentCart.filter((item) => item.dishId !== dishId)
    );
  };

  const handleOrderTypeChange = (type) => {
    if (submitting || createdOrder) return;

    setOrderType(type);
    setTableId("");
    setDeliveryAddress("");
    setFieldErrors({});
    setError("");
    setSuccess("");
  };

  const extractOrder = (responseData) => {
    const result = responseData?.data ?? responseData;
    const orderId =
      typeof result === "number"
        ? result
        : result?.orderId ?? result?.id ?? null;

    return {
      orderId,
      orderCode: result?.orderCode ?? null,
      subtotal: Number(result?.subtotal ?? subtotal),
      discountAmount: Number(result?.discountAmount ?? 0),
      totalAmount: Number(result?.totalAmount ?? 0),
      response: result,
    };
  };

  const createPayment = async (orderId, method) => {
    try {
      const response = await api.post("/payments", {
        orderId: Number(orderId),
        paymentMethod: method,
      });

      return unwrapData(response);
    } catch (err) {
      try {
        const existingResponse = await api.get(
          `/payments/order/${orderId}`
        );

        const existingPayments = unwrapData(existingResponse);

        const pendingPayment = Array.isArray(existingPayments)
          ? existingPayments.find(
              (payment) =>
                payment.paymentStatus === "PENDING" &&
                payment.paymentMethod === method
            )
          : null;

        if (pendingPayment) return pendingPayment;
      } catch (lookupError) {
        console.error("Không thể kiểm tra payment hiện có:", lookupError);
      }

      throw err;
    }
  };

  // POS chỉ được xác nhận tiền mặt.
  // Chuyển khoản phải do ADMIN xác nhận ở trang quản lý thanh toán.
  const confirmCashPayment = async () => {
    if (!paymentInfo?.paymentId || paymentSubmitting) return;

    if (paymentInfo.paymentMethod !== "CASH") {
      setPaymentError(
        "Thanh toán chuyển khoản cần ADMIN xác nhận sau khi kiểm tra tài khoản ngân hàng."
      );
      return;
    }

    setPaymentSubmitting(true);
    setPaymentError("");

    try {
      await api.patch(
        `/payments/${paymentInfo.paymentId}/confirm`
      );

      setPaymentInfo((current) =>
        current
          ? { ...current, paymentStatus: "SUCCESS" }
          : current
      );

      setSuccess("Đơn hàng và thanh toán tiền mặt đã hoàn tất!");
    } catch (err) {
      console.error("Xác nhận thanh toán thất bại:", err);
      setPaymentError(
        getErrorMessage(err, "Không thể xác nhận thanh toán.")
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // POS chỉ kiểm tra trạng thái, không xác nhận chuyển khoản.
  const refreshPaymentStatus = async () => {
    if (!createdOrder?.orderId || paymentSubmitting) return;

    setPaymentSubmitting(true);
    setPaymentError("");

    try {
      const response = await api.get(
        `/payments/order/${createdOrder.orderId}`
      );

      const payments = unwrapData(response);

      const latestPayment = Array.isArray(payments)
        ? payments.find(
            (payment) =>
              payment.paymentId === paymentInfo?.paymentId
          ) || payments[payments.length - 1]
        : null;

      if (!latestPayment) {
        setPaymentError("Không tìm thấy thông tin thanh toán của đơn.");
        return;
      }

      setPaymentInfo((current) => ({
        ...(current || {}),
        ...latestPayment,
      }));

      if (latestPayment.paymentStatus === "SUCCESS") {
        setSuccess("Thanh toán đã được ADMIN xác nhận thành công!");
        setPaymentError("");
      } else if (latestPayment.paymentStatus === "FAILED") {
        setPaymentError("Giao dịch thanh toán đã thất bại.");
      } else if (latestPayment.paymentStatus === "PENDING") {
        setPaymentError(
          latestPayment.paymentMethod === "BANK_TRANSFER"
            ? "Đang chờ ADMIN kiểm tra và xác nhận tiền chuyển khoản."
            : "Thanh toán vẫn đang chờ xác nhận."
        );
      }
    } catch (err) {
      setPaymentError(
        getErrorMessage(err, "Không thể kiểm tra trạng thái thanh toán.")
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleCreateOrder = async () => {
    if (submitting || createdOrder) return;

    setError("");
    setSuccess("");
    setPaymentInfo(null);
    setPaymentError("");

    const newErrors = {};

    if (cart.length === 0) {
      newErrors.cart = "Vui lòng chọn ít nhất một món ăn.";
    }

    let selectedTable = null;

    if (orderType === "DINE_IN") {
      selectedTable = availableTables.find(
        (table) => String(table.tableId) === String(tableId)
      );

      if (!tableId || !selectedTable) {
        newErrors.tableId = "Vui lòng chọn một bàn đang trống.";
      }
    }

    if (orderType === "DELIVERY" && !deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Vui lòng nhập địa chỉ giao hàng.";
    }

    if (
      promotionCode &&
      !eligiblePromotions.some(
        (promotion) => promotion.promotionCode === promotionCode
      )
    ) {
      newErrors.promotionCode =
        "Mã khuyến mãi không còn đủ điều kiện áp dụng.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});

    const request = {
      orderType,
      tableId:
        orderType === "DINE_IN"
          ? Number(selectedTable.tableId)
          : null,
      deliveryAddress:
        orderType === "DELIVERY" ? deliveryAddress.trim() : null,
      customerNote: customerNote.trim() || null,
      promotionCode: promotionCode || null,
      items: cart.map((item) => ({
        dishId: Number(item.dishId),
        quantity: Number(item.quantity),
        itemNote: item.itemNote.trim() || null,
      })),
    };

    setSubmitting(true);

    try {
      const orderResponse = await api.post("/orders", request);
      const order = extractOrder(orderResponse.data);

      if (!order.orderId) {
        throw new Error(
          "Backend đã phản hồi nhưng không tìm thấy mã đơn hàng."
        );
      }

      setCreatedOrder(order);
      setCart([]);
      setTableId("");
      setDeliveryAddress("");
      setCustomerNote("");
      setPromotionCode("");
      setFieldErrors({});

      try {
        const payment = await createPayment(
          order.orderId,
          paymentMethod
        );

        if (!payment?.paymentId) {
          throw new Error(
            "Không nhận được thông tin thanh toán từ Backend."
          );
        }

        setPaymentInfo(payment);

        if (paymentMethod === "CASH") {
          setSuccess(
            "Đơn hàng đã được tạo. Vui lòng xác nhận sau khi nhận đủ tiền mặt."
          );
        } else {
          setSuccess(
            "Đơn hàng đã được tạo. Vui lòng hướng dẫn khách quét QR và chờ ADMIN xác nhận."
          );
        }
      } catch (paymentErr) {
        console.error("Tạo payment thất bại:", paymentErr);

        setPaymentError(
          getErrorMessage(
            paymentErr,
            "Đơn hàng đã tạo nhưng không thể khởi tạo thanh toán."
          )
        );

        setSuccess(
          "Đơn hàng đã được tạo, nhưng cần xử lý thanh toán."
        );
      }

      await loadData();
    } catch (err) {
      console.error("[POS] Tạo đơn hàng thất bại:", err);

      setError(
        getErrorMessage(
          err,
          "Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const retryCreatePayment = async () => {
    if (!createdOrder?.orderId || paymentSubmitting) return;

    setPaymentSubmitting(true);
    setPaymentError("");

    try {
      const payment = await createPayment(
        createdOrder.orderId,
        paymentMethod
      );

      if (!payment?.paymentId) {
        throw new Error("Không nhận được thông tin thanh toán.");
      }

      setPaymentInfo(payment);
      setPaymentError("");
      setSuccess("Đã khởi tạo thanh toán cho đơn hàng.");
    } catch (err) {
      setPaymentError(
        getErrorMessage(err, "Không thể khởi tạo thanh toán.")
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Đưa POS về trạng thái tạo đơn mới sau khi thanh toán thành công.
  const resetForNewOrder = () => {
    setCreatedOrder(null);
    setPaymentInfo(null);
    setPaymentError("");
    setPaymentSubmitting(false);

    setError("");
    setSuccess("");
    setFieldErrors({});

    setCart([]);
    setTableId("");
    setDeliveryAddress("");
    setCustomerNote("");
    setPromotionCode("");
    setPromotionDropdownOpen(false);
    setPromotionError("");
  };

  const clearCart = () => {
    if (submitting || createdOrder) return;

    setCart([]);
    setPromotionCode("");

    setFieldErrors((prev) => ({
      ...prev,
      cart: "",
      promotionCode: "",
    }));

    setError("");
    setSuccess("");
  };

  const copyText = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Đã sao chép nội dung chuyển khoản.");
    } catch {
      setPaymentError(
        "Không thể sao chép. Vui lòng sao chép thủ công."
      );
    }
  };

  const paymentSucceeded =
    paymentInfo?.paymentStatus === "SUCCESS";

  return (
    <div className="pos-page" style={styles.page}>
      <style>{`
        .pos-page, .pos-page * {
          box-sizing: border-box;
        }

        .pos-page button {
          touch-action: manipulation;
        }

        .pos-layout {
          grid-template-columns: minmax(0, 1fr) minmax(300px, 350px);
        }

        .pos-product-grid {
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
        }

        .pos-cart-panel {
          position: sticky;
          top: 12px;
          max-height: calc(100vh - 24px);
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .pos-product-card {
          transition: box-shadow .15s ease, transform .15s ease;
        }

        .pos-product-card:hover {
          box-shadow: 0 5px 16px rgba(15, 23, 42, .08);
          transform: translateY(-1px);
        }

        .pos-page input:focus,
        .pos-page textarea:focus,
        .pos-page select:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, .10);
        }

        .pos-page button:focus-visible {
          outline: 3px solid rgba(37, 99, 235, .25);
          outline-offset: 2px;
        }

        @media (max-width: 1200px) {
          .pos-page {
            padding: 14px !important;
          }

          .pos-layout {
            grid-template-columns: minmax(0, 1fr) minmax(285px, 315px) !important;
            gap: 12px !important;
          }

          .pos-panel {
            padding: 13px !important;
          }

          .pos-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)) !important;
            gap: 9px !important;
          }

          .pos-product-image,
          .pos-product-image-fallback {
            height: 96px !important;
          }
        }

        @media (max-width: 850px) {
          .pos-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .pos-cart-panel {
            position: static !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .pos-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)) !important;
          }

          .pos-product-image,
          .pos-product-image-fallback {
            height: 115px !important;
          }
        }

        @media (max-width: 520px) {
          .pos-page {
            padding: 10px !important;
          }

          .pos-page .pos-title {
            font-size: 21px !important;
          }

          .pos-page .pos-panel {
            padding: 11px !important;
            border-radius: 10px !important;
          }

          .pos-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .pos-product-image,
          .pos-product-image-fallback {
            height: 100px !important;
          }

          .pos-page .pos-product-body {
            padding: 8px !important;
          }

          .pos-page .pos-product-name {
            font-size: 12px !important;
            min-height: 36px !important;
          }

          .pos-page .pos-header-button {
            width: 100%;
          }

          .pos-page .pos-modal {
            padding: 14px !important;
            border-radius: 12px !important;
          }
        }

        @media (max-height: 700px) and (min-width: 851px) {
          .pos-cart-panel {
            max-height: calc(100vh - 16px);
            top: 8px;
          }
        }
      `}</style>

      {/* TIÊU ĐỀ */}
      <div style={styles.header}>
        <div>
          <h1 className="pos-title" style={styles.title}>
            Bán hàng tại quầy
          </h1>

          <div style={styles.subtitle}>
            Chọn món ăn, áp dụng khuyến mãi và thanh toán cho khách.
          </div>
        </div>

        <button
          type="button"
          className="pos-header-button"
          style={{
            ...styles.button,
            ...styles.secondary,
            opacity: loading ? 0.6 : 1,
          }}
          onClick={() => {
            loadData();
            loadPromotions();
          }}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Làm mới dữ liệu
        </button>
      </div>

      {error && (
        <div role="alert" style={styles.errorAlert}>
          {error}
        </div>
      )}

      {success && (
        <div role="status" style={styles.successAlert}>
          <strong>{success}</strong>

          {createdOrder?.orderCode && (
            <div>Mã đơn hàng: {createdOrder.orderCode}</div>
          )}

          {createdOrder?.orderId && (
            <div>Mã đơn: #{createdOrder.orderId}</div>
          )}

          {createdOrder && paymentInfo && (
            <div style={{ marginTop: "7px" }}>
              Trạng thái thanh toán:{" "}
              <strong>
                {paymentSucceeded
                  ? "Đã thanh toán"
                  : paymentInfo.paymentStatus === "FAILED"
                  ? "Thất bại"
                  : "Đang chờ xác nhận"}
              </strong>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={styles.panel}>Đang tải dữ liệu...</div>
      ) : (
        <div className="pos-layout" style={styles.layout}>
          {/* THỰC ĐƠN */}
          <section className="pos-panel" style={styles.panel}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <Utensils size={20} />
              <h2 style={{ fontSize: "17px", margin: 0 }}>Thực đơn</h2>

              <span style={{ ...styles.muted, marginLeft: "auto" }}>
                {availableDishes.length} món
              </span>
            </div>

            <div style={{ position: "relative", marginBottom: "13px" }}>
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "11px",
                  color: "#94a3b8",
                }}
              />

              <input
                style={{ ...styles.input, paddingLeft: "38px" }}
                placeholder="Tìm tên món ăn..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>

            {/* DANH MỤC */}
            <div
              style={{
                display: "flex",
                gap: "7px",
                overflowX: "auto",
                paddingBottom: "5px",
                scrollbarWidth: "thin",
              }}
            >
              <button
                type="button"
                style={{
                  ...styles.categoryButton,
                  background:
                    selectedCategory === "ALL" ? "#2563eb" : "#fff",
                  color:
                    selectedCategory === "ALL" ? "#fff" : "#334155",
                }}
                onClick={() => setSelectedCategory("ALL")}
              >
                Tất cả
              </button>

              {categories
                .filter(
                  (category) =>
                    category.isActive === true ||
                    category.isActive === 1
                )
                .map((category) => (
                  <button
                    type="button"
                    key={category.categoryId}
                    style={{
                      ...styles.categoryButton,
                      background:
                        String(selectedCategory) ===
                        String(category.categoryId)
                          ? "#2563eb"
                          : "#fff",
                      color:
                        String(selectedCategory) ===
                        String(category.categoryId)
                          ? "#fff"
                          : "#334155",
                    }}
                    onClick={() =>
                      setSelectedCategory(String(category.categoryId))
                    }
                  >
                    {category.categoryName}
                  </button>
                ))}
            </div>

            {/* DANH SÁCH MÓN */}
            {availableDishes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 10px",
                  color: "#64748b",
                }}
              >
                Không tìm thấy món ăn phù hợp.
              </div>
            ) : (
              <div className="pos-product-grid" style={styles.productGrid}>
                {availableDishes.map((dish) => {
                  const imageUrl = getImageUrl(dish.imageUrl);
                  const imageBroken = brokenImages.includes(dish.dishId);

                  return (
                    <div
                      key={dish.dishId}
                      className="pos-product-card"
                      style={styles.product}
                    >
                      {imageUrl && !imageBroken ? (
                        <img
                          className="pos-product-image"
                          src={imageUrl}
                          alt={dish.dishName}
                          style={styles.productImage}
                          onError={() => {
                            setBrokenImages((current) =>
                              current.includes(dish.dishId)
                                ? current
                                : [...current, dish.dishId]
                            );
                          }}
                        />
                      ) : (
                        <div
                          className="pos-product-image-fallback"
                          style={styles.productImageFallback}
                        >
                          <Utensils size={28} />
                        </div>
                      )}

                      <div
                        className="pos-product-body"
                        style={styles.productBody}
                      >
                        <div
                          className="pos-product-name"
                          style={{
                            fontWeight: 700,
                            minHeight: "38px",
                            marginBottom: "4px",
                            fontSize: "13px",
                            lineHeight: 1.4,
                          }}
                        >
                          {dish.dishName}
                        </div>

                        <div style={styles.muted}>
                          {dish.categoryName || "Chưa phân loại"}
                        </div>

                        <div
                          style={{
                            color: "#dc2626",
                            fontWeight: 750,
                            margin: "8px 0",
                            fontSize: "14px",
                          }}
                        >
                          {formatCurrency(dish.currentPrice)}
                        </div>

                        <button
                          type="button"
                          disabled={Boolean(createdOrder)}
                          style={{
                            ...styles.button,
                            ...styles.primary,
                            width: "100%",
                            minHeight: "37px",
                            padding: "8px 5px",
                            opacity: createdOrder ? 0.5 : 1,
                          }}
                          onClick={() => addToCart(dish)}
                        >
                          <Plus size={15} />
                          Thêm món
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* GIỎ HÀNG VÀ THANH TOÁN */}
          <aside
            className="pos-panel pos-cart-panel"
            style={{
              ...styles.panel,
              position: "relative",
              zIndex: 2,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <ShoppingCart size={20} />
              <h2 style={{ fontSize: "17px", margin: 0 }}>
                Đơn hàng ({cart.length})
              </h2>
            </div>

            {/* LOẠI ĐƠN */}
            <div style={{ marginBottom: "15px" }}>
              <label style={styles.label}>Loại đơn hàng</label>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  disabled={Boolean(createdOrder)}
                  style={{
                    ...styles.button,
                    flex: 1,
                    background:
                      orderType === "DINE_IN" ? "#2563eb" : "#f1f5f9",
                    color: orderType === "DINE_IN" ? "#fff" : "#334155",
                    opacity: createdOrder ? 0.6 : 1,
                  }}
                  onClick={() => handleOrderTypeChange("DINE_IN")}
                >
                  <Utensils size={16} />
                  Tại bàn
                </button>

                <button
                  type="button"
                  disabled={Boolean(createdOrder)}
                  style={{
                    ...styles.button,
                    flex: 1,
                    background:
                      orderType === "DELIVERY" ? "#2563eb" : "#f1f5f9",
                    color:
                      orderType === "DELIVERY" ? "#fff" : "#334155",
                    opacity: createdOrder ? 0.6 : 1,
                  }}
                  onClick={() => handleOrderTypeChange("DELIVERY")}
                >
                  <Truck size={16} />
                  Giao hàng
                </button>
              </div>
            </div>

            {/* BÀN ĂN / ĐỊA CHỈ */}
            {orderType === "DINE_IN" ? (
              <div style={{ marginBottom: "15px" }}>
                <label style={styles.label}>Chọn bàn ăn *</label>

                <select
                  disabled={Boolean(createdOrder)}
                  style={{
                    ...styles.input,
                    borderColor: fieldErrors.tableId
                      ? "#dc2626"
                      : "#cbd5e1",
                  }}
                  value={tableId}
                  aria-invalid={Boolean(fieldErrors.tableId)}
                  onChange={(event) => {
                    setTableId(event.target.value);
                    clearFieldError("tableId");
                  }}
                >
                  <option value="">-- Chọn bàn còn trống --</option>

                  {availableTables.map((table) => (
                    <option key={table.tableId} value={table.tableId}>
                      {table.tableCode} - {table.capacity} chỗ
                    </option>
                  ))}
                </select>

                <FieldError>{fieldErrors.tableId}</FieldError>

                <div style={{ ...styles.muted, marginTop: "5px" }}>
                  Chỉ hiển thị bàn đang ở trạng thái AVAILABLE.
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "15px" }}>
                <label style={styles.label}>Địa chỉ giao hàng *</label>

                <textarea
                  disabled={Boolean(createdOrder)}
                  style={{
                    ...styles.input,
                    minHeight: "70px",
                    resize: "vertical",
                    borderColor: fieldErrors.deliveryAddress
                      ? "#dc2626"
                      : "#cbd5e1",
                  }}
                  maxLength={500}
                  placeholder="Nhập địa chỉ giao hàng..."
                  value={deliveryAddress}
                  aria-invalid={Boolean(fieldErrors.deliveryAddress)}
                  onChange={(event) => {
                    setDeliveryAddress(event.target.value);
                    clearFieldError("deliveryAddress");
                  }}
                />

                <FieldError>{fieldErrors.deliveryAddress}</FieldError>
              </div>
            )}

            {/* GHI CHÚ ĐƠN */}
            <div style={{ marginBottom: "15px" }}>
              <label style={styles.label}>Ghi chú đơn hàng</label>

              <textarea
                disabled={Boolean(createdOrder)}
                style={{
                  ...styles.input,
                  minHeight: "58px",
                  resize: "vertical",
                }}
                maxLength={500}
                placeholder="Ghi chú cho đơn hàng..."
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
              />
            </div>

            {/* CHI TIẾT GIỎ HÀNG */}
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                borderBottom: "1px solid #e2e8f0",
                marginBottom: "13px",
              }}
            >
              {cart.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "25px 10px",
                    color: "#94a3b8",
                  }}
                >
                  <ShoppingCart
                    size={28}
                    style={{ marginBottom: "7px" }}
                  />

                  <div style={{ fontSize: "13px" }}>
                    Chưa có món ăn trong giỏ hàng.
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.dishId} style={styles.cartItem}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <strong style={{ fontSize: "13px" }}>
                        {item.dishName}
                      </strong>

                      <button
                        type="button"
                        disabled={Boolean(createdOrder)}
                        onClick={() => removeItem(item.dishId)}
                        title="Xóa món"
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "#dc2626",
                          cursor: "pointer",
                          padding: "3px",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        margin: "8px 0",
                      }}
                    >
                      <span style={styles.muted}>
                        {formatCurrency(item.currentPrice)}
                      </span>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <button
                          type="button"
                          disabled={Boolean(createdOrder)}
                          onClick={() => changeQuantity(item.dishId, -1)}
                          style={{
                            border: "1px solid #cbd5e1",
                            background: "#fff",
                            borderRadius: "6px",
                            padding: "5px",
                            cursor: "pointer",
                            minWidth: "30px",
                            minHeight: "30px",
                          }}
                        >
                          <Minus size={14} />
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
                          disabled={Boolean(createdOrder)}
                          onClick={() => changeQuantity(item.dishId, 1)}
                          style={{
                            border: "1px solid #cbd5e1",
                            background: "#fff",
                            borderRadius: "6px",
                            padding: "5px",
                            cursor: "pointer",
                            minWidth: "30px",
                            minHeight: "30px",
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <input
                      disabled={Boolean(createdOrder)}
                      style={styles.input}
                      maxLength={500}
                      placeholder="Ghi chú món (ít cay, không hành...)"
                      value={item.itemNote}
                      onChange={(event) =>
                        updateItemNote(item.dishId, event.target.value)
                      }
                    />

                    <div
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        marginTop: "7px",
                        fontSize: "13px",
                      }}
                    >
                      {formatCurrency(item.currentPrice * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <FieldError>{fieldErrors.cart}</FieldError>

            {/* KHUYẾN MÃI */}
            <div style={styles.promotionWrapper}>
              <label style={styles.label}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <TicketPercent size={16} />
                  Mã khuyến mãi
                </span>
              </label>

              <button
                type="button"
                disabled={Boolean(createdOrder)}
                style={{
                  ...styles.promotionTrigger,
                  borderColor: fieldErrors.promotionCode
                    ? "#dc2626"
                    : "#cbd5e1",
                  opacity: createdOrder ? 0.6 : 1,
                }}
                onClick={() =>
                  setPromotionDropdownOpen((open) => !open)
                }
                aria-expanded={promotionDropdownOpen}
                aria-haspopup="listbox"
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getPromotionLabel(selectedPromotion)}
                </span>

                <ChevronDown
                  size={17}
                  style={{
                    flexShrink: 0,
                    transform: promotionDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0)",
                  }}
                />
              </button>

              {promotionDropdownOpen && (
                <div
                  style={styles.promotionPopup}
                  role="listbox"
                  aria-label="Danh sách mã khuyến mãi"
                >
                  <button
                    type="button"
                    style={{
                      ...styles.promotionOption,
                      color: "#64748b",
                    }}
                    onClick={() => handlePromotionChange("")}
                    role="option"
                    aria-selected={!promotionCode}
                  >
                    Không sử dụng mã khuyến mãi
                  </button>

                  {promotionLoading ? (
                    <div
                      style={{
                        padding: "14px",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Đang tải khuyến mãi...
                    </div>
                  ) : eligiblePromotions.length === 0 ? (
                    <div
                      style={{
                        padding: "14px",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      {subtotal <= 0
                        ? "Thêm món vào giỏ để xem khuyến mãi."
                        : "Không có mã khuyến mãi phù hợp với đơn hàng."}
                    </div>
                  ) : (
                    eligiblePromotions.map((promotion) => (
                      <button
                        type="button"
                        key={
                          promotion.promotionId ||
                          promotion.promotionCode
                        }
                        style={{
                          ...styles.promotionOption,
                          background:
                            promotionCode === promotion.promotionCode
                              ? "#eff6ff"
                              : "#fff",
                        }}
                        onClick={() =>
                          handlePromotionChange(
                            promotion.promotionCode
                          )
                        }
                        role="option"
                        aria-selected={
                          promotionCode === promotion.promotionCode
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <strong style={{ color: "#1d4ed8" }}>
                            {promotion.promotionCode}
                          </strong>

                          <span
                            style={{
                              color: "#16a34a",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            {promotion.discountType === "PERCENTAGE"
                              ? `-${promotion.discountValue}%`
                              : `-${formatCurrency(
                                  promotion.discountValue
                                )}`}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#334155",
                            marginTop: "3px",
                          }}
                        >
                          {promotion.promotionName || "Khuyến mãi"}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginTop: "3px",
                          }}
                        >
                          Đơn tối thiểu:{" "}
                          {formatCurrency(promotion.minOrderAmount)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {promotionError && (
                <div
                  style={{
                    ...styles.muted,
                    color: "#dc2626",
                    marginTop: "6px",
                  }}
                >
                  {promotionError}

                  <button
                    type="button"
                    onClick={loadPromotions}
                    style={{
                      border: 0,
                      background: "transparent",
                      color: "#2563eb",
                      cursor: "pointer",
                      marginLeft: "5px",
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              )}

              <FieldError>{fieldErrors.promotionCode}</FieldError>

              {selectedPromotion && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "9px 10px",
                    borderRadius: "7px",
                    background: "#f0fdf4",
                    color: "#166534",
                    fontSize: "12px",
                  }}
                >
                  Đã áp dụng mã{" "}
                  <strong>{selectedPromotion.promotionCode}</strong>.
                  Giảm dự kiến{" "}
                  {formatCurrency(promotionDiscountPreview)}.
                </div>
              )}
            </div>

            {/* TỔNG TIỀN */}
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: "12px",
                marginBottom: "14px",
              }}
            >
              <div style={styles.summaryRow}>
                <span style={{ color: "#64748b" }}>Tạm tính</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div style={styles.summaryRow}>
                <span style={{ color: "#64748b" }}>Giảm giá</span>
                <strong style={{ color: "#16a34a" }}>
                  -{formatCurrency(promotionDiscountPreview)}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  fontSize: "15px",
                  fontWeight: 750,
                  marginTop: "11px",
                }}
              >
                <span>Tổng dự kiến</span>

                <span style={{ color: "#dc2626", textAlign: "right" }}>
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div style={{ marginBottom: "14px" }}>
              <label style={styles.label}>Phương thức thanh toán</label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  disabled={submitting || Boolean(createdOrder)}
                  onClick={() => setPaymentMethod("CASH")}
                  style={{
                    ...styles.button,
                    flexDirection: "column",
                    padding: "11px 7px",
                    border:
                      paymentMethod === "CASH"
                        ? "2px solid #2563eb"
                        : "1px solid #cbd5e1",
                    background:
                      paymentMethod === "CASH" ? "#eff6ff" : "#fff",
                    color:
                      paymentMethod === "CASH" ? "#1d4ed8" : "#334155",
                    opacity: createdOrder ? 0.6 : 1,
                  }}
                >
                  <Banknote size={21} />
                  Tiền mặt
                </button>

                <button
                  type="button"
                  disabled={submitting || Boolean(createdOrder)}
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  style={{
                    ...styles.button,
                    flexDirection: "column",
                    padding: "11px 7px",
                    border:
                      paymentMethod === "BANK_TRANSFER"
                        ? "2px solid #2563eb"
                        : "1px solid #cbd5e1",
                    background:
                      paymentMethod === "BANK_TRANSFER"
                        ? "#eff6ff"
                        : "#fff",
                    color:
                      paymentMethod === "BANK_TRANSFER"
                        ? "#1d4ed8"
                        : "#334155",
                    opacity: createdOrder ? 0.6 : 1,
                  }}
                >
                  <QrCode size={21} />
                  Chuyển khoản QR
                </button>
              </div>
            </div>

            {/* TẠO ĐƠN */}
            {!createdOrder ? (
              <button
                type="button"
                disabled={submitting || cart.length === 0}
                onClick={handleCreateOrder}
                style={{
                  ...styles.button,
                  ...styles.primary,
                  width: "100%",
                  padding: "12px",
                  opacity: submitting || cart.length === 0 ? 0.65 : 1,
                  cursor:
                    submitting || cart.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={17} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <ClipboardList size={17} />
                    Tạo đơn và thanh toán
                  </>
                )}
              </button>
            ) : (
              <div
                style={{
                  padding: "11px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "7px" }}>
                  Đơn hàng #{createdOrder.orderId}
                </div>

                <div style={styles.summaryRow}>
                  <span style={styles.muted}>Tổng tiền từ Backend</span>
                  <strong>
                    {formatCurrency(createdOrder.totalAmount)}
                  </strong>
                </div>

                {paymentInfo ? (
                  <>
                    <div
                      style={{ ...styles.summaryRow, marginBottom: 0 }}
                    >
                      <span style={styles.muted}>Thanh toán</span>

                      <strong
                        style={{
                          color: paymentSucceeded
                            ? "#16a34a"
                            : "#d97706",
                        }}
                      >
                        {paymentSucceeded ? "Đã thanh toán" : "Đang chờ"}
                      </strong>
                    </div>

                    {!paymentSucceeded && (
                      <button
                        type="button"
                        disabled={paymentSubmitting}
                        style={{
                          ...styles.button,
                          ...styles.secondary,
                          width: "100%",
                          marginTop: "11px",
                        }}
                        onClick={refreshPaymentStatus}
                      >
                        <RefreshCw size={16} />
                        Kiểm tra trạng thái thanh toán
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={paymentSubmitting}
                    onClick={retryCreatePayment}
                    style={{
                      ...styles.button,
                      ...styles.primary,
                      width: "100%",
                      marginTop: "10px",
                    }}
                  >
                    {paymentSubmitting
                      ? "Đang thử lại..."
                      : "Thử tạo thanh toán"}
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              style={{
                ...styles.button,
                ...styles.secondary,
                width: "100%",
                marginTop: "9px",
                opacity: submitting || createdOrder ? 0.6 : 1,
              }}
              disabled={
                cart.length === 0 || submitting || Boolean(createdOrder)
              }
              onClick={clearCart}
            >
              Xóa toàn bộ giỏ hàng
            </button>

            <div
              style={{
                ...styles.muted,
                marginTop: "11px",
                lineHeight: 1.5,
              }}
            >
              Giá món, khuyến mãi và tổng tiền chính thức được Backend
              kiểm tra khi tạo đơn. Tổng tiền tại POS chỉ là số tiền dự kiến.
            </div>
          </aside>
        </div>
      )}

      {/* MODAL THANH TOÁN */}
      {createdOrder && paymentInfo && (
        <div
          style={styles.modalOverlay}
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              paymentSucceeded
            ) {
              resetForNewOrder();
            }
          }}
        >
          <div
            className="pos-modal"
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pos-payment-title"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <div>
                <h2
                  id="pos-payment-title"
                  style={{ margin: 0, fontSize: "19px" }}
                >
                  Thanh toán đơn hàng
                </h2>

                <div style={{ ...styles.muted, marginTop: "5px" }}>
                  {createdOrder.orderCode ||
                    `Đơn #${createdOrder.orderId}`}
                </div>
              </div>

              {paymentSucceeded && (
                <button
                  type="button"
                  onClick={resetForNewOrder}
                  style={{
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                  aria-label="Đóng"
                >
                  <X size={21} />
                </button>
              )}
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: "9px",
                background: "#f8fafc",
                marginBottom: "15px",
              }}
            >
              <div style={styles.summaryRow}>
                <span style={styles.muted}>Phương thức</span>

                <strong>
                  {paymentInfo.paymentMethod === "CASH"
                    ? "Tiền mặt"
                    : "Chuyển khoản QR"}
                </strong>
              </div>

              <div style={{ ...styles.summaryRow, marginBottom: 0 }}>
                <span style={styles.muted}>Số tiền</span>

                <strong style={{ color: "#dc2626", fontSize: "17px" }}>
                  {formatCurrency(paymentInfo.amount)}
                </strong>
              </div>
            </div>

            {/* THÔNG TIN VIETQR */}
            {paymentInfo.paymentMethod === "BANK_TRANSFER" && (
              <div style={{ textAlign: "center" }}>
                {paymentInfo.qrCodeUrl ? (
                  <img
                    src={paymentInfo.qrCodeUrl}
                    alt="Mã VietQR thanh toán"
                    style={{
                      width: "220px",
                      height: "220px",
                      objectFit: "contain",
                      maxWidth: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "25px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      color: "#64748b",
                    }}
                  >
                    Backend chưa trả về đường dẫn mã QR.
                  </div>
                )}

                <div
                  style={{
                    textAlign: "left",
                    marginTop: "14px",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "9px",
                  }}
                >
                  <div style={styles.summaryRow}>
                    <span style={styles.muted}>Ngân hàng</span>
                    <strong>{paymentInfo.bankName || "—"}</strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.muted}>Số tài khoản</span>
                    <strong>{paymentInfo.accountNumber || "—"}</strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.muted}>Chủ tài khoản</span>
                    <strong>{paymentInfo.accountName || "—"}</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.muted}>
                        Nội dung chuyển khoản
                      </div>

                      <strong style={{ wordBreak: "break-word" }}>
                        {paymentInfo.transferContent || "—"}
                      </strong>
                    </div>

                    {paymentInfo.transferContent && (
                      <button
                        type="button"
                        onClick={() =>
                          copyText(paymentInfo.transferContent)
                        }
                        style={{
                          ...styles.button,
                          ...styles.secondary,
                          padding: "7px",
                          flexShrink: 0,
                        }}
                        title="Sao chép nội dung"
                      >
                        <Copy size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {!paymentSucceeded && (
                  <div
                    style={{
                      marginTop: "13px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#fffbeb",
                      color: "#92400e",
                      fontSize: "12px",
                      textAlign: "left",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Đang chờ xác nhận chuyển khoản.</strong>
                    <div>
                      Vui lòng hướng dẫn khách quét mã QR và chuyển đúng số
                      tiền. ADMIN sẽ kiểm tra tài khoản ngân hàng và xác nhận
                      thanh toán trên hệ thống.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* THÔNG TIN TIỀN MẶT */}
            {paymentInfo.paymentMethod === "CASH" &&
              !paymentSucceeded && (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "9px",
                    background: "#eff6ff",
                    color: "#1e40af",
                    textAlign: "center",
                  }}
                >
                  <Banknote size={34} />

                  <div style={{ fontWeight: 700, marginTop: "8px" }}>
                    Thu tiền mặt từ khách
                  </div>

                  <div style={{ fontSize: "12px", marginTop: "5px" }}>
                    Nhấn xác nhận sau khi nhân viên đã nhận đủ tiền.
                  </div>
                </div>
              )}

            {/* TRẠNG THÁI THANH TOÁN */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "15px",
                padding: "10px",
                borderRadius: "8px",
                background: paymentSucceeded ? "#f0fdf4" : "#fffbeb",
                color: paymentSucceeded ? "#166534" : "#92400e",
                fontSize: "12px",
              }}
            >
              {paymentSucceeded ? (
                <CheckCircle2 size={18} />
              ) : (
                <Clock3 size={18} />
              )}

              <strong>
                {paymentSucceeded
                  ? "Thanh toán đã được xác nhận thành công."
                  : paymentInfo.paymentStatus === "FAILED"
                  ? "Thanh toán thất bại."
                  : paymentInfo.paymentMethod === "BANK_TRANSFER"
                  ? "Đang chờ ADMIN xác nhận chuyển khoản."
                  : "Đang chờ nhân viên xác nhận tiền mặt."}
              </strong>
            </div>

            {paymentError && (
              <div
                style={{
                  ...styles.errorAlert,
                  marginTop: "11px",
                  marginBottom: 0,
                }}
              >
                {paymentError}
              </div>
            )}

            {/* NÚT THAO TÁC */}
            {paymentSucceeded ? (
              <button
                type="button"
                onClick={resetForNewOrder}
                style={{
                  ...styles.button,
                  ...styles.primary,
                  width: "100%",
                  marginTop: "15px",
                }}
              >
                <CheckCircle2 size={17} />
                Hoàn tất
              </button>
            ) : paymentInfo.paymentMethod === "CASH" ? (
              <button
                type="button"
                disabled={paymentSubmitting}
                onClick={confirmCashPayment}
                style={{
                  ...styles.button,
                  ...styles.primary,
                  width: "100%",
                  marginTop: "15px",
                  opacity: paymentSubmitting ? 0.6 : 1,
                }}
              >
                {paymentSubmitting ? (
                  <>
                    <RefreshCw size={16} />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Xác nhận đã nhận tiền
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled={paymentSubmitting}
                onClick={refreshPaymentStatus}
                style={{
                  ...styles.button,
                  ...styles.primary,
                  width: "100%",
                  marginTop: "15px",
                  opacity: paymentSubmitting ? 0.6 : 1,
                }}
              >
                <RefreshCw size={16} />
                {paymentSubmitting
                  ? "Đang kiểm tra..."
                  : "Kiểm tra trạng thái thanh toán"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
