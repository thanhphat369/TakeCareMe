## Kết nối Backend

1) Tạo `.env` (hoặc biến env lúc chạy) cho frontend:

```
REACT_APP_API_URL=http://localhost:3000
```

2) Đảm bảo backend đang chạy và đã có tài khoản để đăng nhập lấy `accessToken`.

3) Frontend sẽ tự gọi `GET /api/dashboard/summary` khi vào trang Dashboard. Lưu `accessToken` vào `localStorage` với key `accessToken` sau khi đăng nhập (qua trang login của app hoặc devtools).

# Hệ thống quản lý chăm sóc người cao tuổi

Ứng dụng web quản lý chăm sóc người cao tuổi được xây dựng với React, TypeScript, Tailwind CSS và Ant Design.

## 🚀 Tính năng chính

### 📊 Dashboard
- Tổng quan thống kê hệ thống
- Biểu đồ sức khỏe và cuộc hẹn
- Hoạt động gần đây
- Cuộc hẹn sắp tới

### 👥 Quản lý người cao tuổi
- Thêm, sửa, xóa thông tin người cao tuổi
- Theo dõi tình trạng sức khỏe
- Quản lý thuốc và dị ứng
- Lịch sử khám bệnh

### 👨‍⚕️ Quản lý người chăm sóc
- Quản lý thông tin người chăm sóc
- Chuyên môn và kinh nghiệm
- Đánh giá hiệu suất
- Trạng thái hoạt động

### 📅 Lịch hẹn
- Lịch FullCalendar tích hợp
- Quản lý cuộc hẹn
- Phân loại theo loại cuộc hẹn
- Nhắc nhở và thông báo

### 🏥 Hồ sơ sức khỏe
- Ghi nhận các chỉ số sức khỏe
- Theo dõi huyết áp, nhịp tim, nhiệt độ
- Phân tích BMI và tình trạng sức khỏe
- Lịch sử khám bệnh

### 📈 Báo cáo & Thống kê
- Báo cáo tháng/tuần
- Biểu đồ xu hướng sức khỏe
- Thống kê hiệu suất
- Báo cáo tùy chỉnh

### ⚙️ Cài đặt
- Cấu hình hệ thống
- Thông báo
- Bảo mật
- Quản lý dữ liệu

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Ant Design 5.x
- **Styling**: Tailwind CSS
- **Calendar**: FullCalendar.js
- **Charts**: Chart.js + React-Chartjs-2
- **Icons**: Ant Design Icons
- **Date**: date-fns

## 📦 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd elderly-care-management
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy ứng dụng**
```bash
npm start
```

4. **Mở trình duyệt**
```
http://localhost:3000
```

## 🏗️ Cấu trúc dự án

```
src/
├── components/           # Các component chính
│   ├── charts/          # Biểu đồ
│   ├── modals/          # Modal components
│   └── reports/         # Báo cáo
├── data/               # Dữ liệu mẫu
├── types/              # TypeScript types
├── App.tsx             # Component chính
├── index.tsx           # Entry point
└── index.css           # Global styles
```

## 🎨 Giao diện

### Dashboard
- Thống kê tổng quan với các card metrics
- Biểu đồ cột và đường cho xu hướng
- Danh sách hoạt động gần đây
- Cuộc hẹn sắp tới

### Quản lý người cao tuổi
- Bảng danh sách với tìm kiếm và phân trang
- Form thêm/sửa với validation
- Modal chi tiết với thông tin đầy đủ
- Thống kê trạng thái sức khỏe

### Lịch hẹn
- Lịch FullCalendar với 3 view (tháng/tuần/ngày)
- Tạo/sửa cuộc hẹn trực tiếp trên lịch
- Phân loại màu sắc theo loại cuộc hẹn
- Legend giải thích màu sắc

### Hồ sơ sức khỏe
- Bảng danh sách hồ sơ với phân tích tự động
- Form nhập liệu với validation
- Phân loại tình trạng sức khỏe
- Biểu đồ xu hướng

## 📊 Biểu đồ

- **HealthChart**: Biểu đồ cột tình trạng sức khỏe
- **AppointmentChart**: Biểu đồ đường cuộc hẹn
- **HealthTrendChart**: Xu hướng sức khỏe đa trục
- **AppointmentStatsChart**: Biểu đồ tròn thống kê cuộc hẹn
- **CaregiverPerformanceChart**: Hiệu suất người chăm sóc
- **ElderlyStatusChart**: Trạng thái người cao tuổi

## 🔧 Cấu hình

### Tailwind CSS
- Cấu hình trong `tailwind.config.js`
- Màu sắc tùy chỉnh cho primary và secondary
- Responsive design

### Ant Design
- Theme tùy chỉnh
- Components được sử dụng: Table, Form, Modal, Card, Statistic, etc.

### FullCalendar
- Plugins: dayGrid, timeGrid, interaction
- Localization tiếng Việt
- Custom styling

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl
- Responsive tables và forms
- Mobile-friendly navigation

## 🚀 Triển khai

1. **Build production**
```bash
npm run build
```

2. **Deploy**
- Upload thư mục `build/` lên web server
- Cấu hình server để serve SPA

## 📝 Ghi chú

- Dữ liệu hiện tại là mock data
- Cần tích hợp API thực tế
- Có thể mở rộng thêm tính năng:
  - Authentication & Authorization
  - Real-time notifications
  - Mobile app
  - AI health analysis
  - Video calling

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License
