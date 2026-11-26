
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Power,
  Truck,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  supplierName: "",
  phone: "",
  email: "",
  address: "",
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;

  return error?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("vi-VN");
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/suppliers");
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const statistics = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((item) => item.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !keyword ||
        String(supplier.supplierCode || "").toLowerCase().includes(keyword) ||
        String(supplier.supplierName || "").toLowerCase().includes(keyword) ||
        String(supplier.phone || "").toLowerCase().includes(keyword) ||
        String(supplier.email || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && supplier.isActive) ||
        (statusFilter === "INACTIVE" && !supplier.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / PAGE_SIZE)
  );

  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      supplierName: supplier.supplierName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSupplier(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const supplierName = form.supplierName.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const address = form.address.trim();

    if (!supplierName) {
      return "Vui lòng nhập tên nhà cung cấp.";
    }

    if (supplierName.length > 255) {
      return "Tên nhà cung cấp không được vượt quá 255 ký tự.";
    }

    if (!/^0[0-9]{9}$/.test(phone)) {
      return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
    }

    if (
      email &&
      (email.length > 255 ||
        !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))
    ) {
      return "Email không hợp lệ hoặc vượt quá 255 ký tự.";
    }

    if (address.length > 500) {
      return "Địa chỉ không được vượt quá 500 ký tự.";
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
      supplierName: form.supplierName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingSupplier) {
        await api.put(
          `/suppliers/${editingSupplier.supplierId}`,
          payload
        );

        setSuccess("Cập nhật nhà cung cấp thành công.");
      } else {
        await api.post("/suppliers", payload);

        setSuccess("Thêm nhà cung cấp thành công.");
      }

      setShowModal(false);
      setEditingSupplier(null);
      setForm(EMPTY_FORM);

      await loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (supplier) => {
    const action = supplier.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      supplier.isActive
        ? `Bạn có chắc muốn ngừng hoạt động nhà cung cấp "${supplier.supplierName}"?`
        : `Bạn có chắc muốn kích hoạt nhà cung cấp "${supplier.supplierName}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/suppliers/${supplier.supplierId}/${action}`
      );

      setSuccess(
        supplier.isActive
          ? "Đã ngừng hoạt động nhà cung cấp."
          : "Đã kích hoạt nhà cung cấp."
      );

      await loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý nhà cung cấp
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin và trạng thái các nhà cung cấp nguyên liệu.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadSuppliers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            <Plus size={18} />
            Thêm nhà cung cấp
          </button>
        </div>
      </div>

      {/* Thông báo */}
      {error && !showModal && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <XCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Tổng nhà cung cấp"
          value={statistics.total}
          icon={Truck}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Đang hoạt động"
          value={statistics.active}
          icon={CheckCircle2}
          color="bg-green-50 text-green-600"
        />

        <StatCard
          title="Ngừng hoạt động"
          value={statistics.inactive}
          icon={XCircle}
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* Tìm kiếm và bộ lọc */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo mã, tên, số điện thoại hoặc email..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      {/* Danh sách */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-800">
            Danh sách nhà cung cấp
          </h2>

          <span className="text-sm text-gray-500">
            {filteredSuppliers.length} kết quả
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw size={20} className="animate-spin" />
            Đang tải dữ liệu...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="py-16 text-center">
            <Truck size={40} className="mx-auto text-gray-300" />
            <p className="mt-3 font-medium text-gray-600">
              Không tìm thấy nhà cung cấp
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Mã nhà cung cấp</th>
                    <th className="px-5 py-3">Thông tin nhà cung cấp</th>
                    <th className="px-5 py-3">Liên hệ</th>
                    <th className="px-5 py-3">Ngày tạo</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedSuppliers.map((supplier) => (
                    <tr
                      key={supplier.supplierId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-orange-50 px-2 py-1 font-mono text-xs font-semibold text-orange-700">
                          {supplier.supplierCode}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <Building2
                            size={17}
                            className="mt-0.5 shrink-0 text-gray-400"
                          />

                          <div>
                            <p className="font-semibold text-gray-800">
                              {supplier.supplierName}
                            </p>

                            <p className="mt-1 flex max-w-xs items-start gap-1 text-xs text-gray-500">
                              <MapPin size={13} className="mt-0.5 shrink-0" />
                              <span>{supplier.address || "Chưa có địa chỉ"}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-2 text-gray-700">
                            <Phone size={14} className="text-gray-400" />
                            {supplier.phone}
                          </p>

                          <p className="flex items-center gap-2 text-gray-500">
                            <Mail size={14} className="text-gray-400" />
                            {supplier.email || "Chưa có email"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(supplier.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        {supplier.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <CheckCircle2 size={13} />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            <XCircle size={13} />
                            Ngừng hoạt động
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(supplier)}
                            title="Chỉnh sửa"
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(supplier)}
                            title={
                              supplier.isActive
                                ? "Ngừng hoạt động"
                                : "Kích hoạt"
                            }
                            className={`rounded-lg p-2 ${
                              supplier.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            <Power size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Hiển thị{" "}
                {filteredSuppliers.length === 0
                  ? 0
                  : (currentPage - 1) * PAGE_SIZE + 1}
                {" - "}
                {Math.min(currentPage * PAGE_SIZE, filteredSuppliers.length)}
                {" / "}
                {filteredSuppliers.length} nhà cung cấp
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal thêm / sửa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingSupplier
                    ? "Cập nhật nhà cung cấp"
                    : "Thêm nhà cung cấp"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingSupplier
                    ? `Mã: ${editingSupplier.supplierCode}`
                    : "Mã nhà cung cấp sẽ được hệ thống tự động tạo."}
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

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tên nhà cung cấp <span className="text-red-500">*</span>
                </label>

                <input
                  name="supplierName"
                  value={form.supplierName}
                  onChange={handleChange}
                  maxLength={255}
                  required
                  placeholder="Nhập tên nhà cung cấp"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={10}
                  required
                  inputMode="numeric"
                  placeholder="Ví dụ: 0901234567"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Gồm 10 chữ số và bắt đầu bằng số 0.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Nhập địa chỉ nhà cung cấp"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.address.length}/500
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving
                    ? "Đang lưu..."
                    : editingSupplier
                      ? "Lưu thay đổi"
                      : "Thêm nhà cung cấp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
