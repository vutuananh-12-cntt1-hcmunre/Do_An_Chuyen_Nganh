import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  Store,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

const foodImages = [
  {
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1400",
    alt: "Món ăn tươi ngon",
  },
  {
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400",
    alt: "Món ăn nhà hàng",
  },
  {
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1400",
    alt: "Món ăn hấp dẫn",
  },
  {
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400",
    alt: "Món ăn đặc sắc",
  },
];

function getHomePath(roles = []) {
  if (roles.includes("ADMIN") || roles.includes("MANAGER")) {
    return "/admin";
  }

  if (roles.includes("EMPLOYEE")) {
    return "/pos";
  }

  if (roles.includes("CUSTOMER")) {
    return "/customer";
  }

  return "/login";
}

export default function LoginPage() {
  const { login, loading, isAuthenticated, user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user?.roles)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    try {
      const currentUser = await login(username.trim(), password);

      const requestedPath = location.state?.from;

      const destination =
        requestedPath?.startsWith("/") &&
        !requestedPath.startsWith("//")
          ? requestedPath
          : getHomePath(currentUser.roles);

      navigate(destination, { replace: true });
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else if (status === 403) {
        setError("Tài khoản của bạn hiện không được phép đăng nhập.");
      } else if (!err.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend.");
      } else {
        setError(
          err.response?.data?.message ||
            "Đăng nhập thất bại. Vui lòng thử lại."
        );
      }
    }
  };

  return (
    <main className="grid min-h-screen bg-page lg:grid-cols-2">
      {/* LEFT: FOOD SLIDESHOW */}
      <section className="relative hidden min-h-screen overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="food-slideshow">
          {foodImages.map((image, index) => (
            <img
              key={image.url}
              src={image.url}
              alt={image.alt}
              className={`food-slide food-slide-${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute inset-0 z-[1] bg-[#25002D]/70" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand">
            <Store size={25} />
          </div>

          <div>
            <h1 className="font-heading text-xl font-extrabold">
              Bếp Mận & Lửa
            </h1>

            <p className="text-[10px] tracking-[2px] text-white/70">
              RESTAURANT MANAGEMENT
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-5 text-xs font-bold tracking-[3px] text-brand-orchid">
            QUẢN LÝ NHÀ HÀNG THÔNG MINH
          </p>

          <h2 className="font-heading text-5xl font-extrabold leading-tight">
            Vận hành tinh gọn.
            <br />
            Trải nghiệm trọn vẹn.
          </h2>

          <p className="mt-6 max-w-md text-sm leading-7 text-white/85">
            Nền tảng quản lý nhà hàng tích hợp đặt món, vận hành bếp, quản lý
            kho và phân tích phản hồi khách hàng bằng trí tuệ nhân tạo.
          </p>

          <div className="mt-8 flex items-center gap-2">
            {foodImages.map((image, index) => (
              <span
                key={image.url}
                className={`food-indicator food-indicator-${index + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/65">
          © 2026 Bếp Mận & Lửa. Restaurant Management System.
        </p>
      </section>

      {/* RIGHT: LOGIN FORM */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 lg:hidden">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
              <Store size={24} />
            </div>

            <h1 className="font-heading text-2xl font-extrabold text-brand">
              Bếp Mận & Lửa
            </h1>
          </div>

          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[2px] text-brand-orange">
              CHÀO MỪNG TRỞ LẠI
            </p>

            <h2 className="font-heading text-3xl font-extrabold text-brand">
              Đăng nhập
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Đăng nhập để tiếp tục sử dụng hệ thống.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tên đăng nhập
              </label>

              <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
                <UserRound size={18} className="shrink-0 text-gray-400" />

                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
                <LockKeyhole size={18} className="shrink-0 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
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

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
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
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-6 text-gray-400">
            Hệ thống quản lý nhà hàng
            <br />
            Bếp Mận & Lửa © 2026
          </p>
        </div>
      </section>
    </main>
  );
}
