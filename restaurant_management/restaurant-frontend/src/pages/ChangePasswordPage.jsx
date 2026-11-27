import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowLeft,
  Save,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

/**
 * Đổi mật khẩu.
 * Ưu tiên gọi PUT /api/users/{id} với password mới (theo UserController hiện có).
 * Nếu backend sau này có endpoint riêng /auth/change-password vẫn tương thích dễ.
 */
export default function ChangePasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ các trường.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    if (!user?.userId) {
      setError("Không xác định được tài khoản đang đăng nhập.");
      return;
    }

    setLoading(true);

    try {
      // Thử endpoint chuyên dụng trước (nếu backend có)
      try {
        await api.post("/auth/change-password", {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
      } catch (firstError) {
        if (firstError.response?.status === 404) {
          // Fallback: cập nhật qua UserController
          await api.put(`/users/${user.userId}`, {
            passwordHash: form.newPassword,
            password: form.newPassword,
          });
        } else {
          throw firstError;
        }
      }

      setSuccess("Đổi mật khẩu thành công.");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 400) {
        setError(
          err.response?.data?.message ||
            "Mật khẩu hiện tại không đúng hoặc dữ liệu không hợp lệ."
        );
      } else {
        setError(
          err.response?.data?.message ||
            (typeof err.response?.data === "string"
              ? err.response.data
              : null) ||
            "Đổi mật khẩu thất bại. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-page px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-bold tracking-[2px] text-brand-orange">
              BẢO MẬT
            </p>
            <h1 className="font-heading text-2xl font-extrabold text-brand">
              Đổi mật khẩu
            </h1>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Hồ sơ
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              label="Mật khẩu hiện tại"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              autoComplete="current-password"
            />

            <PasswordField
              label="Mật khẩu mới"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              autoComplete="new-password"
            />

            <PasswordField
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              show={false}
              hideToggle
              autoComplete="new-password"
            />

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

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand font-bold text-white transition hover:bg-[#54115e] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  hideToggle,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
        <LockKeyhole size={18} className="shrink-0 text-gray-400" />
        <input
          type={hideToggle ? "password" : show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="h-full w-full bg-transparent text-sm text-gray-800 outline-none"
        />
        {!hideToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 text-gray-400 hover:text-brand"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
