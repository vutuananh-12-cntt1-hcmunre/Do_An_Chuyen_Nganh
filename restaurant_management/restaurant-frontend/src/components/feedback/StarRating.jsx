
import React from "react";

export default function StarRating({
    value = 0,
    onChange,
    disabled = false,
}) {
    return (
        <div className="feedback-stars" role="radiogroup" aria-label="Đánh giá">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`feedback-star ${
                        star <= value ? "active" : ""
                    }`}
                    onClick={() => onChange?.(star)}
                    disabled={disabled}
                    aria-label={`${star} sao`}
                    aria-checked={value === star}
                    role="radio"
                >
                    ★
                </button>
            ))}
            <span className="feedback-star-value">
                {value > 0 ? `${value}/5 sao` : "Chưa đánh giá"}
            </span>
        </div>
    );
}
