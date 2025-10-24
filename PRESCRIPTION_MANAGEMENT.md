# Hệ thống Quản lý Đơn thuốc

## Tổng quan
Hệ thống quản lý đơn thuốc mới cho phép bác sĩ tạo đơn thuốc với nhiều loại thuốc khác nhau, giống như cách bác sĩ kê toa thực tế.

## Tính năng chính

### 1. Tạo đơn thuốc mới
- Chọn người cao tuổi
- Chọn bác sĩ kê toa
- Nhập chẩn đoán
- Thêm nhiều thuốc vào một đơn thuốc
- Thiết lập thời gian điều trị

### 2. Quản lý thuốc trong đơn
- Tên thuốc
- Liều lượng
- Tần suất sử dụng
- Thời gian uống
- Ghi chú đặc biệt

### 3. Theo dõi trạng thái
- Đang điều trị
- Đã hoàn thành
- Chưa bắt đầu

## Cấu trúc Database

### Bảng Prescriptions
```sql
CREATE TABLE Prescriptions (
    prescription_id INT IDENTITY(1,1) PRIMARY KEY,
    elder_id INT NOT NULL,
    prescribed_by INT NOT NULL,
    diagnosis NVARCHAR(255),
    notes NVARCHAR(500),
    prescription_date DATETIME NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    status NVARCHAR(50) DEFAULT 'active',
    FOREIGN KEY (elder_id) REFERENCES Elders(elder_id),
    FOREIGN KEY (prescribed_by) REFERENCES Users(user_id)
);
```

### Cập nhật bảng Medications
```sql
ALTER TABLE Medications ADD prescription_id INT;
ALTER TABLE Medications ADD FOREIGN KEY (prescription_id) REFERENCES Prescriptions(prescription_id);
```

## API Endpoints

### Prescriptions
- `GET /api/prescriptions` - Lấy tất cả đơn thuốc
- `GET /api/prescriptions/elder/:elderId` - Lấy đơn thuốc theo người cao tuổi
- `GET /api/prescriptions/:id` - Lấy đơn thuốc theo ID
- `POST /api/prescriptions` - Tạo đơn thuốc mới
- `PUT /api/prescriptions/:id` - Cập nhật đơn thuốc
- `DELETE /api/prescriptions/:id` - Xóa đơn thuốc

## Cách sử dụng

### 1. Truy cập giao diện
- Đăng nhập với vai trò Doctor, Admin, hoặc Staff
- Chọn menu "Đơn thuốc" từ sidebar

### 2. Tạo đơn thuốc mới
1. Nhấn nút "Tạo đơn thuốc mới"
2. Chọn người cao tuổi
3. Chọn bác sĩ kê toa
4. Nhập thông tin chẩn đoán
5. Thêm các loại thuốc:
   - Nhấn "Thêm thuốc"
   - Điền thông tin từng thuốc
   - Có thể thêm nhiều thuốc
6. Nhấn "Tạo mới"

### 3. Quản lý đơn thuốc
- Xem danh sách tất cả đơn thuốc
- Lọc theo người cao tuổi
- Xem chi tiết đơn thuốc
- Chỉnh sửa đơn thuốc
- Xóa đơn thuốc

## Lợi ích

### 1. Cho bác sĩ
- Tạo đơn thuốc chuyên nghiệp
- Quản lý nhiều thuốc trong một đơn
- Theo dõi lịch sử kê toa
- Dễ dàng chỉnh sửa và cập nhật

### 2. Cho nhân viên y tế
- Theo dõi đơn thuốc của từng bệnh nhân
- Quản lý lịch uống thuốc
- Nhắc nhở thời gian uống thuốc

### 3. Cho gia đình
- Xem đơn thuốc của người thân
- Theo dõi tình trạng điều trị
- Nhận thông báo về thuốc

## Cài đặt và Chạy

### Backend
```bash
cd Backend
npm install
npm run start:dev
```

### Frontend
```bash
cd Frontend
npm install
npm start
```

### Test API
```bash
cd Backend
node test-prescription.js
```

## Lưu ý quan trọng

1. **Quyền truy cập**: Chỉ Doctor, Admin, và Staff mới có thể tạo và quản lý đơn thuốc
2. **Dữ liệu**: Đơn thuốc được liên kết với người cao tuổi và bác sĩ kê toa
3. **Bảo mật**: Tất cả API đều yêu cầu xác thực
4. **Backup**: Nên backup dữ liệu trước khi cập nhật database

## Troubleshooting

### Lỗi thường gặp
1. **Lỗi kết nối database**: Kiểm tra cấu hình database trong `.env`
2. **Lỗi quyền truy cập**: Đảm bảo user có role phù hợp
3. **Lỗi validation**: Kiểm tra dữ liệu đầu vào

### Hỗ trợ
- Kiểm tra logs trong console
- Xem network tab trong browser dev tools
- Liên hệ admin để được hỗ trợ

