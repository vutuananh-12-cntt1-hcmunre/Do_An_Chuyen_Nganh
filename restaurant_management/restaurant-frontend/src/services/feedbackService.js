
import api from "./api";

const feedbackService = {
    // Lấy danh sách đánh giá của một đơn hàng
    getByOrder(orderId) {
        return api.get(`/feedbacks/order/${orderId}`);
    },

    // Tạo đánh giá tổng thể hoặc đánh giá món ăn
    create(data) {
        return api.post("/feedbacks", data);
    },
};

export default feedbackService;
