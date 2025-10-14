# Hướng dẫn Test Database và Đăng ký

## Tổng quan
Hệ thống đã được cập nhật để sử dụng dữ liệu thật từ SQL Server database thông qua Backend API.

## Cách test chức năng đăng ký

### 1. Khởi động hệ thống

#### Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```
- Backend sẽ chạy trên: http://localhost:3000
- API endpoint: http://localhost:3000/api/auth/register

#### Frontend (Terminal 2)
```bash
cd Index
npm start
```
- Frontend sẽ chạy trên: http://localhost:3001

### 2. Test kết nối Database

1. Mở trình duyệt: http://localhost:3001
2. Trên trang đăng nhập, nhấn **"🔍 Test kết nối Database"**
3. Nhấn **"Bắt đầu Test Database"**
4. Kiểm tra kết quả:
   - ✅ Backend Connection: Backend đang chạy
   - ✅ User Registration: Đăng ký thành công - Dữ liệu đã lưu vào SQL Server
   - ✅ User Login: Đăng nhập thành công - JWT token được tạo

### 3. Test đăng ký tài khoản mới

1. Trên trang đăng nhập, nhấn **"Chưa có tài khoản? Đăng ký ngay"**
2. Điền thông tin:
   - **Họ và tên**: Nguyễn Văn A
   - **Email**: test@example.com
   - **Số điện thoại**: 0123456789
   - **Mật khẩu**: 123456
   - **Vai trò**: Family (hoặc Elder, Staff, Doctor)
3. Nhấn **"Đăng ký tài khoản"**
4. Kiểm tra:
   - Thông báo thành công: "Đăng ký thành công! Dữ liệu đã lưu vào database."
   - Console log hiển thị: "✅ Đăng ký thành công - Dữ liệu đã lưu vào SQL Server"
   - Tự động chuyển về trang đăng nhập sau 3 giây

### 4. Test đăng nhập với tài khoản mới

1. Sử dụng email và mật khẩu vừa đăng ký
2. Nhấn **"Đăng nhập"**
3. Kiểm tra:
   - Đăng nhập thành công
   - Chuyển vào dashboard
   - Thông tin user hiển thị đúng

## Kiểm tra dữ liệu trong Database

### SQL Server Management Studio
1. Kết nối đến SQL Server
2. Mở database: `TakeCareMeDB`
3. Mở table: `Users`
4. Kiểm tra record mới được tạo:
   ```sql
   SELECT * FROM Users ORDER BY created_at DESC
   ```

### Các trường dữ liệu được lưu:
- `user_id`: ID tự động tăng
- `full_name`: Họ và tên
- `email`: Email (unique)
- `phone`: Số điện thoại
- `password_hash`: Mật khẩu đã hash
- `role`: Vai trò (Family, Elder, Staff, Doctor, Admin, SuperAdmin)
- `avatar`: Ảnh đại diện (nullable)
- `status`: Trạng thái (Active)
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

## API Endpoints được sử dụng

### 1. Đăng ký
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "email": "test@example.com",
  "phone": "0123456789",
  "password": "123456",
  "role": "Family"
}
```

### 2. Đăng nhập
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

### 3. Lấy thông tin profile
```
GET http://localhost:3000/api/auth/profile
Authorization: Bearer <jwt_token>
```

## Troubleshooting

### Lỗi "Backend không phản hồi"
- Kiểm tra Backend có đang chạy không: `netstat -an | findstr :3000`
- Kiểm tra log Backend có lỗi gì không
- Kiểm tra database connection trong Backend

### Lỗi "Đăng ký thất bại"
- Kiểm tra email có bị trùng không
- Kiểm tra validation rules
- Kiểm tra database connection
- Kiểm tra log Backend

### Lỗi "Database Connection"
- Kiểm tra SQL Server có chạy không
- Kiểm tra connection string trong Backend
- Kiểm tra firewall settings
- Kiểm tra database permissions

## Log Console

Khi test, kiểm tra Console log để xem:
- 📡 Gọi API đăng ký: http://localhost:3000/api/auth/register
- 📦 Dữ liệu gửi đi: {...}
- 📊 Response status: 201
- ✅ API Response: {...}
- ✅ Đăng ký thành công - Dữ liệu đã lưu vào SQL Server
- 💾 User ID: 123
- 📧 Email: test@example.com
- 👤 Role: Family

## Kết quả mong đợi

✅ **Thành công**: Dữ liệu được lưu vào SQL Server, có thể đăng nhập ngay
❌ **Thất bại**: Hiển thị lỗi cụ thể, kiểm tra log để debug


