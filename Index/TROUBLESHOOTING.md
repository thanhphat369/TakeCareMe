# Khắc phục lỗi đăng ký tài khoản

## Các lỗi thường gặp và cách khắc phục

### 1. Lỗi "Không thể kết nối đến Backend API"

**Triệu chứng:**
- Thông báo: "Không thể kết nối đến Backend API. Vui lòng kiểm tra Backend có đang chạy không."
- Console log: `TypeError: Failed to fetch`

**Nguyên nhân:**
- Backend chưa được khởi động
- Backend chạy trên port khác
- Firewall chặn kết nối

**Cách khắc phục:**
1. Kiểm tra Backend có chạy không:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Kiểm tra port 3000:
   ```bash
   netstat -an | findstr :3000
   ```

3. Kiểm tra log Backend có lỗi gì không

### 2. Lỗi "HTTP error! status: 500"

**Triệu chứng:**
- Thông báo: "Server error: 500 Internal Server Error"
- Console log hiển thị status 500

**Nguyên nhân:**
- Database không kết nối được
- Lỗi cấu hình Backend
- Lỗi SQL Server

**Cách khắc phục:**
1. Kiểm tra SQL Server có chạy không
2. Kiểm tra file .env trong backend
3. Kiểm tra connection string
4. Xem log Backend chi tiết

### 3. Lỗi "Email đã được sử dụng"

**Triệu chứng:**
- Thông báo: "Email đã được sử dụng"
- Console log: `BadRequestException: Email đã được sử dụng`

**Nguyên nhân:**
- Email đã tồn tại trong database
- User đã đăng ký trước đó

**Cách khắc phục:**
- Sử dụng email khác
- Hoặc đăng nhập với email đã có

### 4. Lỗi "Database connection failed"

**Triệu chứng:**
- Thông báo: "Database connection failed"
- Backend log: "Connection timeout"

**Nguyên nhân:**
- SQL Server không chạy
- Sai thông tin kết nối
- Firewall chặn

**Cách khắc phục:**
1. Kiểm tra SQL Server service:
   ```bash
   services.msc
   # Tìm "SQL Server" và khởi động
   ```

2. Kiểm tra connection string trong backend/.env:
   ```
   DB_HOST=localhost
   DB_PORT=1433
   DB_USERNAME=sa
   DB_PASSWORD=your_password
   DB_DATABASE=TakeCareMeDB
   ```

3. Test kết nối SQL Server:
   ```bash
   sqlcmd -S localhost -U sa -P your_password
   ```

### 5. Lỗi "Validation failed"

**Triệu chứng:**
- Thông báo: "Validation failed"
- Console log: "class-validator errors"

**Nguyên nhân:**
- Dữ liệu không đúng format
- Thiếu trường bắt buộc
- Sai kiểu dữ liệu

**Cách khắc phục:**
- Kiểm tra form đã điền đầy đủ chưa
- Kiểm tra email format
- Kiểm tra password độ dài
- Kiểm tra phone number format

## Cách sử dụng Debug Tool

### 1. Truy cập Debug Tool
1. Mở http://localhost:3001
2. Nhấn "🐛 Debug lỗi đăng ký"
3. Nhấn "Bắt đầu Debug"

### 2. Đọc kết quả Debug
- ✅ **Backend Connection**: Backend đang chạy
- ✅ **API Register**: API hoạt động bình thường  
- ✅ **Database**: Database kết nối thành công

### 3. Khắc phục theo gợi ý
- Nếu Backend lỗi: Khởi động lại Backend
- Nếu API lỗi: Kiểm tra database connection
- Nếu Database lỗi: Kiểm tra SQL Server

## Kiểm tra từng bước

### Bước 1: Kiểm tra Backend
```bash
cd backend
npm run start:dev
```
- Phải thấy: "Server running on: http://localhost:3000"
- Không có lỗi đỏ trong console

### Bước 2: Kiểm tra Database
```bash
# Test với sqlcmd
sqlcmd -S localhost -U sa -P your_password -Q "SELECT @@VERSION"
```

### Bước 3: Test API trực tiếp
```bash
# Test với curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","password":"123456","role":"Family"}'
```

### Bước 4: Kiểm tra Frontend
- Mở Developer Tools (F12)
- Xem Console tab
- Xem Network tab khi đăng ký

## Log quan trọng cần kiểm tra

### Backend Log:
```
[Nest] Starting Nest application...
[TypeOrmModule] Database connection established
Server running on: http://localhost:3000
```

### Frontend Console Log:
```
📡 Gọi API đăng ký: http://localhost:3000/api/auth/register
📦 Dữ liệu gửi đi: {...}
📊 Response status: 201
✅ API Response: {...}
```

### Network Tab:
- Request URL: http://localhost:3000/api/auth/register
- Status: 201 Created
- Response: JSON với user data

## Liên hệ hỗ trợ

Nếu vẫn không khắc phục được:
1. Chụp ảnh lỗi
2. Copy log từ Console
3. Mô tả các bước đã thử
4. Gửi thông tin để được hỗ trợ


