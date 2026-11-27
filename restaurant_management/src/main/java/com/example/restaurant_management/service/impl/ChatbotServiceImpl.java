package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.ChatResponse;
import com.example.restaurant_management.dto.ChatbotMessageResponse;
import com.example.restaurant_management.dto.Dish;
import com.example.restaurant_management.dto.PopularDish;
import com.example.restaurant_management.dto.Promotion;
import com.example.restaurant_management.dto.ReservationRequest;
import com.example.restaurant_management.dto.ReservationResponse;
import com.example.restaurant_management.dto.Table;
import com.example.restaurant_management.repository.ChatMessageRepository;
import com.example.restaurant_management.repository.ChatSessionRepository;
import com.example.restaurant_management.repository.DishRepository;
import com.example.restaurant_management.repository.FeedbackRepository;
import com.example.restaurant_management.repository.PromotionRepository;
import com.example.restaurant_management.repository.TableRepository;
import com.example.restaurant_management.service.ChatbotService;
import com.example.restaurant_management.service.ChatbotServiceClient;
import com.example.restaurant_management.service.ReservationService;

@Service
public class ChatbotServiceImpl implements ChatbotService {

    private static final Logger logger =
            LoggerFactory.getLogger(ChatbotServiceImpl.class);

    private static final ZoneId VIETNAM_ZONE =
            ZoneId.of("Asia/Ho_Chi_Minh");

    private final ChatbotServiceClient chatbotServiceClient;
    private final DishRepository dishRepository;
    private final PromotionRepository promotionRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final FeedbackRepository feedbackRepository;
    private final TableRepository tableRepository;
    private final ReservationService reservationService;

    public ChatbotServiceImpl(
            ChatbotServiceClient chatbotServiceClient,
            DishRepository dishRepository,
            PromotionRepository promotionRepository,
            ChatSessionRepository chatSessionRepository,
            ChatMessageRepository chatMessageRepository,
            FeedbackRepository feedbackRepository,
            TableRepository tableRepository,
            ReservationService reservationService) {

        this.chatbotServiceClient = chatbotServiceClient;
        this.dishRepository = dishRepository;
        this.promotionRepository = promotionRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.feedbackRepository = feedbackRepository;
        this.tableRepository = tableRepository;
        this.reservationService = reservationService;
    }

    @Override
    public ChatbotMessageResponse processMessage(
            String username,
            String message) {

        Integer userId =
                feedbackRepository.findUserIdByUsername(username);

        Integer sessionId =
                chatSessionRepository.findActiveSession(userId);

        if (sessionId == null) {
            sessionId = chatSessionRepository.createSession(userId);
        }

        chatMessageRepository.insertMessage(
                sessionId,
                "USER",
                message
        );

        String botMessage;

        try {
            List<ChatMessageRepository.ChatMessage> history =
                    chatMessageRepository.findBySessionId(sessionId);

            botMessage = generateReply(message, history);

        } catch (RestClientException e) {

            logger.error(
                    "Không thể kết nối AI Service: {}",
                    e.getMessage(),
                    e
            );

            botMessage =
                    "Xin lỗi, hiện tại trợ lý ảo đang gặp sự cố. "
                    + "Bạn vui lòng thử lại sau.";

        } catch (RuntimeException e) {

            logger.error(
                    "Lỗi xử lý chatbot: {}",
                    e.getMessage(),
                    e
            );

            botMessage =
                    "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu. "
                    + "Bạn vui lòng thử lại.";
        }

        chatMessageRepository.insertMessage(
                sessionId,
                "BOT",
                botMessage
        );

        return new ChatbotMessageResponse(
                sessionId,
                botMessage
        );
    }

    private Integer validateSessionOwnership(
            String username,
            Integer sessionId) {

        Integer userId =
                feedbackRepository.findUserIdByUsername(username);

        if (userId == null
                || !chatSessionRepository.isSessionOwnedByUser(
                        sessionId,
                        userId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy phiên trò chuyện."
            );
        }

        return userId;
    }

    @Override
    public List<ChatMessageRepository.ChatMessage> getChatHistory(
            String username,
            Integer sessionId) {

        validateSessionOwnership(username, sessionId);

        return chatMessageRepository.findBySessionId(sessionId);
    }

    @Override
    public void closeChatSession(
            String username,
            Integer sessionId) {

        validateSessionOwnership(username, sessionId);

        chatSessionRepository.closeSession(sessionId);
    }

