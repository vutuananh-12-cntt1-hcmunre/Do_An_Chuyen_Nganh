import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Store,
  UserRound,
  LockKeyhole,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";

export default function RegisterPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (isAuthenticated) {
    const roles = user?.roles || [];
    if (roles.includes("ADMIN") || roles.includes("MANAGER")) {
      return <Navigate to="/admin" replace />;
    }
    if (roles.includes("EMPLOYEE")) {
      return <Navigate to="/employee" replace />;
    }
    return <Navigate to="/customer" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (
      !form.username.trim() ||
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      return "Vui lòng điền đầy đủ thông tin.";
    }

    if (form.username.trim().length < 4) {
      return "Tên đăng nhập phải có ít nhất 4 ký tự.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Email không đúng định dạng.";
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      return "Số điện thoại phải gồm đúng 10 chữ số.";
    }

    if (form.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (form.password !== form.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });

      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      if (status === 409 || status === 400) {
        setError(message || "Tên đăng nhập, email hoặc số điện thoại đã tồn tại.");
      } else if (!err.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend.");
      } else {
        setError(message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-page lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 z-[1] bg-[#25002D]/75" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand">
            <Store size={25} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-extrabold">Bếp Mận & Lửa</h1>
            <p className="text-[10px] tracking-[2px] text-white/70">
              RESTAURANT MANAGEMENT
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-5 text-xs font-bold tracking-[3px] text-brand-orchid">
            TẠO TÀI KHOẢN KHÁCH HÀNG
          </p>
          <h2 className="font-heading text-5xl font-extrabold leading-tight">
            Tham gia cùng chúng tôi.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/85">
            Đăng ký để đặt món, đặt bàn online, theo dõi đơn hàng và nhận ưu đãi
            từ nhà hàng Bếp Mận & Lửa.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/65">
          © 2026 Bếp Mận & Lửa. Restaurant Management System.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[2px] text-brand-orange">
              TÀI KHOẢN MỚI
            </p>
            <h2 className="font-heading text-3xl font-extrabold text-brand">
              Đăng ký
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Tạo tài khoản khách hàng để sử dụng dịch vụ.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Tên đăng nhập"
              icon={<UserRound size={18} className="shrink-0 text-gray-400" />}
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Ít nhất 4 ký tự"
              autoComplete="username"
            />

            <Field
              label="Họ và tên"
              icon={<UserPlus size={18} className="shrink-0 text-gray-400" />}
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />

            <Field
              label="Email"
              icon={<Mail size={18} className="shrink-0 text-gray-400" />}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              autoComplete="email"
            />

            <Field
              label="Số điện thoại"
              icon={<Phone size={18} className="shrink-0 text-gray-400" />}
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10 chữ số"
              autoComplete="tel"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
                <LockKeyhole size={18} className="shrink-0 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                  className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-gray-400 hover:text-brand"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Field
              label="Xác nhận mật khẩu"
              icon={<LockKeyhole size={18} className="shrink-0 text-gray-400" />}
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />

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
                  Đang đăng ký...
                </>
              ) : (
                <>
                  Đăng ký
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
        {icon}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
