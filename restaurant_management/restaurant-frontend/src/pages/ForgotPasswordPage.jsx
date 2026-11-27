import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Mail,
  ArrowRight,
  LoaderCircle,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

import api from "../services/api";

/**
 * Trang quên mật khẩu.
 * Backend hiện tại có thể chưa có endpoint OTP/email đầy đủ.
 * Form này gọi thử POST /api/auth/forgot-password.
 * Nếu API chưa sẵn sàng, vẫn hiển thị hướng dẫn liên hệ nhà hàng.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Vui lòng nhập email đã đăng ký.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không đúng định dạng.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccess(
        "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư."
      );
    } catch (err) {
      // Backend có thể chưa implement endpoint này
      if (err.response?.status === 404) {
        setSuccess(
          "Chức năng gửi email đang được hoàn thiện. Vui lòng liên hệ nhà hàng hoặc quản trị viên để được hỗ trợ đặt lại mật khẩu."
        );
      } else if (!err.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } else {
        setError(
          err.response?.data?.message ||
            "Không thể gửi yêu cầu. Vui lòng thử lại hoặc liên hệ nhà hàng."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
            <Store size={24} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-extrabold text-brand">
              Bếp Mận & Lửa
            </h1>
            <p className="text-[10px] tracking-[2px] text-gray-400">
              RESTAURANT MANAGEMENT
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <KeyRound size={22} />
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-brand">
            Quên mật khẩu
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Nhập email đã đăng ký. Hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu
            nếu tài khoản tồn tại.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
              <Mail size={18} className="shrink-0 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
                className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand font-bold text-white transition hover:bg-[#54115e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                Gửi yêu cầu
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
      </div>
    </main>
  );
}
