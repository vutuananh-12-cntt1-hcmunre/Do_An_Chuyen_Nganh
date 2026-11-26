
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  MinusCircle,
  ThumbsDown,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Star,
  Brain,
  Clock,
} from "lucide-react";
import api from "../../services/api";

const formatDate = (value) => {
  if (!value) return "Chưa có thông tin";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thông tin";

  return date.toLocaleString("vi-VN");
};

const formatConfidence = (value) => {
  if (value == null) return "—";

  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return `${(number <= 1 ? number * 100 : number).toFixed(1)}%`;
};

const formatSentiment = (sentiment) => {
  const config = {
    POSITIVE: {
      label: "Tích cực",
      className: "bg-green-100 text-green-700",
      icon: ThumbsUp,
    },
    NEUTRAL: {
      label: "Trung tính",
      className: "bg-yellow-100 text-yellow-700",
      icon: MinusCircle,
    },
    NEGATIVE: {
      label: "Tiêu cực",
      className: "bg-red-100 text-red-700",
      icon: ThumbsDown,
    },
  };

  return config[sentiment] || {
    label: "Chưa phân tích",
    className: "bg-gray-100 text-gray-600",
    icon: Brain,
  };
};

const formatStatus = (status) => {
  const config = {
    APPROVED: {
      label: "Đã duyệt",
      className: "bg-green-100 text-green-700",
    },
    HIDDEN: {
      label: "Đã ẩn",
      className: "bg-gray-100 text-gray-600",
    },
    PENDING: {
      label: "Chờ duyệt",
      className: "bg-orange-100 text-orange-700",
    },
  };

  return config[status] || {
    label: status || "Chưa xác định",
    className: "bg-gray-100 text-gray-600",
  };
};

const getErrorMessage = (err, fallback) => {
  const data = err.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.message ||
    data?.detail ||
    data?.error ||
    fallback
  );
};

