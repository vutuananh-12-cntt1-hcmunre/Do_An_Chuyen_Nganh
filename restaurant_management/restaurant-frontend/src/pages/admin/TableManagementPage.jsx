
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Power,
  Users,
  Armchair,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import api from "../../services/api";

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Còn trống" },
  { value: "OCCUPIED", label: "Đang sử dụng" },
  { value: "RESERVED", label: "Đã đặt trước" },
  { value: "MAINTENANCE", label: "Bảo trì" },
];

const EMPTY_FORM = {
  tableCode: "",
  capacity: 4,
  tableStatus: "AVAILABLE",
  description: "",
};

const getStatusInfo = (status) => {
  const statusMap = {
    AVAILABLE: {
      label: "Còn trống",
      className: "bg-green-100 text-green-700",
    },
    OCCUPIED: {
      label: "Đang sử dụng",
      className: "bg-red-100 text-red-700",
    },
    RESERVED: {
      label: "Đã đặt trước",
      className: "bg-blue-100 text-blue-700",
    },
    MAINTENANCE: {
      label: "Bảo trì",
      className: "bg-orange-100 text-orange-700",
    },
  };

  return statusMap[status] || {
    label: status || "Không xác định",
    className: "bg-gray-100 text-gray-700",
  };
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("vi-VN");
};

export default function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tables");
      setTables(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Lỗi tải danh sách bàn:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Không thể tải danh sách bàn ăn."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        table.tableCode?.toLowerCase().includes(keyword) ||
        String(table.tableId).includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        table.tableStatus === statusFilter;

      const matchesActive =
        activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && table.isActive === true) ||
        (activeFilter === "INACTIVE" && table.isActive === false);

      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [tables, search, statusFilter, activeFilter]);

  const statistics = useMemo(() => {
    return {
      total: tables.length,
      active: tables.filter((t) => t.isActive === true).length,
      available: tables.filter(
        (t) => t.isActive === true && t.tableStatus === "AVAILABLE"
      ).length,
      occupied: tables.filter(
        (t) => t.isActive === true && t.tableStatus === "OCCUPIED"
      ).length,
      reserved: tables.filter(
        (t) => t.isActive === true && t.tableStatus === "RESERVED"
      ).length,
    };
  }, [tables]);

  const openCreateModal = () => {
    setEditingTable(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (table) => {
    setEditingTable(table);

    setForm({
      tableCode: table.tableCode || "",
      capacity: table.capacity || 1,
      tableStatus: table.tableStatus || "AVAILABLE",
      description: table.description || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTable(null);
    setForm({ ...EMPTY_FORM });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "capacity" ? value : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const tableCode = form.tableCode.trim();
    const capacity = Number(form.capacity);
    const description = form.description.trim();

    if (!tableCode) {
      setError("Vui lòng nhập mã bàn.");
      return;
    }

    if (tableCode.length > 20) {
      setError("Mã bàn không được vượt quá 20 ký tự.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 15) {
      setError("Sức chứa phải từ 1 đến 15 người.");
      return;
    }

    if (description.length > 500) {
      setError("Mô tả không được vượt quá 500 ký tự.");
      return;
    }

    const payload = {
      tableCode,
      capacity,
      tableStatus: form.tableStatus,
      description,
    };

    try {
      setSaving(true);

      if (editingTable) {
        await api.put(`/tables/${editingTable.tableId}`, payload);
        setSuccess("Cập nhật bàn ăn thành công.");
      } else {
        await api.post("/tables", payload);
        setSuccess("Thêm bàn ăn thành công.");
      }

      setShowModal(false);
      setEditingTable(null);
      setForm({ ...EMPTY_FORM });

      await fetchTables();
    } catch (err) {
      console.error("Lỗi lưu bàn ăn:", err);

      const responseData = err.response?.data;

      setError(
        responseData?.message ||
        responseData?.detail ||
        (typeof responseData === "string" ? responseData : null) ||
        "Không thể lưu thông tin bàn ăn."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (table) => {
    const isActive = table.isActive === true;

    const action = isActive ? "vô hiệu hóa" : "kích hoạt";

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${action} bàn ${table.tableCode}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      if (isActive) {
        await api.patch(`/tables/${table.tableId}/deactivate`);
        setSuccess(`Đã vô hiệu hóa bàn ${table.tableCode}.`);
      } else {
        await api.patch(`/tables/${table.tableId}/activate`);
        setSuccess(`Đã kích hoạt bàn ${table.tableCode}.`);
      }

      await fetchTables();
    } catch (err) {
      console.error("Lỗi thay đổi trạng thái bàn:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null) ||
        "Không thể thay đổi trạng thái bàn."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý bàn ăn
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin, sức chứa và trạng thái bàn ăn trong nhà hàng.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white transition hover:bg-orange-700"
        >
          <Plus size={18} />
          Thêm bàn mới
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle size={18} />
          {success}
          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && !showModal && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Tổng số bàn</p>
            <Armchair className="text-orange-600" size={22} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {statistics.total}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Bàn hoạt động</p>
            <CheckCircle className="text-green-600" size={22} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {statistics.active}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Còn trống</p>
            <Armchair className="text-green-600" size={22} />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {statistics.available}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Đang sử dụng</p>
            <Users className="text-red-600" size={22} />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {statistics.occupied}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Đã đặt trước</p>
            <Filter className="text-blue-600" size={22} />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {statistics.reserved}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã bàn hoặc ID..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
          >
            <option value="ALL">Tất cả trạng thái bàn</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
          >
            <option value="ALL">Tất cả bàn</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã vô hiệu hóa</option>
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị <strong>{filteredTables.length}</strong> / {tables.length} bàn
          </p>

          <button
            onClick={fetchTables}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>
      </div>

      {/* Table list */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Mã bàn</th>
                <th className="px-5 py-4 font-semibold">Sức chứa</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 font-semibold">Hoạt động</th>
                <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <RefreshCw
                      className="mx-auto mb-2 animate-spin text-orange-600"
                      size={24}
                    />
                    Đang tải danh sách bàn...
                  </td>
                </tr>
              ) : filteredTables.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <Armchair
                      className="mx-auto mb-2 text-gray-300"
                      size={36}
                    />
                    Không tìm thấy bàn ăn phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTables.map((table) => {
                  const status = getStatusInfo(table.tableStatus);

                  return (
                    <tr
                      key={table.tableId}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">
                          {table.tableCode}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {table.tableId}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users size={16} className="text-gray-400" />
                          {table.capacity} người
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {table.isActive ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                            <CheckCircle size={15} />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500">
                            <Power size={15} />
                            Đã khóa
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(table.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(table)}
                            title="Chỉnh sửa"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleToggleActive(table)}
                            title={table.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                            className={`rounded-lg p-2 transition ${
                              table.isActive
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingTable ? "Cập nhật bàn ăn" : "Thêm bàn ăn mới"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Nhập thông tin bàn ăn bên dưới.
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
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mã bàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tableCode"
                  value={form.tableCode}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="Ví dụ: B01, B02..."
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Sức chứa (người) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min={1}
                  max={15}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Sức chứa từ 1 đến 15 người.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Trạng thái bàn <span className="text-red-500">*</span>
                </label>
                <select
                  name="tableStatus"
                  value={form.tableStatus}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Nhập mô tả nếu có..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.description.length}/500
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
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}
                  {saving
                    ? "Đang lưu..."
                    : editingTable
                      ? "Cập nhật"
                      : "Thêm bàn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
