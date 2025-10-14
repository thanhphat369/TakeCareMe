# Hướng dẫn tích hợp Authentication với Backend API

## Tổng quan
Frontend đã được cập nhật để sử dụng API thật từ Backend NestJS với SQL Server database.

## Các thay đổi chính

### 1. API Endpoints đã được cập nhật
- Tất cả API calls đã được cập nhật để sử dụng prefix `/api`
- Ví dụ: `/auth/login` → `/api/auth/login`

### 2. Chức năng Authentication mới
- **Đăng nhập**: Sử dụng API `/api/auth/login`
- **Đăng ký**: Sử dụng API `/api/auth/register` (mới)
- **Lấy thông tin profile**: Sử dụng API `/api/auth/profile`
- **Đổi mật khẩu**: Sử dụng API `/api/auth/change-password`

### 3. User Roles khớp với Backend
```typescript
export type UserRole = 'SuperAdmin' | 'Admin' | 'Doctor' | 'Staff' | 'Family' | 'Elder';
```

### 4. User Interface cập nhật
```typescript
export interface User {
  userId: number;        // Thay đổi từ id: string
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  permissions?: string[];
}
```

## Cách sử dụng

### 1. Đăng nhập
- Sử dụng các tài khoản test có sẵn
- Hoặc đăng ký tài khoản mới

### 2. Đăng ký tài khoản mới
- Nhấn "Chưa có tài khoản? Đăng ký ngay" trên trang đăng nhập
- Điền đầy đủ thông tin
- Chọn vai trò phù hợp
- Sau khi đăng ký thành công, có thể đăng nhập ngay

### 3. Tài khoản test có sẵn
```
SuperAdmin: admin@tcm.com / 123456
Admin: manager@tcm.com / 123456  
Doctor: doctor@tcm.com / 123456
Staff: nurse@tcm.com / 123456
Family: family@tcm.com / 123456
Elder: elder@tcm.com / 123456
```

## Cấu hình Backend

### 1. Khởi động Backend
```bash
cd backend
npm run start:dev
```

### 2. Khởi động Frontend
```bash
cd Index
npm start
```

### 3. Cấu hình Environment
Tạo file `.env` trong thư mục `Index`:
```
REACT_APP_API_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/profile` - Lấy thông tin user
- `PATCH /api/auth/change-password` - Đổi mật khẩu

### Dashboard
- `GET /api/dashboard/summary` - Tổng quan

### Elders
- `GET /api/elders` - Danh sách người cao tuổi
- `POST /api/elders` - Tạo mới
- `PUT /api/elders/:id` - Cập nhật
- `DELETE /api/elders/:id` - Xóa

### Vitals
- `GET /api/vitals` - Danh sách sinh hiệu
- `POST /api/vitals` - Tạo mới

### Alerts
- `GET /api/alerts` - Danh sách cảnh báo
- `PATCH /api/alerts/:id/acknowledge` - Xác nhận cảnh báo
- `PATCH /api/alerts/:id/resolve` - Giải quyết cảnh báo

### Medications
- `GET /api/medications` - Danh sách thuốc
- `POST /api/medications` - Tạo mới

### Users
- `GET /api/users?role=staff` - Danh sách nhân viên

### Payments
- `GET /api/payments` - Danh sách thanh toán
- `POST /api/payments` - Tạo mới

## Lưu ý quan trọng

1. **Backend phải chạy trước**: Đảm bảo Backend NestJS đang chạy trên port 3000
2. **Database**: SQL Server phải được cấu hình và kết nối
3. **CORS**: Backend đã được cấu hình để cho phép CORS từ frontend
4. **JWT Token**: Tất cả API calls đều sử dụng Bearer token authentication

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra Backend có đang chạy không
- Kiểm tra URL trong `.env` file
- Kiểm tra CORS configuration trong Backend

### Lỗi đăng nhập
- Kiểm tra tài khoản có tồn tại trong database không
- Kiểm tra mật khẩu có đúng không
- Kiểm tra user status có là 'Active' không

### Lỗi đăng ký
- Kiểm tra email có bị trùng không
- Kiểm tra validation rules
- Kiểm tra database connection