export default function FeedbackManagementPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [statistics, setStatistics] = useState({
    totalFeedbacks: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
    unanalyzedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadFeedbacks = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      setError("");

      const params = {};

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      if (sentimentFilter !== "ALL") {
        params.sentiment = sentimentFilter;
      }

      const [feedbackResponse, statisticsResponse] = await Promise.all([
        api.get("/feedbacks", { params }),
        api.get("/feedbacks/statistics"),
      ]);

      setFeedbacks(
        Array.isArray(feedbackResponse.data)
          ? feedbackResponse.data
          : []
      );

      setStatistics({
        totalFeedbacks: statisticsResponse.data?.totalFeedbacks ?? 0,
        positiveCount: statisticsResponse.data?.positiveCount ?? 0,
        neutralCount: statisticsResponse.data?.neutralCount ?? 0,
        negativeCount: statisticsResponse.data?.negativeCount ?? 0,
        unanalyzedCount: statisticsResponse.data?.unanalyzedCount ?? 0,
      });
    } catch (err) {
      setError(
        getErrorMessage(err, "Không thể tải dữ liệu phản hồi khách hàng.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, sentimentFilter]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const filteredFeedbacks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return feedbacks;

    return feedbacks.filter((item) => {
      return (
        String(item.feedbackId ?? "").includes(keyword) ||
        String(item.userId ?? "").includes(keyword) ||
        String(item.orderId ?? "").includes(keyword) ||
        String(item.dishId ?? "").includes(keyword) ||
        item.content?.toLowerCase().includes(keyword) ||
        item.analysisResult?.toLowerCase().includes(keyword)
      );
    });
  }, [feedbacks, search]);

  const updateStatus = async (feedback, newStatus) => {
    const actionLabel =
      newStatus === "APPROVED" ? "duyệt" : "ẩn";

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${actionLabel} phản hồi #${feedback.feedbackId}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(feedback.feedbackId);
      setError("");

      await api.patch(`/feedbacks/${feedback.feedbackId}/status`, {
        feedbackStatus: newStatus,
      });

      await loadFeedbacks(false);

      if (selectedFeedback?.feedbackId === feedback.feedbackId) {
        setSelectedFeedback((previous) =>
          previous
            ? { ...previous, feedbackStatus: newStatus }
            : null
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Không thể cập nhật trạng thái phản hồi.")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetail = async (feedback) => {
    try {
      const response = await api.get(`/feedbacks/${feedback.feedbackId}`);
      setSelectedFeedback(response.data);
    } catch (err) {
      setError(
        getErrorMessage(err, "Không thể tải chi tiết phản hồi.")
      );
    }
  };

  const statCards = [
    {
      title: "Tổng phản hồi",
      value: statistics.totalFeedbacks,
      icon: MessageSquare,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Tích cực",
      value: statistics.positiveCount,
      icon: ThumbsUp,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Trung tính",
      value: statistics.neutralCount,
      icon: MinusCircle,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Tiêu cực",
      value: statistics.negativeCount,
      icon: ThumbsDown,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Chưa phân tích",
      value: statistics.unanalyzedCount,
      icon: AlertCircle,
      color: "bg-gray-100 text-gray-600",
    },
  ];

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Phản hồi khách hàng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý đánh giá và theo dõi phân tích cảm xúc bằng trí tuệ nhân tạo.
          </p>
        </div>

        <button
          onClick={() => loadFeedbacks(false)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-800">
                    {item.value}
                  </p>
                </div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTER */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm nội dung, mã phản hồi, mã đơn..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClass}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="HIDDEN">Đã ẩn</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={(event) => setSentimentFilter(event.target.value)}
            className={inputClass}
          >
            <option value="ALL">Tất cả cảm xúc AI</option>
            <option value="POSITIVE">Tích cực</option>
            <option value="NEUTRAL">Trung tính</option>
            <option value="NEGATIVE">Tiêu cực</option>
          </select>
        </div>
      </div>

      {/* FEEDBACK LIST */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-800">
            Danh sách phản hồi
          </h2>
          <span className="text-sm text-gray-500">
            {filteredFeedbacks.length} phản hồi
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Đang tải phản hồi...
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare
              size={36}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-gray-600">
              Không tìm thấy phản hồi
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredFeedbacks.map((feedback) => {
              const sentiment = formatSentiment(feedback.sentiment);
              const status = formatStatus(feedback.feedbackStatus);
              const SentimentIcon = sentiment.icon;
              const isUpdating = updatingId === feedback.feedbackId;

              return (
                <div
                  key={feedback.feedbackId}
                  className="p-5 transition hover:bg-gray-50/70"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-800">
                          Phản hồi #{feedback.feedbackId}
                        </span>

                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>

                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${sentiment.className}`}>
                          <SentimentIcon size={13} />
                          {sentiment.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                        <span>Khách hàng ID: {feedback.userId ?? "—"}</span>
                        <span>Đơn hàng: {feedback.orderId ?? "—"}</span>
                        <span>Món ăn ID: {feedback.dishId ?? "—"}</span>
                        <span>{formatDate(feedback.analyzedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={
                              index < Number(feedback.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                        <span className="ml-1 text-xs text-gray-500">
                          {feedback.rating ?? 0}/5
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                        {feedback.content || "Khách hàng không để lại nội dung."}
                      </p>

                      <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-3">
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-purple-800">
                          <Brain size={15} />
                          Phân tích AI
                          {feedback.confidenceScore != null && (
                            <span className="font-normal text-purple-600">
                              · Độ tin cậy {formatConfidence(feedback.confidenceScore)}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-700">
                          {feedback.analysisResult ||
                            "Chưa có kết quả phân tích nội dung."}
                        </p>

                        {feedback.modelName && (
                          <p className="mt-2 text-xs text-gray-500">
                            Mô hình: {feedback.modelName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-start gap-2 lg:flex-col">
                      <button
                        onClick={() => openDetail(feedback)}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        <Eye size={15} />
                        Chi tiết
                      </button>

                      {feedback.feedbackStatus !== "APPROVED" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus(feedback, "APPROVED")}
                          className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          <CheckCircle size={15} />
                          Duyệt
                        </button>
                      )}

                      {feedback.feedbackStatus !== "HIDDEN" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus(feedback, "HIDDEN")}
                          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <EyeOff size={15} />
                          Ẩn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Chi tiết phản hồi #{selectedFeedback.feedbackId}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Thông tin đánh giá và kết quả phân tích AI.
                </p>
              </div>

              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <InfoItem label="Khách hàng ID" value={selectedFeedback.userId} />
                <InfoItem label="Đơn hàng ID" value={selectedFeedback.orderId} />
                <InfoItem label="Món ăn ID" value={selectedFeedback.dishId} />
                <InfoItem label="Trạng thái" value={formatStatus(selectedFeedback.feedbackStatus).label} />
                <InfoItem label="Cảm xúc AI" value={formatSentiment(selectedFeedback.sentiment).label} />
                <InfoItem label="Độ tin cậy" value={formatConfidence(selectedFeedback.confidenceScore)} />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Đánh giá
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={20}
                      className={
                        index < Number(selectedFeedback.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedFeedback.rating ?? 0}/5
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Nội dung phản hồi
                </p>
                <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedFeedback.content || "Không có nội dung."}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-800">
                  <Brain size={17} />
                  Kết quả phân tích AI
                </p>
                <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
                  <p className="text-sm leading-6 text-gray-700">
                    {selectedFeedback.analysisResult ||
                      "Chưa có kết quả phân tích."}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p>Mô hình: {selectedFeedback.modelName || "—"}</p>
                    <p>
                      Độ tin cậy: {formatConfidence(selectedFeedback.confidenceScore)}
                    </p>
                    <p>
                      Phân tích lúc: {formatDate(selectedFeedback.analyzedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                {selectedFeedback.feedbackStatus !== "APPROVED" && (
                  <button
                    onClick={() => updateStatus(selectedFeedback, "APPROVED")}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <CheckCircle size={16} />
                    Duyệt phản hồi
                  </button>
                )}

                {selectedFeedback.feedbackStatus !== "HIDDEN" && (
                  <button
                    onClick={() => updateStatus(selectedFeedback, "HIDDEN")}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    <EyeOff size={16} />
                    Ẩn phản hồi
                  </button>
                )}

                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value ?? "—"}
      </p>
    </div>
  );
}
