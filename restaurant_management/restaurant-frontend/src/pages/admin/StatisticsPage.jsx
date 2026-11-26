
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Trophy,
  Wallet,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const getLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultDates = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  return {
    fromDate: getLocalDate(sevenDaysAgo),
    toDate: getLocalDate(today),
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("vi-VN");
};

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="rounded-lg bg-orange-50 p-2">
          <Icon size={21} className="text-orange-600" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-800">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function StatisticsPage() {
  const [overview, setOverview] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  const [revenue, setRevenue] = useState([]);
  const [topDishes, setTopDishes] = useState([]);

  const [dates, setDates] = useState(getDefaultDates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    const response = await api.get("/statistics/overview");
    setOverview(response.data || {});
  }, []);

  const loadRevenue = useCallback(async () => {
    const response = await api.get("/statistics/revenue", {
      params: {
        fromDate: dates.fromDate,
        toDate: dates.toDate,
      },
    });

    setRevenue(Array.isArray(response.data) ? response.data : []);
  }, [dates.fromDate, dates.toDate]);

  const loadTopDishes = useCallback(async () => {
    const response = await api.get("/statistics/top-dishes", {
      params: { limit: 5 },
    });

    setTopDishes(Array.isArray(response.data) ? response.data : []);
  }, []);

  const loadAllData = useCallback(async () => {
    if (!dates.fromDate || !dates.toDate) return;

    if (dates.fromDate > dates.toDate) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadOverview(),
        loadRevenue(),
        loadTopDishes(),
      ]);
    } catch (err) {
      console.error("Lỗi tải dữ liệu thống kê:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải dữ liệu thống kê. Vui lòng kiểm tra kết nối Backend."
      );
    } finally {
      setLoading(false);
    }
  }, [dates, loadOverview, loadRevenue, loadTopDishes]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const maxRevenue = Math.max(
    ...revenue.map((item) => Number(item.revenue || 0)),
    1
  );

  const maxSold = Math.max(
    ...topDishes.map((item) => Number(item.totalSold || 0)),
    1
  );

  const handleDateChange = (field, value) => {
    setDates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Thống kê và báo cáo
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi tình hình kinh doanh và hiệu quả hoạt động nhà hàng
          </p>
        </div>

        <button
          onClick={loadAllData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Tổng đơn hàng"
          value={formatNumber(overview.totalOrders)}
          icon={ShoppingBag}
          description="Tổng số đơn hàng trong hệ thống"
        />

        <StatCard
          title="Đơn hàng hoàn thành"
          value={formatNumber(overview.completedOrders)}
          icon={CheckCircle2}
          description="Số đơn hàng đã hoàn tất"
        />

        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(overview.totalRevenue)}
          icon={Wallet}
          description="Doanh thu được ghi nhận từ hệ thống"
        />
      </div>

      {/* Revenue chart */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={21} className="text-orange-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Thống kê doanh thu
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Doanh thu theo từng ngày trong khoảng thời gian được chọn
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Từ ngày
              </label>
              <input
                type="date"
                value={dates.fromDate}
                onChange={(e) =>
                  handleDateChange("fromDate", e.target.value)
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Đến ngày
              </label>
              <input
                type="date"
                value={dates.toDate}
                onChange={(e) =>
                  handleDateChange("toDate", e.target.value)
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
            >
              Áp dụng
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Đang tải dữ liệu doanh thu...
          </div>
        ) : revenue.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            <CalendarDays size={32} className="mx-auto mb-2 text-gray-300" />
            Không có dữ liệu doanh thu trong khoảng thời gian này.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Số ngày có dữ liệu: {revenue.length}
              </span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(
                  revenue.reduce(
                    (sum, item) => sum + Number(item.revenue || 0),
                    0
                  )
                )}
              </span>
            </div>

            <div className="flex h-64 items-end gap-2 overflow-x-auto border-b border-l border-gray-200 px-2 pb-2 pt-5">
              {revenue.map((item, index) => {
                const amount = Number(item.revenue || 0);
                const height = Math.max(
                  (amount / maxRevenue) * 100,
                  amount > 0 ? 3 : 0
                );

                return (
                  <div
                    key={`${item.revenueDate}-${index}`}
                    className="group flex h-full min-w-12 flex-1 flex-col items-center justify-end"
                    title={`${formatDate(item.revenueDate)}: ${formatCurrency(amount)}`}
                  >
                    <span className="mb-2 hidden whitespace-nowrap text-xs text-gray-600 group-hover:block">
                      {formatCurrency(amount)}
                    </span>

                    <div
                      className="w-full max-w-12 rounded-t-md bg-orange-500 transition-all hover:bg-orange-600"
                      style={{ height: `${height}%` }}
                    />

                    <span className="mt-2 whitespace-nowrap text-[10px] text-gray-500 sm:text-xs">
                      {formatDate(item.revenueDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Top selling dishes */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Trophy size={21} className="text-orange-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Top 5 món ăn bán chạy
            </h2>
            <p className="text-sm text-gray-500">
              Xếp hạng theo tổng số lượng món đã bán
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Đang tải dữ liệu món ăn...
          </div>
        ) : topDishes.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Chưa có dữ liệu món ăn bán chạy.
          </div>
        ) : (
          <div className="space-y-5">
            {topDishes.map((dish, index) => {
              const sold = Number(dish.totalSold || 0);
              const width = (sold / maxSold) * 100;

              return (
                <div key={dish.dishId}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span className="truncate text-sm font-medium text-gray-800">
                        {dish.dishName}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-gray-700">
                      {formatNumber(sold)} món
                    </span>
                  </div>

                  <div className="ml-11 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <BarChart3 size={15} />
        Dữ liệu thống kê được lấy trực tiếp từ hệ thống quản lý nhà hàng.
      </div>
    </div>
  );
}
