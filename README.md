# Take Care Me (TCM) - Hệ thống chăm sóc người cao tuổi

## Cấu trúc dự án

```
TCM/
├── backend/                 # Backend NestJS API
│   ├── src/                # Source code backend
│   ├── dist/               # Compiled JavaScript
│   ├── node_modules/       # Backend dependencies
│   ├── package.json        # Backend dependencies
│   ├── tsconfig.json       # TypeScript config
│   ├── nest-cli.json       # NestJS CLI config
│   ├── start.bat          # Windows start script
│   ├── start.sh           # Linux/Mac start script
│   └── uploads/            # File uploads directory
├── Index/                  # Frontend React App
│   ├── src/                # Source code frontend
│   ├── public/             # Static files
│   ├── build/              # Production build
│   ├── node_modules/       # Frontend dependencies
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript config
├── database/               # Database scripts
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

## Cách chạy dự án

### 1. Khởi động Backend
```bash
cd backend
npm install
npm run start:dev
```
Backend sẽ chạy trên: http://localhost:3000

### 2. Khởi động Frontend
```bash
cd Index
npm install
npm start
```
Frontend sẽ chạy trên: http://localhost:3001

## Tính năng chính

### Authentication
- ✅ Đăng nhập với JWT token
- ✅ Đăng ký tài khoản mới
- ✅ Đổi mật khẩu
- ✅ Phân quyền theo vai trò

### Quản lý người cao tuổi
- ✅ CRUD operations
- ✅ Theo dõi sức khỏe
- ✅ Quản lý thuốc
- ✅ Cảnh báo khẩn cấp

### Dashboard
- ✅ Tổng quan thống kê
- ✅ Biểu đồ trực quan
- ✅ Báo cáo chi tiết

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/profile` - Thông tin user
- `PATCH /api/auth/change-password` - Đổi mật khẩu

### Dashboard
- `GET /api/dashboard/summary` - Tổng quan

### Elders
- `GET /api/elders` - Danh sách
- `POST /api/elders` - Tạo mới
- `PUT /api/elders/:id` - Cập nhật
- `DELETE /api/elders/:id` - Xóa

### Vitals
- `GET /api/vitals` - Danh sách sinh hiệu
- `POST /api/vitals` - Tạo mới

### Alerts
- `GET /api/alerts` - Danh sách cảnh báo
- `PATCH /api/alerts/:id/acknowledge` - Xác nhận
- `PATCH /api/alerts/:id/resolve` - Giải quyết

### Medications
- `GET /api/medications` - Danh sách thuốc
- `POST /api/medications` - Tạo mới

### Users
- `GET /api/users?role=staff` - Danh sách nhân viên

### Payments
- `GET /api/payments` - Danh sách thanh toán
- `POST /api/payments` - Tạo mới

## Tài khoản test

```
SuperAdmin: admin@tcm.com / 123456
Admin: manager@tcm.com / 123456  
Doctor: doctor@tcm.com / 123456
Staff: nurse@tcm.com / 123456
Family: family@tcm.com / 123456
Elder: elder@tcm.com / 123456
```

## Công nghệ sử dụng

### Backend
- NestJS (Node.js framework)
- TypeScript
- SQL Server Database
- JWT Authentication
- TypeORM

### Frontend
- React 18
- TypeScript
- Ant Design (UI components)
- Tailwind CSS
- Axios (HTTP client)

## Cấu hình môi trường

### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_USERNAME=sa
DATABASE_PASSWORD=your_password
DATABASE_NAME=TakeCareMeDB
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra SQL Server có chạy không
- Kiểm tra connection string trong .env
- Kiểm tra firewall settings

### Lỗi CORS
- Backend đã được cấu hình CORS
- Kiểm tra frontend URL trong CORS config

### Lỗi authentication
- Kiểm tra JWT_SECRET trong backend
- Kiểm tra token expiration
- Kiểm tra user status trong database

## Phát triển

### Thêm module mới
1. Tạo module trong `backend/src/modules/`
2. Thêm controller, service, DTOs
3. Import module vào `app.module.ts`
4. Tạo API calls trong frontend

### Thêm component mới
1. Tạo component trong `Index/src/components/`
2. Thêm route trong `App.tsx`
3. Thêm menu item nếu cần

## Liên hệ

Dự án được phát triển bởi team TCM.