# 🚀 Hướng dẫn tích hợp Frontend với Backend

## ✅ Đã hoàn thành

### 1. **Cập nhật API Integration**
- ✅ Thống nhất sử dụng `apiClient` từ `../api/apiClient`
- ✅ Cập nhật tất cả controllers để sử dụng endpoints thật
- ✅ Thêm authentication headers tự động
- ✅ Xử lý lỗi và response format

### 2. **Backend Endpoints đã sẵn sàng**
- ✅ `/api/elders` - Quản lý người cao tuổi
- ✅ `/api/medications` - Quản lý thuốc
- ✅ `/api/prescriptions` - Quản lý đơn thuốc (mới)
- ✅ `/api/users` - Quản lý người dùng
- ✅ `/api/staff` - Quản lý nhân viên

### 3. **Frontend Components**
- ✅ `PrescriptionManagement` - Quản lý đơn thuốc
- ✅ `BackendTest` - Test kết nối backend
- ✅ Cập nhật routing và menu

## 🎯 Cách sử dụng

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

### Bước 3: Test kết nối
1. Truy cập `http://localhost:3001`
2. Đăng nhập với tài khoản có quyền Doctor/Admin
3. Chọn menu "Test Backend"
4. Nhấn "Chạy test" để kiểm tra kết nối

### Bước 4: Sử dụng tính năng mới
1. Chọn menu "Đơn thuốc"
2. Tạo đơn thuốc mới với nhiều thuốc
3. Quản lý và theo dõi đơn thuốc

## 📊 Dữ liệu thật từ Backend

### **Elders (Người cao tuổi)**
```javascript
// API: GET /api/elders
// Dữ liệu thật từ database
{
  "elderId": 1,
  "fullName": "Nguyễn Văn A",
  "age": 75,
  "gender": "M",
  "phone": "0123456789"
}
```

### **Medications (Thuốc)**
```javascript
// API: GET /api/medications
// Dữ liệu thật từ database
{
  "medicationId": 1,
  "elderId": 1,
  "name": "Paracetamol",
  "dose": "500mg",
  "frequency": "3 lần/ngày",
  "startDate": "2024-01-15",
  "endDate": "2024-01-22"
}
```

### **Prescriptions (Đơn thuốc)**
```javascript
// API: GET /api/prescriptions
// Dữ liệu thật từ database
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
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**:
   ```bash
   # Kiểm tra token
   localStorage.getItem('accessToken')
   # Đăng nhập lại nếu cần
   ```

2. **404 Not Found**:
   ```bash
   # Kiểm tra backend có chạy không
   curl http://localhost:3000/api/elders
   ```

3. **500 Internal Server Error**:
   ```bash
   # Kiểm tra logs backend
   cd Backend
   npm run start:dev
   ```

### Debug Commands:
```bash
# Test backend connection
cd Frontend
node test-backend-connection.js

# Check specific endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/elders
```

## 🎉 Kết quả

Sau khi hoàn thành:
- ✅ **Dữ liệu thật**: Frontend sử dụng dữ liệu thật từ backend
- ✅ **Không mock data**: Tất cả dữ liệu đều từ database
- ✅ **CRUD operations**: Tạo, đọc, cập nhật, xóa hoạt động đầy đủ
- ✅ **Authentication**: Bảo vệ tất cả API endpoints
- ✅ **Prescription management**: Quản lý đơn thuốc với nhiều thuốc
- ✅ **Real-time updates**: Dữ liệu được cập nhật real-time

## 📝 Lưu ý quan trọng

1. **Authentication**: Tất cả API calls đều cần token
2. **Data Format**: Backend trả về data trong format chuẩn
3. **Error Handling**: Frontend xử lý lỗi và hiển thị thông báo
4. **Database**: Đảm bảo database có dữ liệu mẫu
5. **Network**: Kiểm tra kết nối mạng giữa frontend và backend

## 🚀 Tính năng mới

### **Quản lý Đơn thuốc**
- Tạo đơn thuốc với nhiều loại thuốc
- Quản lý liều lượng và tần suất
- Theo dõi trạng thái điều trị
- Lịch sử kê toa của bác sĩ

### **Test Backend**
- Kiểm tra kết nối với backend
- Xem dữ liệu thật từ database
- Debug các vấn đề kết nối
- Monitor API endpoints

Hệ thống bây giờ đã hoàn toàn sử dụng dữ liệu thật từ backend thay vì mock data!

