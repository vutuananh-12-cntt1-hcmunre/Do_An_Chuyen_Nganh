# 🍲 RESTAURANT MANAGEMENT SYSTEM WITH REAL-TIME & AI INTEGRATION

> Hệ thống quản lý và vận hành nhà hàng thông minh, tích hợp đặt món/đặt bàn trực tuyến, tương tác thời gian thực và xử lý ngôn ngữ tự nhiên (AI NLP).

---

## 📋 MỤC LỤC
- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Kiến trúc & Công nghệ sử dụng](#-kiến-trúc--công-nghệ-sử-dụng)
- [Tính năng hệ thống](#-tính-năng-hệ-thống)
  - [1. Quản lý tài khoản & Xác thực](#1-quản-lý-tài-khoản--xác-thực-authentication--user-management)
  - [2. Giao diện khách hàng (Customer Frontend)](#2-giao-diện-khách-hàng-customer-interface---frontend-react)
  - [3. Vận hành & Quản trị (Admin & Management)](#3-vận-hành--quản-trị-admin--management)
  - [4. Tương tác Realtime & Tích hợp AI](#4-tương-tác-thời-gian-thực--trí-tuệ-nhân-tạo-realtime--ai-integration)
- [Yêu cầu phi chức năng & Tối ưu](#-yêu-cầu-phi-chức-năng--tối-ưu-hệ-thống-non-functional)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Giấy phép](#-giấy-phép)

---

## 🌟 TỔNG QUAN DỰ ÁN

Hệ thống được phát triển nhằm tối ưu hóa quy trình trải nghiệm của khách hàng và hỗ trợ ban quản lý vận hành nhà hàng một cách hiệu quả. Dự án kết hợp giữa mô hình Web ứng dụng hiện đại, truyền tải dữ liệu thời gian thực và áp dụng **Trí tuệ nhân tạo (AI)** để tư vấn tự động cũng như phân tích phản hồi khách hàng.

---

## 🛠️ KIẾN TRÚC & CÔNG NGHỆ SỬ DỤNG

- **Backend:** Java, Spring Boot, Spring Security, JWT
- **Frontend:** React.js, HTML5/CSS3, JavaScript (ES6+)
- **Database:** PostgreSQL
- **Realtime:** WebSocket / Socket.io
- **AI & NLP:** Python (Sentiment Analysis, Aspect-Based Sentiment Analysis, Chatbot Model)
- **Tối ưu:** Caching, Asynchronous Processing (Xử lý bất đồng bộ)

---

## ✨ TÍNH NĂNG HỆ THỐNG

### 1. Quản lý tài khoản & Xác thực (Authentication & User Management)
Mã hóa bảo mật và quản lý hồ sơ người dùng đa vai trò:

- **1.1. Đăng ký Tài khoản (Register):** Cho phép khách hàng mới tạo tài khoản qua Email/Số điện thoại; tự động kiểm tra tính trùng lặp trước khi lưu.
- **1.2. Đăng nhập Hệ thống (Login):** Cấp mã xác thực an toàn bằng **Spring Security & JWT** cho Khách hàng, Nhân viên và Quản lý.
- **1.3. Quên Mật khẩu (Forgot Password):** Khôi phục tài khoản qua mã OTP hoặc link reset mật khẩu gửi tới Email.
- **1.4. Thay đổi Mật khẩu (Change Password):** Xác thực mật khẩu cũ và cập nhật mật khẩu mới khi đã đăng nhập.
- **1.5. Cập nhật Thông tin Cá nhân (Update Profile):** Chỉnh sửa họ tên, số điện thoại, địa chỉ giao hàng và ảnh đại diện.
- **1.6. Bảo mật Tài khoản (Account Security):** Mã hóa mật khẩu bằng **BCrypt**, tự động hủy Token khi hết hạn và phòng ngừa các nguy cơ tấn công mạng.
- **1.7. Quản lý Phân quyền (Role-based Access Control):** Phân chia vai trò rõ ràng (`ROLE_CUSTOMER`, `ROLE_STAFF`, `ROLE_ADMIN`) với phân quyền tính năng tương ứng.

---

### 2. Giao diện khách hàng (Customer Interface - Frontend React)
Trải nghiệm tra cứu và sử dụng dịch vụ trực tuyến dành cho người dùng:

- **2.1. Trang chủ (Homepage):** Banner khuyến mãi, giới thiệu thương hiệu, món ăn nổi bật/bán chạy và lối tắt tiện ích.
- **2.2. Danh mục Món ăn (Menu / Categories):** Hiển thị thực đơn phân loại (Khai vị, Món chính, Tráng miệng, Đồ uống) kèm giá, hình ảnh và mô tả.
- **2.3. Tìm kiếm Món ăn (Search Dishes):** Tìm kiếm nhanh theo tên/từ khóa hoặc lọc theo khoảng giá và danh mục.
- **2.4. Đặt bàn Trực tuyến (Online Reservation):** Đặt trước ngày, giờ, số lượng khách và ghi chú yêu cầu đặc biệt (tiệc sinh nhật, vị trí ngồi).
- **2.5. Đặt hàng Trực tuyến (Online Ordering / Cart):** Quản lý giỏ hàng (thêm/sửa/xóa), chọn giao tận nơi hoặc đặt món ăn trước khi đến bàn.
- **2.6. Thanh toán Trực tuyến (Online Payment):** Tích hợp thanh toán an toàn qua cổng điện tử (**VNPAY, Momo, Ngân hàng**).
- **2.7. Quản lý Đơn hàng (Order History & Tracking):** Theo dõi lịch sử và trạng thái đơn hàng theo thời gian thực (*Tiếp nhận $\rightarrow$ Chế biến $\rightarrow$ Đang giao / Đã hoàn thành*).

---

### 3. Vận hành & Quản trị (Admin & Management)
Công cụ hỗ trợ quản lý và nhân viên vận hành hoạt động kinh doanh hàng ngày:

- **3.1. Quản lý Bàn ăn (Table Management):** Quản lý sơ đồ bàn, cập nhật trạng thái bàn thời gian thực (*Bàn trống, Bàn đã đặt, Bàn đang có khách*) và xếp bàn cho lịch hẹn.
- **3.2. Quản lý Hệ thống & Thực đơn (System & Menu Management):** Cập nhật thực đơn, danh mục, điều chỉnh giá bán, bật/tắt trạng thái còn/hết hàng.
- **3.3. Quản lý Khuyến mãi & Hóa đơn (Promotions & Invoices):** Thiết lập mã giảm giá, chương trình ưu đãi và xuất hóa đơn thanh toán cho khách hàng.
- **3.4. Quản lý Kho & Báo cáo Thống kê (Inventory & Analytics):** Theo dõi tồn kho nguyên vật liệu, cảnh báo hết hàng và xuất báo cáo doanh thu, tần suất bán hàng theo ngày/tháng.

---

### 4. Tương tác thời gian thực & Trí tuệ nhân tạo (Realtime & AI Integration)
Điểm nhấn công nghệ tối ưu tương tác và khai phá dữ liệu:

- **4.1. Chat Realtime (Trực tiếp với Nhân viên):** Kênh hỗ trợ trực tiếp thời gian thực qua **WebSocket/Socket.io** kết nối Khách hàng với Bộ phận CSKH.
- **4.2. Trợ lý AI Tư vấn Tự động (AI Chatbot):** Bot hỗ trợ trả lời tự động ngôn ngữ tự nhiên (NLP) về giờ mở cửa, địa điểm, gợi ý món ăn theo sở thích/ngân sách và hướng dẫn đặt bàn.
- **4.3. AI Phân tích Phản hồi Khách hàng (Sentiment & Aspect Analysis):** Sử dụng NLP để phân tích cảm xúc (*Tích cực, Tiêu cực, Trung tính*) và khía cạnh (*Món ăn, Phục vụ, Giá cả, Không gian*) từ đánh giá của khách hàng, giúp quản trị viên nâng cao chất lượng dịch vụ.

---

## ⚡ YÊU CẦU PHI CHỨC NĂNG & TỐI ƯU HỆ THỐNG (NON-FUNCTIONAL)

- **Tối ưu Performance (Performance Optimization):**
  - Tối ưu hóa tốc độ tải trang trên Frontend React.
  - Rút ngắn thời gian phản hồi (Latency) của RESTful APIs.
  - Áp dụng kỹ thuật **Caching** dữ liệu để giảm tải cho CSDL.
  - Tối ưu hóa các truy vấn SQL trên **PostgreSQL**.
  - Thực hiện xử lý bất đồng bộ (Asynchronous Processing) cho các tác vụ nặng như Chat/AI.

---

## 📦 HƯỚNG DẪN CÀI ĐẶT

*(Bạn có thể điền các lệnh cài đặt cụ thể tại đây)*

1. **Clone repository:**
   ```bash
   git clone [https://github.com/username/restaurant-system.git](https://github.com/username/restaurant-system.git)
   cd restaurant-system