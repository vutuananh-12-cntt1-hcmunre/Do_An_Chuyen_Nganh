
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Lock,
  Unlock,
  Tags,
  X,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    categoryName: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Đọc thông báo lỗi từ backend
  const getErrorMessage = (err) => {
    const data = err.response?.data;

    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;

    return err.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
  };

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");
      setCategories(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Thống kê
  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (item) => item.isActive === true
  ).length;
  const inactiveCategories = categories.filter(
    (item) => item.isActive === false
  ).length;

  // Tìm kiếm và lọc
  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.categoryName?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.isActive === true) ||
        (statusFilter === "INACTIVE" && item.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // Mở form thêm mới
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({
      categoryName: "",
      description: "",
    });
    setError("");
    setModalOpen(true);
  };

  // Mở form chỉnh sửa
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setForm({
      categoryName: category.categoryName || "",
      description: category.description || "",
    });
    setError("");
    setModalOpen(true);
  };

  // Thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm hoặc cập nhật danh mục
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryName.trim() || !form.description.trim()) {
      setError("Vui lòng nhập đầy đủ tên và mô tả danh mục.");
      return;
    }

    if (form.categoryName.trim().length > 100) {
      setError("Tên danh mục không được vượt quá 100 ký tự.");
      return;
    }

    if (form.description.trim().length > 255) {
      setError("Mô tả không được vượt quá 255 ký tự.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        categoryName: form.categoryName.trim(),
        description: form.description.trim(),
      };

      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory.categoryId}`,
          payload
        );
        setMessage("Cập nhật danh mục thành công.");
      } else {
        await api.post("/categories", payload);
        setMessage("Thêm danh mục thành công.");
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Kích hoạt hoặc vô hiệu hóa danh mục
  const handleToggleStatus = async (category) => {
    const action = category.isActive ? "vô hiệu hóa" : "kích hoạt";

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${action} danh mục "${category.categoryName}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      if (category.isActive) {
        await api.patch(
          `/categories/${category.categoryId}/deactivate`
        );
        setMessage("Vô hiệu hóa danh mục thành công.");
      } else {
        await api.patch(
          `/categories/${category.categoryId}/activate`
        );
        setMessage("Kích hoạt danh mục thành công.");
      }

      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand">
            Quản lý danh mục
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các nhóm món ăn trong thực đơn nhà hàng.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={17} />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Thông báo */}
      {message && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng danh mục</p>
              <p className="mt-2 text-2xl font-bold text-brand">
                {totalCategories}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
              <Tags size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {activeCategories}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-gray-500">Đã vô hiệu hóa</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {inactiveCategories}
          </p>
        </div>
      </div>

      {/* Bảng danh mục */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mô tả danh mục..."
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã vô hiệu hóa</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-semibold">ID</th>
                <th className="px-5 py-4 font-semibold">Tên danh mục</th>
                <th className="px-5 py-4 font-semibold">Mô tả</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 text-center font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500">
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.categoryId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-500">
                      #{category.categoryId}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {category.categoryName}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-gray-600">
                      {category.description}
                    </td>

                    <td className="px-5 py-4">
                      {category.isActive ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                          Vô hiệu hóa
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          title="Chỉnh sửa"
                          className="rounded-lg border border-border p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(category)}
                          title={
                            category.isActive
                              ? "Vô hiệu hóa"
                              : "Kích hoạt"
                          }
                          className={`rounded-lg border border-border p-2 ${
                            category.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {category.isActive ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-5 py-3 text-xs text-gray-500">
          Hiển thị {filteredCategories.length} / {totalCategories} danh mục
        </div>
      </div>

      {/* Modal thêm / sửa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-brand">
                {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
              </h2>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="Ví dụ: Món khai vị"
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.categoryName.length}/100
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={255}
                  required
                  rows={4}
                  placeholder="Mô tả về danh mục món ăn..."
                  className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.description.length}/255
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingCategory
                    ? "Lưu thay đổi"
                    : "Thêm danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