    private String generateReply(
            String message,
            List<ChatMessageRepository.ChatMessage> history) {

        String previousBotMessage =
                getLatestBotMessage(history);

        boolean reservationContext =
                isReservationContext(previousBotMessage);

        boolean confirmationPrompt =
                isConfirmationPrompt(previousBotMessage);

        logger.info("===== CHATBOT DEBUG =====");
        logger.info("Original message: {}", message);
        logger.info("Previous bot message: {}", previousBotMessage);
        logger.info("Reservation context: {}", reservationContext);
        logger.info("Confirmation prompt: {}", confirmationPrompt);

        if (confirmationPrompt) {

            if (isAffirmative(message)) {

                String analysisMessage =
                        combineRecentUserMessages(history);

                logger.info(
                        "Confirmation analysis message: {}",
                        analysisMessage
                );

                ChatResponse response =
                        chatbotServiceClient.processMessage(
                                analysisMessage
                        );

                if (response == null || response.data() == null) {
                    return "Xin lỗi, tôi chưa thể xử lý yêu cầu đặt bàn.";
                }

                return confirmReservation(response.data());
            }

            if (isNegative(message)) {

                return "Tôi đã hủy yêu cầu đặt bàn. "
                        + "Nếu muốn đặt bàn lại, bạn hãy cho tôi biết nhé.";
            }

            return "Bạn vui lòng trả lời Có để xác nhận "
                    + "hoặc Không để hủy yêu cầu đặt bàn nhé.";
        }

        String analysisMessage = reservationContext
                ? combineRecentUserMessages(history)
                : message;

        logger.info("Analysis message: {}", analysisMessage);

        ChatResponse response =
                chatbotServiceClient.processMessage(analysisMessage);

        if (response == null || response.data() == null) {
            return "Xin lỗi, hiện tại tôi chưa thể xử lý câu hỏi.";
        }

        ChatResponse.ChatData data = response.data();

        logger.info("Detected intent: {}", data.intent());
        logger.info("Extracted entities: {}", data.entities());

        if (data.intent() == null) {
            return "Xin lỗi, tôi chưa hiểu câu hỏi của bạn.";
        }

        if (reservationContext
                || "RESERVE_TABLE".equals(data.intent())) {

            return handleReservation(data);
        }

        return switch (data.intent()) {

            case "GREETING" ->
                "Xin chào! Mình là trợ lý Bếp Mận & Lửa. "
                + "Bạn có thể hỏi món có gì, lọc theo giá, "
                + "món bán chạy, khuyến mãi hoặc đặt bàn nhé.";

            case "FIND_DISH" ->
                findDish(data.entities());

            case "FILTER_DISH" ->
                filterDish(data.entities());

            case "FIND_PROMOTION" ->
                findPromotion();

            case "POPULAR_DISH" ->
                findPopularDishes();

            default ->
                "Mình chưa nắm rõ ý bạn. Bạn có thể hỏi: "
                + "\"có món gì\", \"món dưới 50k\", "
                + "\"món bán chạy\", \"khuyến mãi\" hoặc \"đặt bàn\".";
        };
    }

    private String getLatestBotMessage(
            List<ChatMessageRepository.ChatMessage> history) {

        for (int i = history.size() - 1; i >= 0; i--) {

            ChatMessageRepository.ChatMessage item = history.get(i);

            if ("BOT".equalsIgnoreCase(item.senderType())) {
                return item.messageContent();
            }
        }

        return null;
    }

    private boolean isReservationContext(String previousBotMessage) {

        if (previousBotMessage == null) {
            return false;
        }

        String content =
                previousBotMessage.toLowerCase(Locale.ROOT);

        if (isReservationFinishedMessage(content)) {
            return false;
        }

        return isReservationPromptMessage(content);
    }

    private boolean isConfirmationPrompt(String previousBotMessage) {

        if (previousBotMessage == null) {
            return false;
        }

        String content =
                previousBotMessage.toLowerCase(Locale.ROOT);

        return content.contains("xác nhận đặt bàn")
                && (content.contains("có")
                || content.contains("không"));
    }

    private boolean isReservationFinishedMessage(String content) {

        return content.contains("đặt bàn thành công")
                || content.contains("đã hủy yêu cầu đặt bàn");
    }

    private boolean isReservationPromptMessage(String content) {

        return content.contains("đặt bàn")
                && (
                    content.contains("người")
                    || content.contains("thời gian")
                    || content.contains("ngày")
                    || content.contains("mấy giờ")
                    || content.contains("xác nhận")
                    || content.contains("không còn bàn phù hợp")
                );
    }

