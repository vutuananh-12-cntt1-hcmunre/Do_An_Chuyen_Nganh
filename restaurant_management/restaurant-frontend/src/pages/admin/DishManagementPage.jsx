
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Lock,
  Unlock,
  UtensilsCrossed,
  X,
  AlertCircle,
  Image as ImageIcon,
  Tags,
  Upload,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  categoryId: "",
  dishName: "",
  description: "",
  currentPrice: "",
  imageUrl: "",
};

const API_BASE_URL = "http://localhost:8080";

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/uploads/dishes/${imageUrl}`;
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));

// Lấy thông báo lỗi từ Backend
const getErrorMessage = (err) => {
  const data = err.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message ||
    data?.detail ||
    data?.error ||
    err.message ||
    "Đã xảy ra lỗi, vui lòng thử lại."
  );
};

export default function DishManagementPage() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const activeCategories = categories.filter(
    (category) => category.isActive === true
  );

  // Lấy danh sách món ăn và danh mục
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dishResponse, categoryResponse] = await Promise.all([
        api.get("/dishes"),
        api.get("/categories"),
      ]);

      setDishes(
        Array.isArray(dishResponse.data) ? dishResponse.data : []
      );

      setCategories(
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : []
      );
    } catch (err) {
      setError(getErrorMessage(err) || "Không thể tải dữ liệu món ăn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lọc món ăn
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        dish.dishName?.toLowerCase().includes(keyword) ||
        dish.description?.toLowerCase().includes(keyword);

      const matchesCategory =
        categoryFilter === "ALL" ||
        String(dish.categoryId) === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AVAILABLE" && dish.isAvailable === true) ||
        (statusFilter === "UNAVAILABLE" && dish.isAvailable === false);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [dishes, search, categoryFilter, statusFilter]);

  // Thống kê
  const totalDishes = dishes.length;

  const availableDishes = dishes.filter(
    (dish) => dish.isAvailable === true
  ).length;

  const unavailableDishes = dishes.filter(
    (dish) => dish.isAvailable === false
  ).length;

  // Mở form thêm món
  const openCreateModal = () => {
    setEditingDish(null);

    setForm({
      ...initialForm,
      categoryId: activeCategories[0]
        ? String(activeCategories[0].categoryId)
        : "",
    });

    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  };

  // Mở form sửa món
  const openEditModal = (dish) => {
    const categoryIsActive = activeCategories.some(
      (category) => category.categoryId === dish.categoryId
    );

    setEditingDish(dish);

    setForm({
      categoryId: categoryIsActive
        ? String(dish.categoryId)
        : "",
      dishName: dish.dishName || "",
      description: dish.description || "",
      currentPrice: String(dish.currentPrice ?? ""),
      imageUrl: dish.imageUrl || "",
    });

    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  };

  // Đóng form
  const closeModal = () => {
    if (saving || uploading) return;

    setShowModal(false);
    setEditingDish(null);
    setForm(initialForm);
    setFormError("");
    setFieldErrors({});
  };

  // Thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi của trường khi người dùng bắt đầu chỉnh sửa
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setFormError("");
  };

  // Tải ảnh từ máy tính lên Backend
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Ảnh không được vượt quá 5MB.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setFormError("");

      const response = await api.post("/dishes/upload", formData);

      setForm((prev) => ({
        ...prev,
        imageUrl: response.data.fileName,
      }));
    } catch (err) {
      setFormError(getErrorMessage(err) || "Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Xóa ảnh khỏi form
  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  // Kiểm tra dữ liệu
  const validateForm = () => {
    const errors = {};

    if (!form.categoryId) {
      errors.categoryId = "Danh mục không được để trống.";
    }

    if (!form.dishName.trim()) {
      errors.dishName = "Tên món ăn không được để trống.";
    } else if (form.dishName.trim().length > 150) {
      errors.dishName = "Tên món ăn không được vượt quá 150 ký tự.";
    }

    if (!form.description.trim()) {
      errors.description = "Mô tả món ăn không được để trống.";
    } else if (form.description.trim().length > 1000) {
      errors.description = "Mô tả không được vượt quá 1000 ký tự.";
    }

    const price = Number(form.currentPrice);

    if (
      !form.currentPrice ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      errors.currentPrice = "Giá món ăn phải lớn hơn 0.";
    }

    setFieldErrors(errors);
    setFormError("");

    return Object.keys(errors).length > 0;
  };

  // Thêm hoặc cập nhật món ăn
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      return;
    }

    const payload = {
      categoryId: Number(form.categoryId),
      dishName: form.dishName.trim(),
      description: form.description.trim(),
      currentPrice: Number(form.currentPrice),
      imageUrl: form.imageUrl.trim() || null,
    };

    try {
      setSaving(true);
      setFormError("");
      setError("");
      setSuccess("");

      if (editingDish) {
        await api.put(
          `/dishes/${editingDish.dishId}`,
          payload
        );

        setSuccess("Cập nhật món ăn thành công.");
      } else {
        await api.post("/dishes", payload);

        setSuccess("Thêm món ăn thành công.");
      }

      setShowModal(false);
      setEditingDish(null);
      setForm(initialForm);
      setFieldErrors({});

      await fetchData();
    } catch (err) {
      const message = getErrorMessage(err);

      // Nếu Backend trả về lỗi validation
      if (err.response?.status === 400) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes("mô tả")) {
          setFieldErrors((prev) => ({
            ...prev,
            description: message,
          }));
        } else if (lowerMessage.includes("tên món")) {
          setFieldErrors((prev) => ({
            ...prev,
            dishName: message,
          }));
        } else if (lowerMessage.includes("danh mục")) {
          setFieldErrors((prev) => ({
            ...prev,
            categoryId: message,
          }));
        } else if (lowerMessage.includes("giá")) {
          setFieldErrors((prev) => ({
            ...prev,
            currentPrice: message,
          }));
        } else {
          setFormError(message);
        }
      } else {
        setFormError(message || "Không thể lưu món ăn.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Kích hoạt / vô hiệu hóa món ăn
  const handleToggleStatus = async (dish) => {
    const action = dish.isAvailable
      ? "vô hiệu hóa"
      : "kích hoạt";

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn ${action} món "${dish.dishName}" không?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const endpoint = dish.isAvailable
        ? `/dishes/${dish.dishId}/deactivate`
        : `/dishes/${dish.dishId}/activate`;

      await api.patch(endpoint);

      setSuccess(
        dish.isAvailable
          ? "Vô hiệu hóa món ăn thành công."
          : "Kích hoạt món ăn thành công."
      );

      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err) || "Không thể thay đổi trạng thái món ăn.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-main">
            Quản lý món ăn
          </h1>

          <p className="mt-1 text-sm text-muted">
            Quản lý thực đơn, giá bán và trạng thái món ăn.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-main hover:bg-page disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Làm mới
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={17} />
            Thêm món ăn
          </button>
        </div>
      </div>

      {/* THÔNG BÁO */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* THỐNG KÊ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Tổng số món ăn</p>
            <UtensilsCrossed size={20} className="text-brand" />
          </div>

          <p className="mt-2 text-2xl font-bold text-main">
            {totalDishes}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Đang kinh doanh</p>
            <Unlock size={20} className="text-green-600" />
          </div>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {availableDishes}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Ngừng kinh doanh</p>
            <Lock size={20} className="text-red-500" />
          </div>

          <p className="mt-2 text-2xl font-bold text-red-500">
            {unavailableDishes}
          </p>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mô tả..."
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="ALL">Tất cả danh mục</option>

            {categories.map((category) => (
              <option
                key={category.categoryId}
                value={String(category.categoryId)}
              >
                {category.categoryName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Đang kinh doanh</option>
            <option value="UNAVAILABLE">Ngừng kinh doanh</option>
          </select>
        </div>
      </div>

      {/* DANH SÁCH MÓN ĂN */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold text-main">
            Danh sách món ăn
          </h2>

          <span className="text-sm text-muted">
            {filteredDishes.length} món
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted">
            Đang tải dữ liệu...
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="p-10 text-center">
            <UtensilsCrossed
              size={32}
              className="mx-auto mb-3 text-muted"
            />

            <p className="font-medium text-main">
              Không tìm thấy món ăn
            </p>

            <p className="mt-1 text-sm text-muted">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-page text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Món ăn</th>
                  <th className="px-4 py-3 font-medium">Danh mục</th>
                  <th className="px-4 py-3 font-medium">Giá bán</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredDishes.map((dish) => (
                  <tr key={dish.dishId} className="hover:bg-page/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {dish.imageUrl ? (
                          <img
                            src={getImageUrl(dish.imageUrl)}
                            alt={dish.dishName}
                            className="h-12 w-12 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-page text-muted">
                            <ImageIcon size={20} />
                          </div>
                        )}

                        <div className="max-w-xs">
                          <p className="font-semibold text-main">
                            {dish.dishName}
                          </p>

                          <p className="mt-1 truncate text-xs text-muted">
                            {dish.description || "Chưa có mô tả"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-main">
                      <span className="inline-flex items-center gap-2">
                        <Tags size={15} className="text-muted" />
                        {dish.categoryName || "Chưa phân loại"}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-main">
                      {formatPrice(dish.currentPrice)}
                    </td>

                    <td className="px-4 py-3">
                      {dish.isAvailable ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          Đang kinh doanh
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          Ngừng kinh doanh
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(dish)}
                          title="Chỉnh sửa"
                          className="rounded-lg border border-border p-2 text-main hover:bg-page"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(dish)}
                          title={dish.isAvailable ? "Ngừng kinh doanh" : "Kích hoạt"}
                          className={`rounded-lg border border-border p-2 ${
                            dish.isAvailable
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {dish.isAvailable ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM THÊM / SỬA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-main">
                  {editingDish ? "Cập nhật món ăn" : "Thêm món ăn"}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Nhập thông tin món ăn bên dưới.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving || uploading}
                className="rounded-lg p-2 text-muted hover:bg-page"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {formError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}

              {activeCategories.length === 0 && (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  Hiện không có danh mục đang hoạt động. Hãy kích hoạt
                  hoặc tạo danh mục trước khi thêm món ăn.
                </div>
              )}

              {/* DANH MỤC */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-main">
                  Danh mục <span className="text-red-500">*</span>
                </label>

                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-brand ${
                    fieldErrors.categoryId ? "border-red-500" : "border-border"
                  }`}
                >
                  <option value="">-- Chọn danh mục --</option>

                  {activeCategories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={String(category.categoryId)}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>

                {fieldErrors.categoryId && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.categoryId}
                  </p>
                )}

                {editingDish && !form.categoryId && (
                  <p className="mt-1 text-xs text-amber-600">
                    Danh mục hiện tại đã bị vô hiệu hóa. Vui lòng chọn
                    danh mục đang hoạt động khác.
                  </p>
                )}
              </div>

              {/* TÊN MÓN */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-main">
                  Tên món ăn <span className="text-red-500">*</span>
                </label>

                <input
                  name="dishName"
                  value={form.dishName}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="Ví dụ: Cơm gà xối mỡ"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-brand ${
                    fieldErrors.dishName ? "border-red-500" : "border-border"
                  }`}
                />

                {fieldErrors.dishName && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.dishName}
                  </p>
                )}
              </div>

              {/* MÔ TẢ */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-main">
                  Mô tả <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={3}
                  placeholder="Mô tả thành phần hoặc đặc điểm món ăn..."
                  className={`w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-brand ${
                    fieldErrors.description ? "border-red-500" : "border-border"
                  }`}
                />

                {fieldErrors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.description}
                  </p>
                )}

                <p className="mt-1 text-right text-xs text-muted">
                  {form.description.length}/1000
                </p>
              </div>

              {/* GIÁ BÁN */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-main">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  name="currentPrice"
                  value={form.currentPrice}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="Ví dụ: 45000"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-brand ${
                    fieldErrors.currentPrice ? "border-red-500" : "border-border"
                  }`}
                />

                {fieldErrors.currentPrice && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.currentPrice}
                  </p>
                )}
              </div>

              {/* CHỌN ẢNH */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-main">
                  Hình ảnh món ăn
                </label>

                <label
                  className={`inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-main ${
                    uploading
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-page"
                  }`}
                >
                  <Upload size={17} />

                  {uploading ? "Đang tải ảnh lên..." : "Chọn ảnh từ máy"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    disabled={uploading || saving}
                    className="hidden"
                  />
                </label>

                <p className="mt-1.5 text-xs text-muted">
                  Hỗ trợ JPG, PNG, WEBP, GIF. Dung lượng tối đa 5MB.
                </p>

                {form.imageUrl && (
                  <div className="mt-3 rounded-lg border border-border p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={getImageUrl(form.imageUrl)}
                        alt="Ảnh món ăn"
                        className="h-24 w-24 rounded-lg border border-border object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-main">
                          Ảnh đã chọn
                        </p>

                        <p className="mt-1 break-all text-xs text-muted">
                          {form.imageUrl.split("/").pop()}
                        </p>

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={saving || uploading}
                          className="mt-2 text-xs font-medium text-red-600 hover:underline"
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-main hover:bg-page"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploading ||
                    activeCategories.length === 0
                  }
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Đang lưu..."
                    : uploading
                      ? "Đang tải ảnh..."
                      : editingDish
                        ? "Lưu thay đổi"
                        : "Thêm món ăn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
