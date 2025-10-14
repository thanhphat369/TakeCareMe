# Hướng dẫn chạy Backend API

## 🚀 Cài đặt và chạy Backend

### 1. Cài đặt dependencies
```bash
# Trong thư mục gốc d:\TCM\
npm install
```

### 2. Cấu hình Database
Tạo file `.env` trong thư mục gốc với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=tcm_database
DB_ENCRYPT=false
DB_TRUST_CERT=true

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Chạy Backend
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 4. Kiểm tra API
Backend sẽ chạy tại: `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh` - Làm mới token

### Dashboard
- `GET /dashboard/summary` - Tổng quan hệ thống

### Elders (Người cao tuổi)
- `GET /elders` - Danh sách người cao tuổi
- `POST /elders` - Tạo mới
- `PUT /elders/:id` - Cập nhật
- `DELETE /elders/:id` - Xóa

### Vitals (Sinh hiệu)
- `GET /vitals` - Danh sách sinh hiệu
- `POST /vitals` - Tạo mới
- `PUT /vitals/:id` - Cập nhật
- `DELETE /vitals/:id` - Xóa

### Alerts (Cảnh báo)
- `GET /alerts` - Danh sách cảnh báo
- `PATCH /alerts/:id/acknowledge` - Xác nhận cảnh báo
- `PATCH /alerts/:id/resolve` - Giải quyết cảnh báo

### Medications (Thuốc)
- `GET /medications` - Danh sách thuốc
- `POST /medications` - Tạo mới
- `PUT /medications/:id` - Cập nhật
- `DELETE /medications/:id` - Xóa

### Users (Người dùng)
- `GET /users` - Danh sách người dùng
- `GET /users?role=staff` - Danh sách nhân viên
- `POST /users` - Tạo mới
- `PUT /users/:id` - Cập nhật
- `DELETE /users/:id` - Xóa

### Payments (Thanh toán)
- `GET /payments` - Danh sách thanh toán
- `POST /payments` - Tạo mới
- `PUT /payments/:id` - Cập nhật
- `DELETE /payments/:id` - Xóa

## 🔧 Cấu trúc Backend

```
src/
├── main.ts                 # Entry point
├── app.module.ts          # Root module
├── entities/              # Database entities
│   ├── user.entity.ts
│   ├── elder.entity.ts
│   ├── vital-reading.entity.ts
│   ├── alert.entity.ts
│   └── ...
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── elders/            # Elder management
│   ├── vitals/            # Vital signs
│   ├── alerts/            # Alert system
│   ├── shifts/            # Shift management
│   ├── devices/           # Device management
│   ├── payments/          # Payment management
│   └── dashboard/         # Dashboard data
└── uploads/               # File uploads
```

## 🛠️ Công nghệ sử dụng

- **Framework**: NestJS
- **Database**: SQL Server (TypeORM)
- **Authentication**: JWT + Passport
- **Validation**: Class Validator
- **File Upload**: Multer
- **CORS**: Enabled for frontend

## 📝 Ghi chú

1. **Database**: Cần có SQL Server đang chạy
2. **CORS**: Đã cấu hình cho frontend tại `http://localhost:3001`
3. **Authentication**: Sử dụng JWT tokens
4. **File Upload**: Hỗ trợ upload files vào thư mục `uploads/`
5. **Validation**: Tất cả input đều được validate
6. **Error Handling**: Có xử lý lỗi toàn cục

## 🚨 Troubleshooting

### Lỗi kết nối database
- Kiểm tra SQL Server đang chạy
- Kiểm tra thông tin kết nối trong `.env`
- Kiểm tra firewall và network

### Lỗi CORS
- Kiểm tra `CORS_ORIGIN` trong `.env`
- Đảm bảo frontend chạy đúng port

### Lỗi JWT
- Kiểm tra `JWT_SECRET` trong `.env`
- Đảm bảo token không hết hạn