    private String combineRecentUserMessages(
            List<ChatMessageRepository.ChatMessage> history) {

        int startIndex = 0;

        for (int i = history.size() - 1; i >= 0; i--) {

            ChatMessageRepository.ChatMessage item = history.get(i);

            if (!"BOT".equalsIgnoreCase(item.senderType())) {
                continue;
            }

            String content =
                    item.messageContent().toLowerCase(Locale.ROOT);

            boolean finished =
                    isReservationFinishedMessage(content);

            boolean reservationPrompt =
                    isReservationPromptMessage(content);

            if (finished || !reservationPrompt) {
                startIndex = i + 1;
                break;
            }
        }

        StringBuilder combined = new StringBuilder();

        for (int i = startIndex; i < history.size(); i++) {

            ChatMessageRepository.ChatMessage item = history.get(i);

            if ("USER".equalsIgnoreCase(item.senderType())) {

                if (combined.length() > 0) {
                    combined.append(". ");
                }

                combined.append(item.messageContent());
            }
        }

        return combined.toString();
    }

    private boolean isAffirmative(String message) {

        String text = message.trim().toLowerCase(Locale.ROOT);

        return text.equals("có")
                || text.equals("có.")
                || text.equals("có,")
                || text.startsWith("có, ")
                || text.equals("đồng ý")
                || text.equals("xác nhận")
                || text.equals("ok")
                || text.equals("okay")
                || text.equals("được")
                || text.equals("chốt")
                || text.equals("tôi đồng ý");
    }

    private boolean isNegative(String message) {

        String text = message.trim().toLowerCase(Locale.ROOT);

        return text.equals("không")
                || text.equals("không.")
                || text.equals("không đặt")
                || text.equals("hủy")
                || text.equals("huỷ")
                || text.equals("thôi")
                || text.equals("không cần")
                || text.equals("từ chối");
    }

    private String handleReservation(ChatResponse.ChatData data) {

        ChatResponse.ChatEntities entities = data.entities();

        if (entities == null) {
            return "Bạn vui lòng cho biết số lượng khách, ngày "
                    + "và giờ muốn đặt bàn nhé.";
        }

        Integer guestCount = entities.guest_count();

        if (guestCount == null || guestCount <= 0) {
            return "Bạn muốn đặt bàn cho bao nhiêu người?";
        }

        LocalDateTime reservationTime =
                extractReservationDateTime(entities);

        if (reservationTime == null) {

            if (entities.reservation_date() == null) {
                return "Bạn muốn đặt bàn vào ngày nào?";
            }

            if (entities.reservation_time() == null) {
                return "Bạn muốn đặt bàn lúc mấy giờ?";
            }

            return "Tôi chưa xác định được thời gian đặt bàn. "
                    + "Bạn vui lòng nhập lại ngày và giờ nhé.";
        }

        LocalDateTime now =
                LocalDateTime.now(VIETNAM_ZONE);

        if (!reservationTime.isAfter(now)) {
            return "Thời gian đặt bàn phải ở tương lai. "
                    + "Bạn vui lòng chọn ngày và giờ khác nhé.";
        }

        LocalDateTime reservationEndTime =
                reservationTime.plusHours(2);

        List<Table> availableTables =
                tableRepository.findAvailableTables(
                        guestCount,
                        reservationTime,
                        reservationEndTime
                );

        if (availableTables == null || availableTables.isEmpty()) {
            return "Rất tiếc, hiện tại nhà hàng không còn bàn phù hợp "
                    + "cho " + guestCount + " người vào thời gian bạn chọn. "
                    + "Bạn vui lòng chọn thời gian khác nhé.";
        }

        Table suggestedTable = availableTables.get(0);

        return "Nhà hàng hiện có bàn phù hợp với yêu cầu của bạn:\n"
                + "- Bàn: " + suggestedTable.getTableCode() + "\n"
                + "- Sức chứa: " + suggestedTable.getCapacity() + " người\n"
                + "- Số khách: " + guestCount + " người\n"
                + "- Thời gian: " + reservationTime + "\n"
                + "- Thời lượng dự kiến: 2 giờ\n\n"
                + "Bạn xác nhận đặt bàn vào thời gian trên chứ? "
                + "Vui lòng trả lời Có hoặc Không.";
    }

    private LocalDateTime extractReservationDateTime(
            ChatResponse.ChatEntities entities) {

        try {

            if (entities.reservation_datetime() != null
                    && !entities.reservation_datetime().isBlank()) {

                return LocalDateTime.parse(
                        entities.reservation_datetime()
                );
            }

            if (entities.reservation_date() == null
                    || entities.reservation_time() == null) {
                return null;
            }

            LocalDate date =
                    LocalDate.parse(entities.reservation_date());

            LocalTime time =
                    LocalTime.parse(entities.reservation_time());

            return LocalDateTime.of(date, time);

        } catch (DateTimeParseException e) {

            logger.warn(
                    "Không thể phân tích ngày giờ đặt bàn: {}",
                    e.getMessage()
            );

            return null;
        }
    }

