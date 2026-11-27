import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  Save,
  LoaderCircle,
  ArrowLeft,
  LockKeyhole,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? {};
}

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user?.username && !user?.userId) {
        setLoading(false);
        setError("Không tìm thấy thông tin phiên đăng nhập.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        let response;
        if (user.userId) {
          response = await api.get(`/users/${user.userId}`);
        } else {
          response = await api.get(
            `/users/username/${encodeURIComponent(user.username)}`
          );
        }

        if (!mounted) return;

        const data = unwrap(response);

        setForm({
          fullName: data.fullName || user.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          username: data.username || user.username || "",
        });
      } catch (err) {
        if (!mounted) return;

        // Fallback từ AuthContext nếu API lỗi
        setForm({
          fullName: user.fullName || "",
          email: "",
          phone: "",
          username: user.username || "",
        });

        setError(
          err.response?.data?.message ||
            "Không tải được hồ sơ đầy đủ. Bạn vẫn có thể cập nhật thông tin cơ bản."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Họ tên không được để trống.");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Email không đúng định dạng.");
      return;
    }

    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) {
      setError("Số điện thoại phải gồm đúng 10 chữ số.");
      return;
    }

    if (!user?.userId) {
      setError("Không xác định được ID người dùng để cập nhật.");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/users/${user.userId}`, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        username: form.username,
      });

      // Cập nhật localStorage để Header hiển thị tên mới
      const saved = localStorage.getItem("auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.fullName = form.fullName.trim();
        localStorage.setItem("auth_user", JSON.stringify(parsed));
      }

      setSuccess("Cập nhật hồ sơ thành công.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : null) ||
          "Cập nhật hồ sơ thất bại. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  const backPath =
    user?.roles?.includes("CUSTOMER")
      ? "/customer"
      : user?.roles?.includes("EMPLOYEE")
        ? "/employee"
        : "/admin";

  return (
    <main className="min-h-screen bg-page px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold tracking-[2px] text-brand-orange">
              TÀI KHOẢN
            </p>
            <h1 className="font-heading text-2xl font-extrabold text-brand sm:text-3xl">
              Hồ sơ cá nhân
            </h1>
          </div>

          <Link
            to={backPath}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
              <LoaderCircle size={20} className="animate-spin" />
              Đang tải hồ sơ...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tên đăng nhập
                </label>
                <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-gray-50 px-4">
                  <UserRound size={18} className="text-gray-400" />
                  <input
                    type="text"
                    value={form.username}
                    disabled
                    className="h-full w-full bg-transparent text-sm text-gray-500 outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Tên đăng nhập không thể thay đổi.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Họ và tên
                </label>
                <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
                  <UserRound size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Số điện thoại
                </label>
                <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
                  <Phone size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand font-bold text-white transition hover:bg-[#54115e] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Lưu thay đổi
                    </>
                  )}
                </button>

                <Link
                  to="/change-password"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <LockKeyhole size={18} />
                  Đổi mật khẩu
                </Link>
              </div>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-lg border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Đăng xuất
        </button>
      </div>
    </main>
  );
}
