# Hướng dẫn tích hợp dữ liệu thật từ Backend

## 🎯 Mục tiêu
Cập nhật frontend để sử dụng dữ liệu thật từ backend thay vì mock data.

## ✅ Đã hoàn thành

### 1. **Cập nhật API Clients**
- ✅ Thống nhất sử dụng `apiClient` từ `../api/apiClient`
- ✅ Cập nhật tất cả controllers để sử dụng đúng endpoints
- ✅ Thêm authentication headers tự động

### 2. **Backend Endpoints**
- ✅ `/api/elders` - Lấy danh sách người cao tuổi
- ✅ `/api/medications` - Quản lý thuốc
- ✅ `/api/prescriptions` - Quản lý đơn thuốc (mới)
- ✅ `/api/users` - Quản lý người dùng
- ✅ `/api/staff` - Quản lý nhân viên

## 🔧 Các bước thực hiện

### Bước 1: Khởi động Backend
```bash
cd Backend
npm run start:dev
```

### Bước 2: Khởi động Frontend
```bash
cd Frontend
npm start
```

### Bước 3: Đăng nhập
1. Truy cập `http://localhost:3001`
2. Đăng nhập với tài khoản có quyền Doctor/Admin
3. Truy cập menu "Đơn thuốc"

## 📊 Kiểm tra dữ liệu thật

### 1. **Elders Data**
```javascript
// API: GET /api/elders
// Response format:
{
  "data": [
    {
      "elderId": 1,
      "fullName": "Nguyễn Văn A",
      "age": 75,
      "gender": "M",
      "phone": "0123456789"
    }
  ]
}
```

### 2. **Medications Data**
```javascript
// API: GET /api/medications
// Response format:
{
  "data": [
    {
      "medicationId": 1,
      "elderId": 1,
      "name": "Paracetamol",
      "dose": "500mg",
      "frequency": "3 lần/ngày",
      "startDate": "2024-01-15",
      "endDate": "2024-01-22"
    }
  ]
}
```

### 3. **Prescriptions Data**
```javascript
// API: GET /api/prescriptions
// Response format:
{
  "data": [
    {
      "prescriptionId": 1,
      "elderId": 1,
      "prescribedBy": 1,
      "diagnosis": "Cảm cúm nhẹ",
      "prescriptionDate": "2024-01-15",
      "medications": [
        {
          "name": "Paracetamol",
          "dose": "500mg",
          "frequency": "3 lần/ngày"
        }
      ]
    }
  ]
}
```

## 🚀 Tính năng mới

### **Quản lý Đơn thuốc**
1. **Tạo đơn thuốc mới**:
   - Chọn người cao tuổi
   - Chọn bác sĩ kê toa
   - Thêm nhiều thuốc vào một đơn
   - Thiết lập thời gian điều trị

2. **Quản lý thuốc**:
   - Thêm/sửa/xóa thuốc trong đơn
   - Thiết lập liều lượng và tần suất
   - Theo dõi trạng thái điều trị

3. **Theo dõi trạng thái**:
   - Đang điều trị
   - Đã hoàn thành
   - Chưa bắt đầu

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**:
   - Kiểm tra token trong localStorage
   - Đăng nhập lại

2. **404 Not Found**:
   - Kiểm tra backend có chạy không
   - Kiểm tra endpoint URL

3. **500 Internal Server Error**:
   - Kiểm tra logs backend
   - Kiểm tra database connection

### Debug Commands:
```bash
# Test backend connection
cd Frontend
node test-backend-connection.js

# Check backend logs
cd Backend
npm run start:dev
```

## 📝 Lưu ý quan trọng

1. **Authentication**: Tất cả API calls đều cần token
2. **Data Format**: Backend trả về data trong format chuẩn
3. **Error Handling**: Frontend xử lý lỗi và hiển thị thông báo
4. **Real-time**: Dữ liệu được cập nhật real-time từ backend

## 🎉 Kết quả

Sau khi hoàn thành:
- ✅ Frontend sử dụng dữ liệu thật từ backend
- ✅ Không còn mock data
- ✅ Tất cả CRUD operations hoạt động
- ✅ Authentication được bảo vệ
- ✅ Prescription management hoạt động đầy đủ

