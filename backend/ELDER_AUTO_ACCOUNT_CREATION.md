# Elderly Auto Account Creation

## Tổng quan

Chức năng này cho phép tự động tạo tài khoản đăng nhập khi thêm mới một Elderly vào hệ thống. Khi tạo Elder, hệ thống sẽ:

1. **Tự động tạo User account** với thông tin cơ bản
2. **Sinh email tự động** từ tên của Elder
3. **Tạo mật khẩu mặc định** để Elder có thể đăng nhập
4. **Liên kết Elder với User account** được tạo

## Cách hoạt động

### 1. Tạo Email tự động
- Lấy tên Elder từ `createElderDto.fullName`
- Loại bỏ dấu tiếng Việt bằng `removeVietnameseAccent()`
- Tạo email theo format: `{cleanName}_{timestamp}@tcm.local`
- Ví dụ: `Nguyễn Văn An` → `nguyenvanan_1703123456789@tcm.local`

### 2. Tạo User Account
```typescript
const user = {
  fullName: createElderDto.fullName,
  email: generatedEmail,
  phone: createElderDto.phone,
  passwordHash: hashedPassword,
  role: UserRole.ELDER,
  status: UserStatus.ACTIVE,
  avatar: null,
  notes: 'Tài khoản tạo tự động cho Elder'
}
```

### 3. Mật khẩu mặc định
- Mật khẩu mặc định: `default123`
- Được hash bằng bcrypt với salt rounds = 10
- Elder có thể đổi mật khẩu sau khi đăng nhập

### 4. Transaction Safety
- Sử dụng database transaction để đảm bảo tính toàn vẹn
- Nếu có lỗi, tất cả thay đổi sẽ được rollback
- Đảm bảo User và Elder được tạo cùng lúc hoặc không tạo gì cả

## API Endpoints

### POST /api/elders
Tạo Elder mới với tự động tạo User account

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn An",
  "dob": "1950-01-15",
  "age": 74,
  "phone": "0123456789",
  "gender": "M",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "note": "Test elderly",
  "contactPhone": "0987654321",
  "insuranceInfo": "BHYT: 123456789"
}
```

**Response:**
```json
{
  "elderId": 1,
  "userId": 15,
  "fullName": "Nguyễn Văn An",
  "dob": "1950-01-15T00:00:00.000Z",
  "age": 74,
  "phone": "0123456789",
  "gender": "M",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "status": "Active",
  "note": "Test elderly",
  "contactPhone": "0987654321",
  "insuranceInfo": "BHYT: 123456789",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Đăng nhập với tài khoản Elder

Sau khi tạo Elder, Elder có thể đăng nhập bằng:

**Email:** `{cleanName}_{timestamp}@tcm.local`
**Password:** `default123`

**Login Request:**
```json
{
  "email": "nguyenvanan_1703123456789@tcm.local",
  "password": "default123"
}
```

## Cấu trúc Database

### Bảng Users
- `user_id`: Primary key
- `full_name`: Tên đầy đủ
- `email`: Email tự động sinh
- `phone`: Số điện thoại
- `password_hash`: Mật khẩu đã hash
- `role`: 'Elder'
- `status`: 'Active'
- `notes`: 'Tài khoản tạo tự động cho Elder'

### Bảng Elders
- `elder_id`: Primary key
- `user_id`: Foreign key đến Users
- `full_name`: Tên đầy đủ
- `dob`: Ngày sinh
- `age`: Tuổi
- `phone`: Số điện thoại
- `gender`: Giới tính
- `address`: Địa chỉ
- `status`: 'Active'

## Testing

### Chạy test script
```bash
cd Backend
node test-elder-creation.js
```

### Test thủ công
1. Tạo Elder qua API
2. Kiểm tra User account được tạo
3. Test đăng nhập với email và password mặc định
4. Verify Elder có thể truy cập hệ thống

## Lưu ý quan trọng

1. **Email duy nhất**: Hệ thống sử dụng timestamp để đảm bảo email không trùng lặp
2. **Mật khẩu mặc định**: Elder nên đổi mật khẩu ngay sau lần đăng nhập đầu tiên
3. **Transaction**: Tất cả operations được thực hiện trong transaction để đảm bảo consistency
4. **Error handling**: Nếu có lỗi, toàn bộ quá trình sẽ được rollback
5. **Medical History**: Tự động tạo medical history rỗng cho Elder mới

## Security Considerations

- Mật khẩu mặc định nên được thay đổi ngay
- Email được sinh tự động nên được thông báo cho Elder
- Cân nhắc gửi thông tin đăng nhập qua email/SMS
- Implement password reset functionality cho Elder
