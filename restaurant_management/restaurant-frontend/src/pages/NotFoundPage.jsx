import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

function getHomePath(roles = []) {
  if (roles.includes("ADMIN") || roles.includes("MANAGER")) return "/admin";
  if (roles.includes("EMPLOYEE")) return "/employee";
  if (roles.includes("CUSTOMER")) return "/customer";
  return "/login";
}

export default function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const home = isAuthenticated ? getHomePath(user?.roles) : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <SearchX size={32} />
      </div>

      <p className="mb-2 text-xs font-bold tracking-[2px] text-brand-orange">
        LỖI 404
      </p>
      <h1 className="font-heading text-3xl font-extrabold text-brand sm:text-4xl">
        Không tìm thấy trang
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.
      </p>

      <Link
        to={home}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-6 font-bold text-white transition hover:bg-[#54115e]"
      >
        <Home size={18} />
        Về trang chủ
      </Link>
    </main>
  );
}
