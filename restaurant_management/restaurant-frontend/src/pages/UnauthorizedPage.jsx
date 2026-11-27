import { Link } from "react-router-dom";
import { ShieldOff, Home } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

function getHomePath(roles = []) {
  if (roles.includes("ADMIN") || roles.includes("MANAGER")) return "/admin";
  if (roles.includes("EMPLOYEE")) return "/employee";
  if (roles.includes("CUSTOMER")) return "/customer";
  return "/login";
}

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth();
  const home = isAuthenticated ? getHomePath(user?.roles) : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <ShieldOff size={32} />
      </div>

      <p className="mb-2 text-xs font-bold tracking-[2px] text-red-500">
        LỖI 403
      </p>
      <h1 className="font-heading text-3xl font-extrabold text-brand sm:text-4xl">
        Không có quyền truy cập
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
        Tài khoản của bạn không được phép xem trang này. Vui lòng quay lại khu
        vực phù hợp với vai trò của bạn.
      </p>

      <Link
        to={home}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-6 font-bold text-white transition hover:bg-[#54115e]"
      >
        <Home size={18} />
        Về trang phù hợp
      </Link>
    </main>
  );
}