    private String confirmReservation(ChatResponse.ChatData data) {

        ChatResponse.ChatEntities entities = data.entities();

        if (entities == null
                || entities.guest_count() == null
                || entities.guest_count() <= 0) {

            return "Tôi chưa đủ thông tin để tạo đặt bàn. "
                    + "Bạn vui lòng thực hiện lại yêu cầu nhé.";
        }

        LocalDateTime reservationTime =
                extractReservationDateTime(entities);

        if (reservationTime == null) {
            return "Tôi chưa xác định được ngày giờ đặt bàn. "
                    + "Bạn vui lòng thực hiện lại yêu cầu nhé.";
        }

        if (!reservationTime.isAfter(
                LocalDateTime.now(VIETNAM_ZONE))) {

            return "Thời gian đặt bàn đã qua. "
                    + "Bạn vui lòng chọn thời gian khác nhé.";
        }

        LocalDateTime reservationEndTime =
                reservationTime.plusHours(2);

        List<Table> availableTables =
                tableRepository.findAvailableTables(
                        entities.guest_count(),
                        reservationTime,
                        reservationEndTime
                );

        if (availableTables == null || availableTables.isEmpty()) {
            return "Rất tiếc, bàn vừa được khách khác đặt trước. "
                    + "Bạn vui lòng chọn thời gian khác nhé.";
        }

        Table selectedTable = availableTables.get(0);

        ReservationRequest request = new ReservationRequest();

        request.setTableId(selectedTable.getTableId());
        request.setReservationTime(reservationTime);
        request.setReservationEndTime(reservationEndTime);
        request.setGuestCount(entities.guest_count());
        request.setCustomerNote("Đặt bàn qua trợ lý ảo");

        Integer reservationId =
                reservationService.createReservation(request);

        ReservationResponse reservation =
                reservationService.getReservationById(reservationId);

        if (reservation == null) {
            logger.error(
                    "Không tìm thấy đặt bàn vừa tạo với ID: {}",
                    reservationId
            );

            return "Đặt bàn đã được tạo nhưng không thể lấy thông tin chi tiết. "
                    + "Bạn vui lòng liên hệ nhân viên nhà hàng.";
        }

        String status;

        if ("PENDING".equalsIgnoreCase(
                reservation.getReservationStatus())) {

            status = "Chờ xác nhận";

        } else if ("CONFIRMED".equalsIgnoreCase(
                reservation.getReservationStatus())) {

            status = "Đã xác nhận";

        } else if ("CANCELLED".equalsIgnoreCase(
                reservation.getReservationStatus())) {

            status = "Đã hủy";

        } else {
            status = reservation.getReservationStatus();
        }

        return "Đặt bàn thành công!\n"
                + "- Mã đặt bàn: " + reservation.getReservationCode() + "\n"
                + "- Bàn: " + selectedTable.getTableCode() + "\n"
                + "- Số khách: " + reservation.getGuestCount() + " người\n"
                + "- Thời gian: " + reservation.getReservationTime()
                + " - " + reservation.getReservationEndTime() + "\n"
                + "- Trạng thái: " + status + "\n\n"
                + "Cảm ơn bạn đã đặt bàn tại nhà hàng!";
    }

