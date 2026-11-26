
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Tag,
  CalendarDays,
  TicketPercent,
  ToggleLeft,
  ToggleRight,
  X,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const emptyForm = {
  promotionCode: "",
  promotionName: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscountAmount: "",
  startAt: "",
  endAt: "",
  usageLimit: "",
  isActive: true,
};

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const toDateTimeLocal = (value) => {
  if (!value) return "";
  return value.slice(0, 16);
};

const getStatus = (promotion) => {
  const now = new Date();
  const start = new Date(promotion.startAt);
  const end = new Date(promotion.endAt);

  if (!promotion.isActive) return "INACTIVE";
  if (now < start) return "UPCOMING";
  if (now > end) return "EXPIRED";

  if (
    promotion.usageLimit != null &&
    promotion.usedCount >= promotion.usageLimit
  ) {
    return "USED_UP";
  }

  return "ACTIVE";
};

const statusConfig = {
  ACTIVE: {
    label: "Đang áp dụng",
    className: "bg-green-100 text-green-700",
  },
  INACTIVE: {
    label: "Đã tắt",
    className: "bg-gray-100 text-gray-600",
  },
  UPCOMING: {
    label: "Sắp diễn ra",
    className: "bg-blue-100 text-blue-700",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    className: "bg-red-100 text-red-700",
  },
  USED_UP: {
    label: "Hết lượt",
    className: "bg-orange-100 text-orange-700",
  },
};

