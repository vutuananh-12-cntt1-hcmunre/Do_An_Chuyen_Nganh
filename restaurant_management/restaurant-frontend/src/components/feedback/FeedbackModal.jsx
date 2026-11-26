
import React, { useEffect, useState } from "react";
import feedbackService from "../../services/feedbackService";
import StarRating from "./StarRating";
import "./FeedbackModal.css";

export default function FeedbackModal({
    orderId,
    orderItems = [],
    onClose,
    onSubmitted,
}) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [overallRating, setOverallRating] = useState(0);
    const [overallContent, setOverallContent] = useState("");

    const [dishRatings, setDishRatings] = useState({});
    const [dishContents, setDishContents] = useState({});

    useEffect(() => {
        loadFeedbacks();
    }, [orderId]);

    const loadFeedbacks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await feedbackService.getByOrder(orderId);
            setFeedbacks(response.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể tải đánh giá của đơn hàng."
            );
        } finally {
            setLoading(false);
        }
    };

    const overallFeedback = feedbacks.find(
        (item) => item.dishId == null
    );

    const getDishFeedback = (dishId) => {
        return feedbacks.find(
            (item) => Number(item.dishId) === Number(dishId)
        );
    };

    const handleOverallSubmit = async () => {
        if (overallRating < 1 || overallRating > 5) {
            setError("Vui lòng chọn số sao cho đơn hàng.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            await feedbackService.create({
                orderId,
                dishId: null,
                rating: overallRating,
                content: overallContent.trim() || null,
            });

            await loadFeedbacks();
            onSubmitted?.();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể gửi đánh giá đơn hàng."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDishSubmit = async (dishId) => {
        const rating = dishRatings[dishId];

        if (!rating || rating < 1 || rating > 5) {
            setError("Vui lòng chọn số sao cho món ăn.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            await feedbackService.create({
                orderId,
                dishId,
                rating,
                content: dishContents[dishId]?.trim() || null,
            });

            await loadFeedbacks();
            onSubmitted?.();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể gửi đánh giá món ăn."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="feedback-overlay">
                <div className="feedback-modal">
                    <div className="feedback-header">
                        <h2>Đánh giá đơn hàng</h2>
                        <button
                            type="button"
                            className="feedback-close"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    <div className="feedback-loading">
                        Đang tải thông tin đánh giá...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="feedback-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div
                className="feedback-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-title"
            >
                {/* Header */}
                <div className="feedback-header">
                    <div>
                        <h2 id="feedback-title">Đánh giá đơn hàng</h2>
                        <p>Đơn hàng #{orderId}</p>
                    </div>

                    <button
                        type="button"
                        className="feedback-close"
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                {/* Nội dung */}
                <div className="feedback-content">
                    {error && (
                        <div className="feedback-error">
                            {error}
                        </div>
                    )}

                    {/* Đánh giá tổng thể */}
                    <section className="feedback-section">
                        <div className="feedback-section-heading">
                            <h3>Đánh giá tổng thể đơn hàng</h3>
                            <p>Chia sẻ cảm nhận của bạn về trải nghiệm đặt hàng.</p>
                        </div>

                        {overallFeedback ? (
                            <div className="feedback-completed">
                                <StarRating
                                    value={overallFeedback.rating}
                                    disabled
                                />

                                <p>
                                    {overallFeedback.content ||
                                        "Bạn không để lại nhận xét."}
                                </p>

                                <span>✓ Đã gửi đánh giá</span>
                            </div>
                        ) : (
                            <div className="feedback-form">
                                <StarRating
                                    value={overallRating}
                                    onChange={setOverallRating}
                                    disabled={submitting}
                                />

                                <textarea
                                    className="feedback-textarea"
                                    value={overallContent}
                                    onChange={(event) =>
                                        setOverallContent(event.target.value)
                                    }
                                    placeholder="Chia sẻ cảm nhận của bạn về đơn hàng..."
                                    maxLength={1000}
                                    disabled={submitting}
                                />

                                <div className="feedback-form-footer">
                                    <small>
                                        {overallContent.length}/1000 ký tự
                                    </small>

                                    <button
                                        type="button"
                                        className="feedback-submit"
                                        onClick={handleOverallSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Đánh giá từng món */}
                    <section className="feedback-section">
                        <div className="feedback-section-heading">
                            <h3>Đánh giá từng món ăn</h3>
                            <p>Đánh giá chất lượng từng món trong đơn hàng.</p>
                        </div>

                        {orderItems.length === 0 ? (
                            <p className="feedback-empty">
                                Không có thông tin món ăn trong đơn hàng.
                            </p>
                        ) : (
                            <div className="feedback-dish-list">
                                {orderItems.map((dish) => {
                                    const existing = getDishFeedback(dish.dishId);

                                    return (
                                        <div
                                            className="feedback-dish"
                                            key={dish.dishId}
                                        >
                                            <h4>{dish.dishName}</h4>

                                            {existing ? (
                                                <div className="feedback-completed">
                                                    <StarRating
                                                        value={existing.rating}
                                                        disabled
                                                    />

                                                    <p>
                                                        {existing.content ||
                                                            "Bạn không để lại nhận xét."}
                                                    </p>

                                                    <span>✓ Đã đánh giá món ăn</span>
                                                </div>
                                            ) : (
                                                <div className="feedback-form">
                                                    <StarRating
                                                        value={
                                                            dishRatings[dish.dishId] || 0
                                                        }
                                                        onChange={(rating) =>
                                                            setDishRatings((previous) => ({
                                                                ...previous,
                                                                [dish.dishId]: rating,
                                                            }))
                                                        }
                                                        disabled={submitting}
                                                    />

                                                    <textarea
                                                        className="feedback-textarea"
                                                        value={
                                                            dishContents[dish.dishId] || ""
                                                        }
                                                        onChange={(event) =>
                                                            setDishContents((previous) => ({
                                                                ...previous,
                                                                [dish.dishId]:
                                                                    event.target.value,
                                                            }))
                                                        }
                                                        placeholder="Nhận xét về món ăn..."
                                                        maxLength={1000}
                                                        disabled={submitting}
                                                    />

                                                    <div className="feedback-form-footer">
                                                        <small>
                                                            {(dishContents[dish.dishId] || "")
                                                                .length}/1000 ký tự
                                                        </small>

                                                        <button
                                                            type="button"
                                                            className="feedback-submit"
                                                            onClick={() =>
                                                                handleDishSubmit(dish.dishId)
                                                            }
                                                            disabled={submitting}
                                                        >
                                                            {submitting
                                                                ? "Đang gửi..."
                                                                : "Gửi đánh giá"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <div className="feedback-bottom">
                    <button
                        type="button"
                        className="feedback-cancel"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