    /**
     * FIND_DISH:
     * - Có dish_name → tìm theo tên
     * - Không có → gợi ý vài món đang bán (không hỏi ngược "Bạn muốn tìm món nào?")
     */
    private String findDish(ChatResponse.ChatEntities entities) {

        String dishName = entities != null ? entities.dish_name() : null;

        if (dishName == null || dishName.isBlank()) {

            List<Dish> all = dishRepository.findAll();

            List<Dish> available = all == null
                    ? List.of()
                    : all.stream()
                            .filter(d -> Boolean.TRUE.equals(d.getIsAvailable()))
                            .collect(Collectors.toList());

            if (available.isEmpty()) {
                // fallback: lấy tất cả nếu không lọc được isAvailable
                available = all == null ? List.of() : all;
            }

            if (available.isEmpty()) {
                return "Hiện thực đơn đang cập nhật. "
                        + "Bạn quay lại sau hoặc hỏi nhân viên nhé. "
                        + "Hoặc thử: \"món bán chạy\", \"món dưới 50k\".";
            }

            StringBuilder result = new StringBuilder(
                    "Bên mình có nhiều món trên thực đơn. Gợi ý một số món đang phục vụ:\n"
            );

            int limit = Math.min(6, available.size());
            for (int i = 0; i < limit; i++) {
                Dish dish = available.get(i);
                result.append("- ")
                        .append(dish.getDishName())
                        .append(": ")
                        .append(dish.getCurrentPrice())
                        .append(" đồng\n");
            }

            result.append("\nBạn muốn xem món cụ thể (vd phở, cơm tấm), "
                    + "lọc theo giá (\"món dưới 50k\"), hay món bán chạy?");

            return result.toString();
        }

        List<Dish> dishes =
                dishRepository.searchByName(dishName);

        if (dishes == null || dishes.isEmpty()) {
            return "Nhà hàng hiện chưa tìm thấy món \""
                    + dishName
                    + "\". Bạn thử tên khác, hỏi \"có món gì\", "
                    + "hoặc \"món bán chạy\" nhé.";
        }

        StringBuilder result = new StringBuilder(
                "Đây là những món phù hợp:\n"
        );

        for (Dish dish : dishes) {

            result.append("- ")
                    .append(dish.getDishName())
                    .append(": ")
                    .append(dish.getCurrentPrice())
                    .append(" đồng\n");
        }

        return result.toString();
    }

    private String filterDish(ChatResponse.ChatEntities entities) {

        if (entities == null) {
            return "Bạn vui lòng cho biết tên món hoặc mức giá muốn tìm "
                    + "(vd: món dưới 50 nghìn).";
        }

        Integer min = entities.price_min();
        Integer max = entities.price_max();
        String dishName = entities.dish_name();

        if (min == null
                && max == null
                && (dishName == null || dishName.isBlank())) {

            return "Bạn muốn lọc theo khoảng giá nào? "
                    + "Ví dụ: \"món dưới 50k\" hoặc \"từ 30k đến 80k\".";
        }

        BigDecimal minPrice = min == null
                ? null
                : BigDecimal.valueOf(min);

        BigDecimal maxPrice = max == null
                ? null
                : BigDecimal.valueOf(max);

        List<Dish> dishes =
                dishRepository.findByPriceRange(
                        minPrice,
                        maxPrice,
                        dishName
                );

        if (dishes == null || dishes.isEmpty()) {
            return "Không tìm thấy món phù hợp với điều kiện của bạn. "
                    + "Thử nới khoảng giá hoặc hỏi \"có món gì\" nhé.";
        }

        StringBuilder result = new StringBuilder(
                "Các món phù hợp với yêu cầu của bạn:\n"
        );

        int limit = Math.min(10, dishes.size());
        for (int i = 0; i < limit; i++) {
            Dish dish = dishes.get(i);
            result.append("- ")
                    .append(dish.getDishName())
                    .append(": ")
                    .append(dish.getCurrentPrice())
                    .append(" đồng\n");
        }

        if (dishes.size() > limit) {
            result.append("... và ")
                    .append(dishes.size() - limit)
                    .append(" món khác trên thực đơn.");
        }

        return result.toString();
    }

    private String findPromotion() {

        List<Promotion> promotions =
                promotionRepository.findCurrentlyAvailable();

        if (promotions == null || promotions.isEmpty()) {
            return "Hiện tại nhà hàng chưa có chương trình khuyến mãi nào. "
                    + "Bạn có thể xem món bán chạy hoặc hỏi món theo giá nhé.";
        }

        StringBuilder result = new StringBuilder(
                "Các chương trình khuyến mãi hiện tại:\n"
        );

        for (Promotion promotion : promotions) {

            result.append("- ")
                    .append(promotion.getPromotionName())
                    .append(" (Mã: ")
                    .append(promotion.getPromotionCode())
                    .append(")\n");
        }

        return result.toString();
    }

    private String findPopularDishes() {

        List<PopularDish> dishes =
                dishRepository.findTopSellingDishes();

        if (dishes == null || dishes.isEmpty()) {
            return "Hiện tại chưa có dữ liệu món bán chạy. "
                    + "Bạn thử hỏi \"có món gì\" để xem gợi ý thực đơn nhé.";
        }

        StringBuilder result = new StringBuilder(
                "Top món bán chạy tại nhà hàng:\n"
        );

        int rank = 1;

        for (PopularDish dish : dishes) {

            result.append(rank++)
                    .append(". ")
                    .append(dish.dishName())
                    .append(" - Đã bán: ")
                    .append(dish.totalSold())
                    .append(" phần\n");
        }

        return result.toString();
    }
}
