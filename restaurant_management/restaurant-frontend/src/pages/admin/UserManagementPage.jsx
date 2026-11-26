
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Lock,
  Unlock,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";

const emptyForm = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/users");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách người dùng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Tìm kiếm và lọc
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        [
          user.username,
          user.fullName,
          user.email,
          user.phone,
        ].some((value) =>
          String(value || "").toLowerCase().includes(keyword)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive === true) ||
        (statusFilter === "INACTIVE" && user.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const activeCount = users.filter(
    (user) => user.isActive === true
  ).length;

  const inactiveCount = users.filter(
    (user) => user.isActive === false
  ).length;

  // Thay đổi dữ liệu form
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Mở form thêm mới
  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // Mở form chỉnh sửa
  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      username: user.username || "",
      email: user.email || "",
      password: "",
      fullName: user.fullName || "",
      phone: user.phone || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
  };

  // Thêm hoặc cập nhật người dùng
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingUser) {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
        };

        await api.put(
          `/users/${editingUser.userId}`,
          payload
        );
      } else {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
        };

        await api.post("/users", payload);
      }

      setShowModal(false);
      setEditingUser(null);
      setForm(emptyForm);

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Không thể lưu thông tin người dùng."
      );
    } finally {
      setSaving(false);
    }
  };

  // Khóa hoặc mở khóa tài khoản
  const toggleUserStatus = async (user) => {
    const isActive = user.isActive === true;

    const confirmed = window.confirm(
      `Bạn có chắc muốn ${isActive ? "khóa" : "mở khóa"} tài khoản ${user.username}?`
    );

    if (!confirmed) return;

    try {
      const action = isActive ? "deactivate" : "activate";

      await api.patch(
        `/users/${user.userId}/${action}`
      );

      await fetchUsers();
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
        err.response?.data ||
        "Không thể thay đổi trạng thái tài khoản."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý người dùng
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý tài khoản khách hàng và nhân viên.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={18} />
          Thêm tài khoản
        </button>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Tổng tài khoản"
          value={users.length}
          icon={<Users size={22} />}
        />

        <StatCard
          title="Đang hoạt động"
          value={activeCount}
          icon={<Unlock size={22} />}
        />

        <StatCard
          title="Đã khóa"
          value={inactiveCount}
          icon={<Lock size={22} />}
        />
      </div>

      {/* Danh sách */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm username, họ tên, email..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Đã khóa</option>
            </select>

            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>
        </div>

        {error && !showModal && (
          <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Tài khoản</th>
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy người dùng.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {user.username}
                    </td>

                    <td className="px-4 py-3">
                      {user.fullName || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {user.email || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {user.phone || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {user.isActive === true ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Đã khóa
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Chỉnh sửa"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => toggleUserStatus(user)}
                          title={
                            user.isActive
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                          className={`rounded-lg p-2 ${
                            user.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.isActive ? (
                            <Lock size={17} />
                          ) : (
                            <Unlock size={17} />
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

        <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          Hiển thị {filteredUsers.length} / {users.length} tài khoản
        </div>
      </div>

      {/* Modal thêm / sửa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-bold text-gray-800">
                {editingUser
                  ? "Cập nhật tài khoản"
                  : "Thêm tài khoản mới"}
              </h2>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {String(error)}
                </div>
              )}

              <FormField
                label="Tên đăng nhập"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />

              <FormField
                label="Họ và tên"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <FormField
                label="Số điện thoại"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />

              {!editingUser && (
                <FormField
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingUser
                      ? "Cập nhật"
                      : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="rounded-lg bg-orange-50 p-3 text-brand">
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}
