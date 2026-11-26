import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  X,
  Trash2,
  Utensils,
  Bike,
  MapPin,
  Clock3,
  Sparkles,
  Menu,
  Check,
  Banknote,
  QrCode,
  RefreshCw,
  Copy,
  TicketPercent,
  ChevronDown,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";
import "./CustomerPage.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=85";

const API_BASE_URL = "http://localhost:8080";

function getArray(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.data?.items)) return data.data.items;

  return [];
}

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? {};
}

function formatPrice(value) {
  const price = Number(value ?? 0);

  if (!Number.isFinite(price)) return "0đ";

  return price.toLocaleString("vi-VN") + "đ";
}

function getDishImage(dish) {
  const image =
    dish.imageUrl ||
    dish.imageURL ||
    dish.image ||
    "";

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  const imagePath = image.trim();

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  return `${API_BASE_URL}/uploads/dishes/${imagePath}`;
}

function getDishPrice(dish) {
  return Number(
    dish.currentPrice ??
    dish.price ??
    dish.dishPrice ??
    0
  );
}

function getPromotionDescription(promotion) {
  if (!promotion) return "";

  const value = Number(promotion.discountValue ?? 0);

  if (promotion.discountType === "PERCENTAGE") {
    return `Giảm ${value}%`;
  }

  if (promotion.discountType === "FIXED_AMOUNT") {
    return `Giảm ${formatPrice(value)}`;
  }

  return "Ưu đãi đặc biệt";
}

