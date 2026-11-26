
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Power,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Filter,
} from "lucide-react";
import api from "../../services/api";

const UNIT_OPTIONS = [
  { value: "KG", label: "Kilogram (KG)" },
  { value: "LITER", label: "Lít (LITER)" },
  { value: "BUNDLE", label: "Bó / Bó hàng (BUNDLE)" },
];

const EMPTY_FORM = {
  ingredientName: "",
  unit: "KG",
  minStockQuantity: "0",
};

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.response?.data?.error ||
    error?.message ||
    "Đã xảy ra lỗi. Vui lòng thử lại."
  );
}

function formatQuantity(value) {
  return Number(value ?? 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 3,
  });
}

function getStockStatus(ingredient) {
  const stock = Number(ingredient.stockQuantity ?? 0);
  const minimum = Number(ingredient.minStockQuantity ?? 0);

  if (stock <= 0) {
    return {
      label: "Hết hàng",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    };
  }

  if (stock <= minimum) {
    return {
      label: "Sắp hết",
      className: "bg-amber-100 text-amber-700",
      icon: AlertTriangle,
    };
  }

  return {
    label: "Còn hàng",
    className: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  };
}

export default function IngredientManagementPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/ingredients");
      setIngredients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const statistics = useMemo(() => {
    const active = ingredients.filter((item) => item.isActive);

    const lowStock = active.filter(
      (item) =>
        Number(item.stockQuantity ?? 0) <=
        Number(item.minStockQuantity ?? 0)
    );

    const outOfStock = active.filter(
      (item) => Number(item.stockQuantity ?? 0) <= 0
    );

    return {
      total: ingredients.length,
      active: active.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
    };
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        String(item.ingredientId).includes(keyword) ||
        (item.ingredientCode || "").toLowerCase().includes(keyword) ||
        (item.ingredientName || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.isActive) ||
        (statusFilter === "INACTIVE" && !item.isActive);

      const stock = Number(item.stockQuantity ?? 0);
      const minimum = Number(item.minStockQuantity ?? 0);

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" && stock <= minimum) ||
        (stockFilter === "NORMAL" && stock > minimum);

      return matchesSearch && matchesStatus && matchesStock;
    });
  }, [ingredients, search, statusFilter, stockFilter]);

  const openCreateModal = () => {
    setEditingIngredient(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (ingredient) => {
    setEditingIngredient(ingredient);
    setForm({
      ingredientName: ingredient.ingredientName || "",
      unit: ingredient.unit || "KG",
      minStockQuantity: String(ingredient.minStockQuantity ?? 0),
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingIngredient(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const ingredientName = form.ingredientName.trim();
    const minStockQuantity = Number(form.minStockQuantity);

    if (!ingredientName) {
      setError("Vui lòng nhập tên nguyên liệu.");
      return;
    }

    if (
      form.minStockQuantity === "" ||
      !Number.isFinite(minStockQuantity) ||
      minStockQuantity < 0
    ) {
      setError("Số lượng tồn kho tối thiểu phải lớn hơn hoặc bằng 0.");
      return;
    }

    const payload = {
      ingredientName,
      unit: form.unit,
      minStockQuantity,
    };

    try {
      setSaving(true);

      if (editingIngredient) {
        await api.put(
          `/ingredients/${editingIngredient.ingredientId}`,
          payload
        );
        setSuccess("Cập nhật nguyên liệu thành công.");
      } else {
        await api.post("/ingredients", {
          ...payload,
          stockQuantity: 0,
        });
        setSuccess("Thêm nguyên liệu thành công.");
      }

      setShowModal(false);
      setEditingIngredient(null);
      setForm(EMPTY_FORM);
      await loadIngredients();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ingredient) => {
    const action = ingredient.isActive ? "ngừng hoạt động" : "kích hoạt";

    if (
      !window.confirm(
        `Bạn có chắc muốn ${action} nguyên liệu "${ingredient.ingredientName}"?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const endpoint = ingredient.isActive
        ? `/ingredients/${ingredient.ingredientId}/deactivate`
        : `/ingredients/${ingredient.ingredientId}/activate`;

      await api.patch(endpoint);

      setSuccess(
        ingredient.isActive
          ? "Đã ngừng hoạt động nguyên liệu."
          : "Đã kích hoạt nguyên liệu."
      );

      await loadIngredients();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý nguyên liệu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi danh sách và tình trạng tồn kho nguyên liệu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadIngredients}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Làm mới
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            <Plus size={18} />
            Thêm nguyên liệu
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && !showModal && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng nguyên liệu"
          value={statistics.total}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Đang hoạt động"
          value={statistics.active}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Sắp hết hàng"
          value={statistics.lowStock}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Hết hàng"
          value={statistics.outOfStock}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã, tên nguyên liệu..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
          >
            <option value="ALL">Tất cả tình trạng kho</option>
            <option value="LOW">Sắp hết / hết hàng</option>
            <option value="NORMAL">Còn đủ hàng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="font-semibold text-gray-800">
            Danh sách nguyên liệu
          </h2>
          <span className="text-sm text-gray-500">
            {filteredIngredients.length} kết quả
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw className="animate-spin" size={20} />
            Đang tải dữ liệu...
          </div>
        ) : filteredIngredients.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">
              Không tìm thấy nguyên liệu
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Mã nguyên liệu</th>
                  <th className="px-4 py-3">Tên nguyên liệu</th>
                  <th className="px-4 py-3">Đơn vị</th>
                  <th className="px-4 py-3 text-right">Tồn kho</th>
                  <th className="px-4 py-3 text-right">Tồn tối thiểu</th>
                  <th className="px-4 py-3">Tình trạng kho</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredIngredients.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const StockIcon = stockStatus.icon;

                  return (
                    <tr
                      key={item.ingredientId}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-orange-700">
                        {item.ingredientCode}
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-800">
                        {item.ingredientName}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {item.unit}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-gray-800">
                        {formatQuantity(item.stockQuantity)}
                      </td>

                      <td className="px-4 py-4 text-right text-gray-600">
                        {formatQuantity(item.minStockQuantity)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${stockStatus.className}`}
                        >
                          <StockIcon size={14} />
                          {stockStatus.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.isActive
                            ? "Hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            disabled={!item.isActive}
                            title="Chỉnh sửa"
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleToggleActive(item)}
                            title={
                              item.isActive
                                ? "Ngừng hoạt động"
                                : "Kích hoạt"
                            }
                            className={`rounded-lg p-2 ${
                              item.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            <Power size={17} />
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingIngredient
                    ? "Cập nhật nguyên liệu"
                    : "Thêm nguyên liệu"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin nguyên liệu bên dưới.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {editingIngredient && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Mã nguyên liệu
                  </label>
                  <input
                    type="text"
                    value={editingIngredient.ingredientCode}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tên nguyên liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ingredientName"
                  value={form.ingredientName}
                  onChange={handleFormChange}
                  maxLength={150}
                  required
                  placeholder="Ví dụ: Thịt bò"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Đơn vị tính <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Số lượng tồn kho tối thiểu
                </label>
                <input
                  type="number"
                  name="minStockQuantity"
                  value={form.minStockQuantity}
                  onChange={handleFormChange}
                  min="0"
                  step="0.001"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Hệ thống cảnh báo khi tồn kho nhỏ hơn hoặc bằng mức này.
                </p>
              </div>

              {!editingIngredient && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  Nguyên liệu mới sẽ được tạo với tồn kho ban đầu bằng 0.
                  Mã nguyên liệu được hệ thống tự sinh.
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                >
                  <Save size={17} />
                  {saving
                    ? "Đang lưu..."
                    : editingIngredient
                      ? "Lưu thay đổi"
                      : "Thêm nguyên liệu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}