export default function PromotionManagementPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/promotions");
      setPromotions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Không thể tải danh sách khuyến mãi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        promotion.promotionCode?.toLowerCase().includes(keyword) ||
        promotion.promotionName?.toLowerCase().includes(keyword);

      const status = getStatus(promotion);
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [promotions, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: promotions.length,
      active: promotions.filter(
        (item) => getStatus(item) === "ACTIVE"
      ).length,
      expired: promotions.filter(
        (item) => getStatus(item) === "EXPIRED"
      ).length,
      used: promotions.reduce(
        (sum, item) => sum + Number(item.usedCount || 0),
        0
      ),
    };
  }, [promotions]);

  const openCreateModal = () => {
    setEditingPromotion(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (promotion) => {
    setEditingPromotion(promotion);

    setForm({
      promotionCode: promotion.promotionCode || "",
      promotionName: promotion.promotionName || "",
      description: promotion.description || "",
      discountType: promotion.discountType || "PERCENTAGE",
      discountValue: String(promotion.discountValue ?? ""),
      minOrderAmount: String(promotion.minOrderAmount ?? 0),
      maxDiscountAmount:
        promotion.maxDiscountAmount == null
          ? ""
          : String(promotion.maxDiscountAmount),
      startAt: toDateTimeLocal(promotion.startAt),
      endAt: toDateTimeLocal(promotion.endAt),
      usageLimit:
        promotion.usageLimit == null
          ? ""
          : String(promotion.usageLimit),
      isActive: promotion.isActive ?? true,
    });

    setError("");
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!form.promotionCode.trim()) return "Vui lòng nhập mã khuyến mãi.";
    if (!form.promotionName.trim()) return "Vui lòng nhập tên khuyến mãi.";

    const discountValue = Number(form.discountValue);
    const minOrderAmount = Number(form.minOrderAmount);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return "Giá trị giảm phải lớn hơn 0.";
    }

    if (
      form.discountType === "PERCENTAGE" &&
      discountValue > 100
    ) {
      return "Phần trăm giảm không được vượt quá 100%.";
    }

    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      return "Đơn hàng tối thiểu không hợp lệ.";
    }

    if (
      form.maxDiscountAmount !== "" &&
      Number(form.maxDiscountAmount) <= 0
    ) {
      return "Mức giảm tối đa phải lớn hơn 0.";
    }

    if (!form.startAt || !form.endAt) {
      return "Vui lòng chọn thời gian áp dụng.";
    }

    if (new Date(form.startAt) >= new Date(form.endAt)) {
      return "Thời gian kết thúc phải sau thời gian bắt đầu.";
    }

    if (
      form.usageLimit !== "" &&
      (!Number.isInteger(Number(form.usageLimit)) ||
        Number(form.usageLimit) <= 0)
    ) {
      return "Giới hạn lượt sử dụng phải là số nguyên lớn hơn 0.";
    }

    if (
      editingPromotion &&
      form.usageLimit !== "" &&
      Number(form.usageLimit) < Number(editingPromotion.usedCount || 0)
    ) {
      return "Giới hạn không được nhỏ hơn số lượt đã sử dụng.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      promotionCode: form.promotionCode.trim().toUpperCase(),
      promotionName: form.promotionName.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscountAmount:
        form.maxDiscountAmount === ""
          ? null
          : Number(form.maxDiscountAmount),
      startAt: form.startAt + ":00",
      endAt: form.endAt + ":00",
      usageLimit:
        form.usageLimit === "" ? null : Number(form.usageLimit),
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      setError("");

      if (editingPromotion) {
        await api.put(
          `/promotions/${editingPromotion.promotionId}`,
          payload
        );
      } else {
        await api.post("/promotions", payload);
      }

      setModalOpen(false);
      await loadPromotions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Không thể lưu khuyến mãi."
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePromotion = async (promotion) => {
    const action = promotion.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      promotion.isActive
        ? `Ngừng kích hoạt mã ${promotion.promotionCode}?`
        : `Kích hoạt mã ${promotion.promotionCode}?`
    );

    if (!confirmed) return;

    try {
      await api.patch(
        `/promotions/${promotion.promotionId}/${action}`
      );
      await loadPromotions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Không thể thay đổi trạng thái khuyến mãi."
      );
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý khuyến mãi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tạo và quản lý các mã ưu đãi dành cho khách hàng.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Thêm khuyến mãi
        </button>
      </div>

      {error && !modalOpen && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng khuyến mãi"
          value={stats.total}
          icon={Tag}
        />
        <StatCard
          title="Đang áp dụng"
          value={stats.active}
          icon={TicketPercent}
        />
        <StatCard
          title="Đã hết hạn"
          value={stats.expired}
          icon={CalendarDays}
        />
        <StatCard
          title="Tổng lượt sử dụng"
          value={stats.used}
          icon={ToggleRight}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo mã hoặc tên khuyến mãi..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} md:w-52`}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang áp dụng</option>
            <option value="INACTIVE">Đã tắt</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="USED_UP">Hết lượt</option>
          </select>

          <button
            onClick={loadPromotions}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-800">
            Danh sách khuyến mãi
          </h2>
          <span className="text-sm text-gray-500">
            {filteredPromotions.length} kết quả
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Không tìm thấy khuyến mãi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Mã khuyến mãi</th>
                  <th className="px-5 py-3">Giá trị giảm</th>
                  <th className="px-5 py-3">Đơn tối thiểu</th>
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Lượt dùng</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPromotions.map((promotion) => {
                  const status = getStatus(promotion);
                  const config = statusConfig[status];

                  return (
                    <tr
                      key={promotion.promotionId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-brand">
                          {promotion.promotionCode}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {promotion.promotionName}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {promotion.discountType === "PERCENTAGE"
                          ? `${promotion.discountValue}%`
                          : formatMoney(promotion.discountValue)}
                        {promotion.maxDiscountAmount &&
                          promotion.discountType === "PERCENTAGE" && (
                            <p className="mt-1 text-xs font-normal text-gray-500">
                              Tối đa {formatMoney(promotion.maxDiscountAmount)}
                            </p>
                          )}
                      </td>

                      <td className="px-5 py-4">
                        {formatMoney(promotion.minOrderAmount)}
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-600">
                        <p>{formatDate(promotion.startAt)}</p>
                        <p className="mt-1">
                          đến {formatDate(promotion.endAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {promotion.usedCount || 0}
                        {" / "}
                        {promotion.usageLimit ?? "∞"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(promotion)}
                            title="Chỉnh sửa"
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            onClick={() => togglePromotion(promotion)}
                            title={
                              promotion.isActive
                                ? "Ngừng kích hoạt"
                                : "Kích hoạt"
                            }
                            className={`rounded-lg p-2 ${
                              promotion.isActive
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {promotion.isActive ? (
                              <ToggleRight size={19} />
                            ) : (
                              <ToggleLeft size={19} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingPromotion
                    ? "Cập nhật khuyến mãi"
                    : "Tạo khuyến mãi mới"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin chương trình ưu đãi.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Mã khuyến mãi *</label>
                  <input
                    name="promotionCode"
                    value={form.promotionCode}
                    onChange={handleChange}
                    placeholder="VD: WELCOME20"
                    className={inputClass}
                    maxLength={30}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Tên khuyến mãi *</label>
                  <input
                    name="promotionName"
                    value={form.promotionName}
                    onChange={handleChange}
                    placeholder="Ưu đãi khách hàng mới"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass}
                  placeholder="Mô tả chương trình khuyến mãi..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Loại giảm giá *</label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="PERCENTAGE">Theo phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Giá trị giảm *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Đơn hàng tối thiểu *</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={form.minOrderAmount}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={form.maxDiscountAmount}
                    onChange={handleChange}
                    min="0"
                    placeholder="Để trống nếu không giới hạn"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Bắt đầu *</label>
                  <input
                    type="datetime-local"
                    name="startAt"
                    value={form.startAt}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Kết thúc *</label>
                  <input
                    type="datetime-local"
                    name="endAt"
                    value={form.endAt}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Giới hạn lượt sử dụng</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder="Để trống nếu không giới hạn"
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="promotion-active"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 accent-brand"
                  />
                  <label
                    htmlFor="promotion-active"
                    className="text-sm font-medium text-gray-700"
                  >
                    Kích hoạt khuyến mãi
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingPromotion
                      ? "Lưu thay đổi"
                      : "Tạo khuyến mãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        <Icon size={23} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