export default function CustomerPage() {
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("DINE_IN");

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // KHUYẾN MÃI
  const [promotions, setPromotions] = useState([]);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionError, setPromotionError] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionDropdownOpen, setPromotionDropdownOpen] =
    useState(false);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // THÔNG BÁO TỰ ĐỘNG BIẾN MẤT
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // 1. TẢI DANH MỤC VÀ THỰC ĐƠN
  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      try {
        setLoading(true);
        setLoadError("");

        const [categoryResponse, dishResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/dishes"),
        ]);

        if (!mounted) return;

        setCategories(
          getArray(categoryResponse).filter(
            (item) => item.isActive !== false
          )
        );

        setDishes(
          getArray(dishResponse).filter(
            (item) =>
              item.isActive !== false &&
              item.isAvailable !== false
          )
        );
      } catch (error) {
        if (!mounted) return;

        console.error("Không thể tải thực đơn:", error);

        setLoadError(
          error.response?.data?.message ||
            "Không thể tải thực đơn. Vui lòng thử lại."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMenu();

    return () => {
      mounted = false;
    };
  }, []);

  // 2. TẢI KHUYẾN MÃI
  useEffect(() => {
    let mounted = true;

    async function loadPromotions() {
      try {
        setPromotionLoading(true);
        setPromotionError("");

        const response = await api.get("/promotions/available");

        if (!mounted) return;

        setPromotions(getArray(response));
      } catch (error) {
        if (!mounted) return;

        console.error("Không thể tải khuyến mãi:", error);

        setPromotions([]);
        setPromotionError(
          error.response?.data?.message ||
            "Không thể tải danh sách khuyến mãi."
        );
      } finally {
        if (mounted) setPromotionLoading(false);
      }
    }

    loadPromotions();

    return () => {
      mounted = false;
    };
  }, []);

  // 3. HEADER KHI CUỘN TRANG
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 4. CHUẨN HÓA DỮ LIỆU
  const normalizedCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        id: category.categoryId ?? category.id,
        name: category.categoryName ?? category.name,
      })),
    [categories]
  );

  const normalizedDishes = useMemo(
    () =>
      dishes.map((dish) => ({
        ...dish,
        id: dish.dishId ?? dish.id,
        name: dish.dishName ?? dish.name,
        price: getDishPrice(dish),
        category:
          dish.categoryId ??
          dish.category?.categoryId ??
          dish.category?.id,
        description:
          dish.description ||
          "Được chuẩn bị tươi ngon mỗi ngày.",
        image: getDishImage(dish),
      })),
    [dishes]
  );

  // 5. TÌM KIẾM VÀ LỌC MÓN
  const filteredDishes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return normalizedDishes.filter((dish) => {
      const matchesCategory =
        activeCategory === "all" ||
        String(dish.category) === String(activeCategory);

      const matchesSearch =
        !keyword ||
        dish.name?.toLowerCase().includes(keyword) ||
        dish.description?.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [normalizedDishes, activeCategory, search]);

  // 6. GIỎ HÀNG VÀ TÍNH TIỀN
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // CHỈ GIỮ CÁC MÃ CÓ GIÁ TRỊ ĐƠN HÀNG ĐẠT MỨC TỐI THIỂU
  const eligiblePromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const minimumAmount = Number(
        promotion.minOrderAmount ?? 0
      );

      return (
        Number.isFinite(minimumAmount) &&
        cartTotal >= minimumAmount
      );
    });
  }, [promotions, cartTotal]);

  const selectedPromotion = useMemo(
    () =>
      eligiblePromotions.find(
        (promotion) =>
          promotion.promotionCode === promotionCode
      ) || null,
    [eligiblePromotions, promotionCode]
  );

  // TỰ ĐỘNG BỎ MÃ KHI GIỎ HÀNG KHÔNG CÒN ĐỦ ĐIỀU KIỆN
  useEffect(() => {
    if (!promotionCode || promotionLoading) return;

    const stillEligible = eligiblePromotions.some(
      (promotion) =>
        promotion.promotionCode === promotionCode
    );

    if (!stillEligible) {
      setPromotionCode("");
      setPromotionDropdownOpen(false);
    }
  }, [eligiblePromotions, promotionCode, promotionLoading]);

  // TÍNH GIẢM GIÁ ƯỚC TÍNH. BACKEND VẪN LÀ NƠI XÁC NHẬN CUỐI CÙNG.
  const promotionPreview = useMemo(() => {
    if (!selectedPromotion) {
      return {
        discount: 0,
        eligible: false,
        reason: "",
      };
    }

    const minimumAmount = Number(
      selectedPromotion.minOrderAmount ?? 0
    );

    if (cartTotal < minimumAmount) {
      return {
        discount: 0,
        eligible: false,
        reason: `Đơn hàng cần tối thiểu ${formatPrice(
          minimumAmount
        )} để sử dụng mã này.`,
      };
    }

    let discount = 0;
    const discountValue = Number(
      selectedPromotion.discountValue ?? 0
    );

    if (selectedPromotion.discountType === "PERCENTAGE") {
      discount = (cartTotal * discountValue) / 100;
    } else if (
      selectedPromotion.discountType === "FIXED_AMOUNT"
    ) {
      discount = discountValue;
    }

    if (selectedPromotion.maxDiscountAmount != null) {
      discount = Math.min(
        discount,
        Number(selectedPromotion.maxDiscountAmount)
      );
    }

    discount = Math.min(discount, cartTotal);
    discount = Math.max(0, discount);

    return {
      discount,
      eligible: true,
      reason: "",
    };
  }, [selectedPromotion, cartTotal]);

  const estimatedTotal =
    cartTotal - promotionPreview.discount;

  function addToCart(dish) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === dish.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity: 1,
          itemNote: "",
        },
      ];
    });

    setToast({
      type: "success",
      text: `Đã thêm "${dish.name}" vào giỏ hàng!`,
    });
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function updateItemNote(id, value) {
    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, itemNote: value } : item
      )
    );
  }

  // 7. CHỌN HÌNH THỨC ĐẶT MÓN
  function handleOrderTypeChange(type) {
    if (type === orderType) return;

    setOrderType(type);
    setMessage(null);
  }

  // 8. CHỌN MÃ KHUYẾN MÃI
  function handlePromotionChange(code) {
    setPromotionCode(code);
    setPromotionDropdownOpen(false);
    setMessage(null);
  }

  // 9. TẠO YÊU CẦU THANH TOÁN
  async function createPayment(orderId, method) {
    const response = await api.post("/payments", {
      orderId,
      paymentMethod: method,
      transactionCode: null,
    });

    return unwrapResponse(response);
  }

  function showPaymentResult(payment, order) {
    setPaymentInfo({
      ...payment,
      orderId: payment.orderId ?? order.orderId,
      orderCode: payment.orderCode ?? order.orderCode,
    });

    setPendingPaymentOrder(null);
    setCartOpen(false);
    setMessage(null);
  }

  // 10. TẠO LẠI THANH TOÁN CHO ĐƠN ĐÃ TẠO
  async function retryCreatePayment() {
    if (!pendingPaymentOrder || submitting) return;

    try {
      setSubmitting(true);
      setMessage(null);

      let payment = null;

      try {
        const existingResponse = await api.get(
          `/payments/order/${pendingPaymentOrder.orderId}`
        );

        const existingPayments = getArray(existingResponse);

        payment = existingPayments.find(
          (item) =>
            item.paymentStatus === "PENDING" &&
            item.paymentMethod === pendingPaymentOrder.paymentMethod
        );
      } catch (checkError) {
        console.warn(
          "Không thể kiểm tra thanh toán hiện có:",
          checkError
        );
      }

      if (!payment) {
        payment = await createPayment(
          pendingPaymentOrder.orderId,
          pendingPaymentOrder.paymentMethod
        );
      }

      showPaymentResult(payment, pendingPaymentOrder);
    } catch (error) {
      console.error("Không thể tạo yêu cầu thanh toán:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // 11. GỬI ĐƠN HÀNG VÀ TẠO THANH TOÁN
  async function submitOrder() {
    if (submitting) return;

    if (cart.length === 0) {
      setMessage({
        type: "error",
        text: "Giỏ hàng đang trống.",
      });
      return;
    }

    if (
      orderType === "DELIVERY" &&
      !deliveryAddress.trim()
    ) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập địa chỉ giao hàng.",
      });
      return;
    }

    if (
      selectedPromotion &&
      !promotionPreview.eligible
    ) {
      setMessage({
        type: "error",
        text: promotionPreview.reason,
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const payload = {
        orderType,
        tableId: null,
        deliveryAddress:
          orderType === "DELIVERY"
            ? deliveryAddress.trim()
            : null,
        customerNote: customerNote.trim(),
        promotionCode: promotionCode.trim() || null,
        items: cart.map((item) => ({
          dishId: item.id,
          quantity: item.quantity,
          itemNote: item.itemNote.trim(),
        })),
      };

      // BƯỚC 1: TẠO ĐƠN HÀNG
      const orderResponse = await api.post("/orders", payload);
      const order = unwrapResponse(orderResponse);

      const orderId = order.orderId ?? order.id;

      const orderCode =
        order.orderCode ??
        order.orderNumber ??
        `#${orderId}`;

      if (!orderId) {
        throw new Error(
          "Không nhận được mã đơn hàng từ máy chủ. Vui lòng kiểm tra lại đơn hàng."
        );
      }

      const orderInfo = {
        orderId,
        orderCode,
        paymentMethod,
      };

      // ĐƠN ĐÃ ĐƯỢC TẠO, XÓA GIỎ HÀNG ĐỂ TRÁNH TẠO TRÙNG.
      setCart([]);
      setDeliveryAddress("");
      setCustomerNote("");
      setPromotionCode("");
      setPromotionDropdownOpen(false);
      setPaymentMethod("CASH");
      setCartOpen(false);

      // BƯỚC 2: TẠO THANH TOÁN
      try {
        const payment = await createPayment(
          orderId,
          paymentMethod
        );

        showPaymentResult(payment, orderInfo);
      } catch (paymentError) {
        console.error(
          "Đơn đã tạo nhưng tạo thanh toán thất bại:",
          paymentError
        );

        setPendingPaymentOrder(orderInfo);

        setMessage({
          type: "error",
          text:
            `Đơn ${orderCode} đã được tạo thành công nhưng chưa tạo được yêu cầu thanh toán. ` +
            (paymentError.response?.data?.message ||
              paymentError.message ||
              "Vui lòng thử tạo thanh toán lại."),
        });
      }
    } catch (error) {
      console.error("Đặt món thất bại:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Đặt món chưa thành công. Vui lòng kiểm tra thông tin và thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // 12. KIỂM TRA TRẠNG THÁI THANH TOÁN
  async function checkPaymentStatus() {
    if (!paymentInfo?.orderId || checkingPayment) return;

    try {
      setCheckingPayment(true);

      const response = await api.get(
        `/payments/order/${paymentInfo.orderId}`
      );

      const payments = getArray(response);

      const currentPayment =
        payments.find(
          (item) =>
            item.paymentId === paymentInfo.paymentId
        ) ||
        payments[0];

      if (!currentPayment) {
        setMessage({
          type: "error",
          text: "Không tìm thấy thông tin thanh toán của đơn hàng.",
        });
        return;
      }

      setPaymentInfo((current) => ({
        ...current,
        ...currentPayment,
      }));

      if (currentPayment.paymentStatus === "SUCCESS") {
        setToast({
          type: "success",
          text: "Thanh toán đã được xác nhận thành công!",
        });
      } else if (currentPayment.paymentStatus === "PENDING") {
        setToast({
          type: "success",
          text: "Thanh toán vẫn đang chờ xác nhận.",
        });
      } else {
        setToast({
          type: "success",
          text: `Trạng thái thanh toán: ${currentPayment.paymentStatus}`,
        });
      }
    } catch (error) {
      console.error("Kiểm tra thanh toán thất bại:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Không thể kiểm tra trạng thái thanh toán.",
      });
    } finally {
      setCheckingPayment(false);
    }
  }

  // 13. ĐIỀU HƯỚNG
  function scrollToMenu() {
    document.getElementById("menu-section")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function scrollToOrder() {
    document.getElementById("order-mode-section")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function openCart() {
    setCartOpen(true);
    setMobileMenuOpen(false);
  }

  async function copyText(value) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));

      setToast({
        type: "success",
        text: "Đã sao chép thông tin!",
      });
    } catch {
      setToast({
        type: "error",
        text: "Không thể sao chép trên trình duyệt này.",
      });
    }
  }

  // 14. GIAO DIỆN
  return (
    <div className="restaurant-page">
      {/* THÔNG BÁO */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "95px",
            right: "24px",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "min(420px, calc(100vw - 32px))",
            padding: "15px 18px",
            borderRadius: "12px",
            background: toast.type === "error" ? "#b91c1c" : "#166534",
            color: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontWeight: 600,
            animation: "customerToastIn 0.25s ease",
          }}
        >
          {toast.type === "error" ? <X size={20} /> : <Check size={20} />}
          <span>{toast.text}</span>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Đóng thông báo"
            style={{
              display: "flex",
              color: "#ffffff",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              marginLeft: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes customerToastIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .payment-method-option {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 14px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #ffffff;
            color: #292524;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
          }

          .payment-method-option.selected {
            border: 2px solid #ea580c;
            background: #fff7ed;
          }

          .payment-method-option:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          .payment-method-option .payment-radio {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            accent-color: #ea580c;
          }

          .payment-method-option .payment-description {
            display: block;
            margin-top: 3px;
            color: #78716c;
            font-size: 12px;
            font-weight: 400;
          }

          .payment-result-overlay {
            position: fixed;
            inset: 0;
            z-index: 11000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: rgba(0,0,0,0.65);
          }

          .payment-result-card {
            width: 100%;
            max-width: 480px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 25px;
            border-radius: 18px;
            background: #ffffff;
            color: #292524;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          }

          .payment-result-card h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
          }

          .payment-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 11px 0;
            border-bottom: 1px solid #e7e5e4;
            font-size: 13px;
          }

          .payment-info-row strong {
            text-align: right;
            overflow-wrap: anywhere;
          }

          .payment-copy-button {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 8px;
            border: 1px solid #e7e5e4;
            border-radius: 7px;
            background: #fafaf9;
            color: #44403c;
            cursor: pointer;
            font-size: 12px;
          }

          .payment-primary-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            margin-top: 14px;
            padding: 13px;
            border: 0;
            border-radius: 10px;
            background: #ea580c;
            color: #ffffff;
            font-weight: 700;
            cursor: pointer;
          }

          .payment-primary-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .payment-secondary-button {
            width: 100%;
            margin-top: 9px;
            padding: 12px;
            border: 1px solid #d6d3d1;
            border-radius: 10px;
            background: #ffffff;
            color: #44403c;
            font-weight: 600;
            cursor: pointer;
          }

          .cart-checkout-message {
            padding: 11px 13px;
            margin-bottom: 12px;
            border-radius: 9px;
            font-size: 13px;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .cart-checkout-message.error {
            background: #fef2f2;
            color: #b91c1c;
          }

          .cart-checkout-message.success {
            background: #f0fdf4;
            color: #166534;
          }

          .promotion-detail {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin-top: 9px;
            padding: 10px 12px;
            border-radius: 8px;
            background: #fff7ed;
            color: #9a3412;
            font-size: 12px;
            line-height: 1.5;
          }

          .promotion-detail.success {
            background: #f0fdf4;
            color: #166534;
          }

          .promotion-clear {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 7px;
            padding: 0;
            border: 0;
            background: transparent;
            color: #78716c;
            font-size: 12px;
            cursor: pointer;
          }

          .cart-total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 13px;
          }

          .cart-total-row.discount {
            color: #15803d;
          }
        `}
      </style>

      {/* HEADER */}
      <header className={`restaurant-header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#top" className="restaurant-logo">
          <span className="logo-symbol">M.</span>
          <span className="logo-name">
            Bếp Mận & Lửa
            <small>RESTAURANT MANAGEMENT</small>
          </span>
        </a>

        <nav className={`restaurant-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <a href="#top" onClick={() => setMobileMenuOpen(false)}>
            TRANG CHỦ
          </a>

          <a href="#menu-section" onClick={() => setMobileMenuOpen(false)}>
            THỰC ĐƠN
          </a>

          <a
            href="#order-mode-section"
            onClick={() => {
              setMobileMenuOpen(false);
              scrollToOrder();
            }}
          >
            ĐẶT MÓN
          </a>

          <Link
            to="/customer/reservations"
            onClick={() => setMobileMenuOpen(false)}
          >
            ĐẶT BÀN TRƯỚC
          </Link>

          <Link
            to="/customer/orders"
            onClick={() => setMobileMenuOpen(false)}
          >
            ĐƠN HÀNG
          </Link>

          <a href="#story-section" onClick={() => setMobileMenuOpen(false)}>
            CÂU CHUYỆN
          </a>

          <a href="#contact-section" onClick={() => setMobileMenuOpen(false)}>
            LIÊN HỆ
          </a>
        </nav>

        <div className="header-actions">
          <span className="header-greeting">
            Xin chào,{" "}
            <b>{user?.fullName || user?.username || "Bạn"}</b>
          </span>

          <button
            className="header-cart"
            onClick={openCart}
            aria-label="Mở giỏ hàng"
          >
            <ShoppingBag size={19} />
            <span>GIỎ HÀNG</span>
            <b>{cartCount}</b>
          </button>

          <button className="header-logout" onClick={logout}>
            THOÁT
          </button>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-label="Mở menu"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="restaurant-hero">
          <div className="hero-background-word">DELICIOUS</div>

          <div className="hero-copy">
            <div className="hero-eyebrow">
              <Sparkles size={15} />
              <span>ĂN NGON — SỐNG CHẤT</span>
            </div>

            <h1>
              NGON
              <br />
              <span>ĐÚNG ĐIỆU.</span>
              <br />
              VUI <i>ĐÚNG GU.</i>
            </h1>

            <p>
              Món ngon được làm bằng cả tâm huyết.
              Nguyên liệu tươi, hương vị thật, trải nghiệm đáng nhớ.
            </p>

            <button className="hero-cta" onClick={scrollToMenu}>
              KHÁM PHÁ THỰC ĐƠN
              <ArrowUpRight size={20} />
            </button>

            <div className="hero-meta">
              <span>01 — FRESH INGREDIENTS</span>
              <span>02 — BIG FLAVOUR</span>
            </div>
          </div>

          <div className="hero-image-wrap">
            <div className="hero-image-ring" />

            <img
              className="hero-food-image"
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=90"
              alt="Món ăn tươi ngon"
            />

            <div className="hero-sticker">
              <span>FRESH</span>
              <b>EVERY</b>
              <span>DAY!</span>
            </div>

            <div className="hero-image-caption">
              <span>MADE WITH LOVE</span>
              <ArrowDown size={18} />
            </div>
          </div>

          <div className="hero-side-note">
            GOOD TASTE NEVER GOES OUT OF STYLE
          </div>
        </section>

        {/* TICKER */}
        <div className="restaurant-ticker" aria-label="Thông điệp nhà hàng">
          <div className="ticker-track">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={index}>
                FRESH FOOD <b>✳</b> BIG FLAVOUR <b>✳</b> GOOD VIBES <b>✳</b>
                EAT HAPPY <b>✳</b>
              </span>
            ))}
          </div>
        </div>

        {/* ORDER TYPE */}
        <section className="order-mode-section" id="order-mode-section">
          <div>
            <span className="section-kicker">YOUR FOOD, YOUR WAY</span>
            <h2>HÔM NAY BẠN MUỐN ĂN Ở ĐÂU?</h2>
          </div>

          <div className="order-mode-options">
            <button
              className={orderType === "DINE_IN" ? "mode-active" : ""}
              onClick={() => handleOrderTypeChange("DINE_IN")}
            >
              <Utensils size={20} />
              <span>ĂN TẠI NHÀ HÀNG</span>
            </button>

            <button
              className={orderType === "DELIVERY" ? "mode-active" : ""}
              onClick={() => handleOrderTypeChange("DELIVERY")}
            >
              <Bike size={20} />
              <span>GIAO TẬN NƠI</span>
            </button>
          </div>
        </section>

        {/* MENU */}
        <section className="menu-section" id="menu-section">
          <div className="menu-heading">
            <div>
              <span className="section-kicker">MADE FRESH FOR YOU</span>
              <h2>
                ĂN GÌ
                <br />
                <span>HÔM NAY?</span>
              </h2>
            </div>

            <div className="menu-heading-right">
              <p>
                Từ món quen đến vị mới.
                Chọn món bạn thích và để chúng tôi lo phần còn lại.
              </p>

              <label className="menu-search">
                <Search size={18} />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm món ăn..."
                />
              </label>
            </div>
          </div>

          <div className="menu-toolbar">
            <div className="category-list">
              <button
                className={activeCategory === "all" ? "category-active" : ""}
                onClick={() => setActiveCategory("all")}
              >
                TẤT CẢ
              </button>

              {normalizedCategories.map((category) => (
                <button
                  key={category.id}
                  className={
                    String(activeCategory) === String(category.id)
                      ? "category-active"
                      : ""
                  }
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <span className="menu-count">
              {filteredDishes.length} MÓN ĂN
            </span>
          </div>

          {message && !cartOpen && (
            <div className={`order-message ${message.type}`}>
              <span>{message.text}</span>

              {pendingPaymentOrder && (
                <button
                  type="button"
                  onClick={retryCreatePayment}
                  disabled={submitting}
                  style={{
                    marginLeft: 10,
                    padding: "7px 12px",
                    borderRadius: 7,
                    border: 0,
                    background: "#ea580c",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {submitting ? "ĐANG THỬ..." : "THỬ THANH TOÁN LẠI"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMessage(null)}
                aria-label="Đóng thông báo"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {loadError && (
            <div className="menu-error">
              {loadError}

              <button onClick={() => window.location.reload()}>
                TẢI LẠI
              </button>
            </div>
          )}

          {loading ? (
            <div className="menu-loading">
              <span className="loading-orbit" />
              <p>ĐANG CHUẨN BỊ THỰC ĐƠN...</p>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="menu-empty">
              <Utensils size={34} />
              <h3>CHƯA TÌM THẤY MÓN ĂN</h3>
              <p>Thử tìm kiếm với từ khóa khác nhé.</p>
            </div>
          ) : (
            <div className="dish-grid">
              {filteredDishes.map((dish, index) => (
                <article className="dish-card" key={dish.id}>
                  <div className="dish-image-wrap">
                    <img
                      src={dish.image || FALLBACK_IMAGE}
                      alt={dish.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <span className="dish-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <button
                      className="dish-add-button"
                      onClick={() => addToCart(dish)}
                      aria-label={`Thêm ${dish.name} vào giỏ`}
                    >
                      <Plus size={23} />
                    </button>
                  </div>

                  <div className="dish-information">
                    <div>
                      <h3>{dish.name}</h3>
                      <p>{dish.description}</p>
                    </div>

                    <strong>{formatPrice(dish.price)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* BRAND STORY */}
        <section className="story-section" id="story-section">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&q=85"
              alt="Món ăn được chế biến tại nhà hàng"
              loading="lazy"
            />

            <span className="story-image-label">
              GOOD FOOD, GOOD LIFE.
            </span>
          </div>

          <div className="story-copy">
            <span className="section-kicker">A LITTLE STORY ABOUT US</span>

            <h2>
              KHÔNG CHỈ
              <br />
              LÀ MỘT
              <br />
              <span>BỮA ĂN.</span>
            </h2>

            <p>
              Chúng tôi tin rằng một món ăn ngon không chỉ
              nằm ở hương vị, mà còn ở cảm xúc mà nó mang lại.
              Mỗi món ăn là một lời mời tận hưởng những điều
              giản dị theo cách đặc biệt nhất.
            </p>

            <a href="#menu-section" className="story-link">
              CHỌN MÓN YÊU THÍCH <ArrowRight size={19} />
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="restaurant-footer" id="contact-section">
          <div className="footer-main">
            <div className="footer-brand">
              <span>M.</span>

              <h2>
                BẾP MẬN & LỬA.
                <br />
                ĂN NGON. VUI HẾT MÌNH.
              </h2>
            </div>

            <div className="footer-info">
              <span>COME HUNGRY, LEAVE HAPPY.</span>

              <p>
                <MapPin size={16} />
                Nhà hàng — Địa chỉ sẽ được cập nhật
              </p>

              <p>
                <Clock3 size={16} />
                Phục vụ mỗi ngày
              </p>
            </div>

            <button
              className="footer-top"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              LÊN ĐẦU TRANG <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="footer-bottom">
            <span>© 2026 BẾP MẬN & LỬA</span>
            <span>MADE FOR FOOD LOVERS.</span>
          </div>
        </footer>
      </main>

      {/* GIỎ HÀNG */}
      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="section-kicker">YOUR SELECTION</span>

                <h2>
                  GIỎ HÀNG <span>({cartCount})</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Đóng giỏ hàng"
              >
                <X size={23} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={42} />
                  <h3>GIỎ HÀNG ĐANG TRỐNG</h3>
                  <p>Chọn vài món ngon để bắt đầu nhé!</p>

                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                  >
                    KHÁM PHÁ THỰC ĐƠN
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img
                      src={item.image || FALLBACK_IMAGE}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <div className="cart-item-content">
                      <h3>{item.name}</h3>

                      <strong>
                        {formatPrice(item.price * item.quantity)}
                      </strong>

                      <input
                        value={item.itemNote}
                        onChange={(event) =>
                          updateItemNote(item.id, event.target.value)
                        }
                        placeholder="Ghi chú món ăn..."
                      />

                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          {item.quantity === 1 ? (
                            <Trash2 size={15} />
                          ) : (
                            <Minus size={15} />
                          )}
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-checkout">
                {message && (
                  <div
                    className={`cart-checkout-message ${message.type}`}
                    role="alert"
                  >
                    <div>{message.text}</div>

                    {pendingPaymentOrder && (
                      <button
                        type="button"
                        onClick={retryCreatePayment}
                        disabled={submitting}
                        style={{
                          marginTop: 9,
                          padding: "8px 12px",
                          borderRadius: 7,
                          border: 0,
                          background: "#ea580c",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        {submitting
                          ? "ĐANG THỬ..."
                          : "THỬ THANH TOÁN LẠI"}
                      </button>
                    )}
                  </div>
                )}

                {/* ĐỊA CHỈ GIAO HÀNG */}
                {orderType === "DELIVERY" && (
                  <label>
                    ĐỊA CHỈ GIAO HÀNG

                    <textarea
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(event.target.value)
                      }
                      placeholder="Nhập địa chỉ nhận hàng..."
                      rows={2}
                    />
                  </label>
                )}

                {/* DROPDOWN KHUYẾN MÃI */}
                <div className="promotion-field">
                  <label
                    htmlFor="promotion-select"
                    className="promotion-label"
                  >
                    <TicketPercent size={17} />
                    CHỌN MÃ KHUYẾN MÃI
                  </label>

                  <div className="promotion-select-wrapper">
                    <button
                      id="promotion-select"
                      type="button"
                      className="promotion-select"
                      aria-haspopup="listbox"
                      aria-expanded={promotionDropdownOpen}
                      onClick={() =>
                        setPromotionDropdownOpen((open) => !open)
                      }
                      disabled={promotionLoading || submitting}
                    >
                      <span className="promotion-select-text">
                        {promotionLoading
                          ? "Đang tải khuyến mãi..."
                          : selectedPromotion
                          ? `${selectedPromotion.promotionCode} — ${selectedPromotion.promotionName}`
                          : eligiblePromotions.length > 0
                          ? "Chọn mã khuyến mãi"
                          : "Chưa có mã phù hợp với đơn hàng"}
                      </span>

                      <ChevronDown
                        className={`promotion-select-icon ${
                          promotionDropdownOpen ? "is-open" : ""
                        }`}
                        size={19}
                      />
                    </button>

                    {promotionDropdownOpen && (
                      <div
                        className="promotion-dropdown-menu"
                        role="listbox"
                        aria-label="Danh sách mã khuyến mãi đủ điều kiện"
                      >
                        <button
                          type="button"
                          className={`promotion-dropdown-option promotion-no-code ${
                            !promotionCode ? "active" : ""
                          }`}
                          role="option"
                          aria-selected={!promotionCode}
                          onClick={() => handlePromotionChange("")}
                        >
                          <strong>Không sử dụng mã</strong>
                          <span>Thanh toán theo giá trị đơn hàng</span>
                        </button>

                        {eligiblePromotions.length > 0 ? (
                          eligiblePromotions.map((promotion) => {
                            const isSelected =
                              promotion.promotionCode === promotionCode;

                            return (
                              <button
                                type="button"
                                key={promotion.promotionId ?? promotion.promotionCode}
                                className={`promotion-dropdown-option ${
                                  isSelected ? "active" : ""
                                }`}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() =>
                                  handlePromotionChange(
                                    promotion.promotionCode
                                  )
                                }
                              >
                                <span className="promotion-option-heading">
                                  <strong>{promotion.promotionCode}</strong>
                                  <span className="promotion-option-discount">
                                    {getPromotionDescription(promotion)}
                                  </span>
                                </span>

                                <span className="promotion-option-name">
                                  {promotion.promotionName}
                                </span>

                                {Number(promotion.minOrderAmount ?? 0) > 0 && (
                                  <span className="promotion-option-minimum">
                                    Đơn tối thiểu:{" "}
                                    {formatPrice(promotion.minOrderAmount)}
                                  </span>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="promotion-dropdown-empty">
                            {promotionLoading
                              ? "Đang tải danh sách khuyến mãi..."
                              : "Chưa có mã khuyến mãi phù hợp với giá trị đơn hàng hiện tại."}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {promotionError && (
                    <div className="promotion-detail">
                      <X size={16} />
                      <span>{promotionError}</span>
                    </div>
                  )}

                  {selectedPromotion && (
                    <div className="promotion-detail success">
                      <Check size={16} />

                      <div>
                        <strong>
                          {selectedPromotion.promotionCode} —{" "}
                          {selectedPromotion.promotionName}
                        </strong>

                        <div>
                          {getPromotionDescription(selectedPromotion)}
                        </div>

                        {Number(selectedPromotion.minOrderAmount ?? 0) > 0 && (
                          <div>
                            Đơn tối thiểu:{" "}
                            {formatPrice(selectedPromotion.minOrderAmount)}
                          </div>
                        )}

                        {selectedPromotion.maxDiscountAmount != null && (
                          <div>
                            Giảm tối đa:{" "}
                            {formatPrice(selectedPromotion.maxDiscountAmount)}
                          </div>
                        )}

                        <div>
                          Dự kiến giảm:{" "}
                          <strong>
                            {formatPrice(promotionPreview.discount)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {promotionCode && (
                    <button
                      type="button"
                      className="promotion-clear"
                      onClick={() => handlePromotionChange("")}
                      disabled={submitting}
                    >
                      <X size={13} />
                      Bỏ chọn mã khuyến mãi
                    </button>
                  )}
                </div>

                {/* GHI CHÚ */}
                <label>
                  GHI CHÚ CHO NHÀ HÀNG

                  <textarea
                    value={customerNote}
                    onChange={(event) =>
                      setCustomerNote(event.target.value)
                    }
                    placeholder="Ví dụ: Giao hàng gọi trước..."
                    rows={2}
                  />
                </label>

                {/* PHƯƠNG THỨC THANH TOÁN */}
                <div
                  className="payment-method-selection"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 8,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    <Banknote size={18} />
                    PHƯƠNG THỨC THANH TOÁN
                  </div>

                  <button
                    type="button"
                    className={`payment-method-option ${
                      paymentMethod === "CASH" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("CASH")}
                    disabled={submitting}
                  >
                    <input
                      className="payment-radio"
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "CASH"}
                      onChange={() => setPaymentMethod("CASH")}
                    />

                    <Banknote size={22} color="#15803d" />

                    <span>
                      <strong>Tiền mặt</strong>

                      <small className="payment-description">
                        Thanh toán trực tiếp khi nhận món hoặc tại nhà hàng
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`payment-method-option ${
                      paymentMethod === "BANK_TRANSFER" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    disabled={submitting}
                  >
                    <input
                      className="payment-radio"
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() =>
                        setPaymentMethod("BANK_TRANSFER")
                      }
                    />

                    <QrCode size={22} color="#ea580c" />

                    <span>
                      <strong>Chuyển khoản ngân hàng (VietQR)</strong>

                      <small className="payment-description">
                        Thanh toán bằng cách quét mã QR
                      </small>
                    </span>
                  </button>
                </div>

                {/* TỔNG TIỀN */}
                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  <div className="cart-total-row">
                    <span>TẠM TÍNH</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>

                  {selectedPromotion && (
                    <div className="cart-total-row discount">
                      <span>GIẢM GIÁ ({selectedPromotion.promotionCode})</span>
                      <strong>
                        -{formatPrice(promotionPreview.discount)}
                      </strong>
                    </div>
                  )}

                  <div className="cart-total">
                    <span>TỔNG CỘNG</span>
                    <strong>{formatPrice(estimatedTotal)}</strong>
                  </div>

                  {selectedPromotion && (
                    <p
                      style={{
                        marginTop: 6,
                        color: "#78716c",
                        fontSize: 11,
                        lineHeight: 1.5,
                      }}
                    >
                      Số tiền giảm giá hiển thị là tạm tính. Hệ thống sẽ xác
                      nhận lại khuyến mãi khi tạo đơn hàng.
                    </p>
                  )}
                </div>

                {/* NÚT XÁC NHẬN */}
                <button
                  type="button"
                  className="checkout-button"
                  onClick={submitOrder}
                  disabled={submitting}
                >
                  {submitting
                    ? "ĐANG GỬI ĐƠN..."
                    : "XÁC NHẬN ĐẶT MÓN"}

                  <ArrowRight size={19} />
                </button>

                <p className="checkout-note">
                  Đơn hàng sẽ được gửi đến nhà hàng để tiếp nhận.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* KẾT QUẢ THANH TOÁN */}
      {paymentInfo && (
        <div
          className="payment-result-overlay"
          onClick={() => setPaymentInfo(null)}
        >
          <section
            className="payment-result-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <span
                  style={{
                    color: "#ea580c",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  BẾP MẬN & LỬA
                </span>

                <h2>THÔNG TIN THANH TOÁN</h2>
              </div>

              <button
                type="button"
                onClick={() => setPaymentInfo(null)}
                aria-label="Đóng thông tin thanh toán"
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={23} />
              </button>
            </div>

            <div
              style={{
                padding: 13,
                borderRadius: 10,
                background: "#f5f5f4",
                marginBottom: 14,
              }}
            >
              <div className="payment-info-row">
                <span>Mã đơn hàng</span>
                <strong>
                  {paymentInfo.orderCode || paymentInfo.orderId}
                </strong>
              </div>

              <div className="payment-info-row">
                <span>Số tiền</span>

                <strong style={{ color: "#ea580c", fontSize: 17 }}>
                  {formatPrice(paymentInfo.amount)}
                </strong>
              </div>

              <div className="payment-info-row">
                <span>Phương thức</span>

                <strong>
                  {paymentInfo.paymentMethod === "BANK_TRANSFER"
                    ? "Chuyển khoản VietQR"
                    : "Tiền mặt"}
                </strong>
              </div>

              <div className="payment-info-row">
                <span>Trạng thái</span>

                <strong
                  style={{
                    color:
                      paymentInfo.paymentStatus === "SUCCESS"
                        ? "#15803d"
                        : paymentInfo.paymentStatus === "FAILED"
                        ? "#b91c1c"
                        : "#d97706",
                  }}
                >
                  {paymentInfo.paymentStatus === "SUCCESS"
                    ? "ĐÃ THANH TOÁN"
                    : paymentInfo.paymentStatus === "FAILED"
                    ? "THẤT BẠI"
                    : paymentInfo.paymentStatus === "REFUNDED"
                    ? "ĐÃ HOÀN TIỀN"
                    : "ĐANG CHỜ THANH TOÁN"}
                </strong>
              </div>
            </div>

            {/* THANH TOÁN VIETQR */}
            {paymentInfo.paymentMethod === "BANK_TRANSFER" && (
              <>
                {paymentInfo.qrCodeUrl ? (
                  <div style={{ textAlign: "center", margin: "15px 0" }}>
                    <p style={{ fontWeight: 700, marginBottom: 10 }}>
                      QUÉT MÃ QR ĐỂ THANH TOÁN
                    </p>

                    <img
                      src={paymentInfo.qrCodeUrl}
                      alt="Mã QR thanh toán VietQR"
                      style={{
                        display: "block",
                        width: 230,
                        maxWidth: "100%",
                        margin: "0 auto",
                        border: "1px solid #e7e5e4",
                        borderRadius: 12,
                      }}
                    />
                  </div>
                ) : (
                  <p
                    style={{
                      padding: 12,
                      borderRadius: 9,
                      background: "#fff7ed",
                      color: "#9a3412",
                      fontSize: 13,
                    }}
                  >
                    Backend chưa trả về đường dẫn mã QR. Hãy kiểm tra cấu hình
                    VietQRService và thông tin tài khoản ngân hàng.
                  </p>
                )}

                {paymentInfo.bankName && (
                  <div className="payment-info-row">
                    <span>Ngân hàng</span>
                    <strong>{paymentInfo.bankName}</strong>
                  </div>
                )}

                {paymentInfo.accountNumber && (
                  <div className="payment-info-row">
                    <span>Số tài khoản</span>
                    <strong>{paymentInfo.accountNumber}</strong>

                    <button
                      type="button"
                      className="payment-copy-button"
                      onClick={() => copyText(paymentInfo.accountNumber)}
                    >
                      <Copy size={13} /> Sao chép
                    </button>
                  </div>
                )}

                {paymentInfo.accountName && (
                  <div className="payment-info-row">
                    <span>Chủ tài khoản</span>
                    <strong>{paymentInfo.accountName}</strong>
                  </div>
                )}

                {paymentInfo.transferContent && (
                  <div className="payment-info-row">
                    <span>Nội dung CK</span>
                    <strong>{paymentInfo.transferContent}</strong>

                    <button
                      type="button"
                      className="payment-copy-button"
                      onClick={() => copyText(paymentInfo.transferContent)}
                    >
                      <Copy size={13} /> Sao chép
                    </button>
                  </div>
                )}

                <p
                  style={{
                    marginTop: 14,
                    color: "#78716c",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển
                  khoản. Hệ thống sẽ cập nhật khi nhận được thông báo giao dịch
                  từ dịch vụ đối soát.
                </p>
              </>
            )}

            {/* THANH TOÁN TIỀN MẶT */}
            {paymentInfo.paymentMethod === "CASH" && (
              <p
                style={{
                  padding: 13,
                  borderRadius: 10,
                  background: "#f0fdf4",
                  color: "#166534",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Đơn hàng đã được tạo. Vui lòng thanh toán trực tiếp tại nhà
                hàng hoặc khi nhận món. Nhân viên sẽ xác nhận thanh toán trên
                hệ thống.
              </p>
            )}

            <button
              type="button"
              className="payment-primary-button"
              onClick={checkPaymentStatus}
              disabled={checkingPayment}
            >
              <RefreshCw
                size={17}
                style={{
                  animation: checkingPayment
                    ? "spin 1s linear infinite"
                    : "none",
                }}
              />

              {checkingPayment
                ? "ĐANG KIỂM TRA..."
                : "KIỂM TRA TRẠNG THÁI THANH TOÁN"}
            </button>

            <button
              type="button"
              className="payment-secondary-button"
              onClick={() => setPaymentInfo(null)}
            >
              ĐÓNG
            </button>

            <p
              style={{
                marginTop: 13,
                textAlign: "center",
                color: "#78716c",
                fontSize: 12,
              }}
            >
              Bạn có thể xem lại đơn hàng trong mục Đơn hàng của tôi.
            </p>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Link
                to="/customer/orders"
                onClick={() => setPaymentInfo(null)}
                style={{
                  color: "#ea580c",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                XEM ĐƠN HÀNG CỦA TÔI
              </Link>
            </div>
          </section>
        </div>
      )}

      <ChatbotWidget />
    </div>
  );
}