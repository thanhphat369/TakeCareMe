# Hướng dẫn chạy Frontend

## 🚀 Cài đặt và chạy Frontend

### 1. Cài đặt dependencies
```bash
# Trong thư mục Index/
cd Index
npm install
```

### 2. Cấu hình API
Tạo file `.env` trong thư mục `Index/` với nội dung:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 3. Chạy Frontend
```bash
# Development mode
npm start

# Build for production
npm run build
```

### 4. Truy cập ứng dụng
Frontend sẽ chạy tại: `http://localhost:3000`

## 🎯 Tính năng Frontend

### 1. **Hệ thống đăng nhập**
- Chọn vai trò người dùng
- Đăng nhập với API thực hoặc mock data
- Quản lý session và permissions

### 2. **Dashboard tổng quan**
- Thống kê hệ thống real-time
- Biểu đồ và charts
- Hoạt động gần đây
- Tổng quan hệ thống

### 3. **Quản lý người cao tuổi**
- Danh sách hồ sơ chi tiết
- Thêm/sửa/xóa thông tin
- Thống kê trạng thái sức khỏe
- Modal xem chi tiết

### 4. **Theo dõi sức khỏe**
- **HealthRecords**: Lịch sử hồ sơ sức khỏe
- **VitalSignsMonitor**: Giám sát sinh hiệu real-time
- Cảnh báo tự động khi có bất thường
- Timeline hoạt động

### 5. **Lịch chăm sóc**
- FullCalendar integration
- Tạo/sửa/xóa cuộc hẹn
- Phân loại theo loại hoạt động
- Màu sắc phân biệt

### 6. **Quản lý thuốc**
- Danh sách thuốc với trạng thái
- Lịch nhắc uống thuốc
- Thống kê thuốc
- Form quản lý chi tiết

### 7. **Hệ thống cảnh báo**
- Cảnh báo khẩn cấp, y tế, thuốc
- Phân loại theo mức độ ưu tiên
- Xử lý cảnh báo (xác nhận, giải quyết)
- Timeline hoạt động

### 8. **Quản lý nhân viên**
- Danh sách nhân viên theo vai trò
- Thông tin chi tiết, bằng cấp
- Phân công ca làm việc
- Thống kê nhân viên

### 9. **Quản lý thanh toán**
- Hóa đơn và thanh toán
- Theo dõi trạng thái
- Thống kê tài chính
- Báo cáo doanh thu

### 10. **Responsive Design**
- Tối ưu cho mobile, tablet, desktop
- Layout linh hoạt với Tailwind CSS
- Menu responsive
- Cards và tables responsive

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Ant Design 5.x
- **Styling**: Tailwind CSS
- **Calendar**: FullCalendar.js
- **Charts**: Chart.js + React-Chartjs-2
- **Icons**: Ant Design Icons
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

## 📱 Responsive Design

### Mobile (< 768px)
- Sidebar thu gọn
- Cards xếp dọc
- Menu hamburger
- Touch-friendly buttons

### Tablet (768px - 1024px)
- Sidebar có thể thu gọn
- Cards 2 cột
- Menu responsive
- Touch gestures

### Desktop (> 1024px)
- Sidebar mở rộng
- Cards 3-4 cột
- Full menu
- Hover effects

## 🔧 Cấu trúc Frontend

```
Index/src/
├── components/             # React components
│   ├── App.tsx            # Main app component
│   ├── Login.tsx          # Login component
│   ├── Dashboard.tsx      # Dashboard
│   ├── ElderlyManagement.tsx
│   ├── HealthRecords.tsx
│   ├── VitalSignsMonitor.tsx
│   ├── Calendar.tsx
│   ├── MedicationManagement.tsx
│   ├── AlertsManagement.tsx
│   ├── StaffManagement.tsx
│   ├── PaymentManagement.tsx
│   ├── SystemOverview.tsx
│   └── charts/            # Chart components
├── config/                # Configuration
│   └── api.ts            # API configuration
├── types/                 # TypeScript types
├── data/                  # Mock data
├── api.ts                 # API functions
└── index.tsx             # Entry point
```

## 🎨 UI/UX Features

### 1. **Modern Design**
- Clean và professional
- Consistent color scheme
- Intuitive navigation
- Accessible components

### 2. **Interactive Elements**
- Hover effects
- Loading states
- Error handling
- Success feedback

### 3. **Data Visualization**
- Charts và graphs
- Progress indicators
- Status badges
- Timeline components

### 4. **Form Management**
- Validation
- Error messages
- Success feedback
- Auto-save

## 🚨 Troubleshooting

### Lỗi kết nối API
- Kiểm tra backend đang chạy tại `http://localhost:3000`
- Kiểm tra `REACT_APP_API_URL` trong `.env`
- Kiểm tra CORS settings

### Lỗi build
- Xóa `node_modules` và `package-lock.json`
- Chạy `npm install` lại
- Kiểm tra Node.js version (>= 16)

### Lỗi TypeScript
- Kiểm tra `tsconfig.json`
- Chạy `npm run build` để kiểm tra lỗi
- Cập nhật types nếu cần

## 📝 Ghi chú

1. **API Integration**: Có thể chuyển đổi giữa mock data và real API
2. **Responsive**: Tối ưu cho tất cả thiết bị
3. **Performance**: Lazy loading và code splitting
4. **Accessibility**: Tuân thủ WCAG guidelines
5. **Security**: JWT token management
6. **Error Handling**: Comprehensive error handling
