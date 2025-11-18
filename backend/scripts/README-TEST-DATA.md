# Hướng dẫn chạy Script Test Data

## Mục đích
Script này thêm dữ liệu mẫu vào database để test các chức năng báo cáo và phân tích:
- Biểu đồ sinh hiệu (vital signs)
- Thống kê thuốc (medications)
- Tiến triển BMI
- Cảnh báo (alerts)

## Cách chạy

### 1. Sử dụng SQL Server Management Studio (SSMS)
1. Mở SSMS và kết nối với database `TakeCareMeDB`
2. Mở file `Backend/scripts/insert-test-data.sql`
3. Chạy script (F5 hoặc Execute)

### 2. Sử dụng Azure Data Studio
1. Mở Azure Data Studio
2. Kết nối với SQL Server
3. Mở file script và chạy

### 3. Sử dụng Command Line (sqlcmd)
```bash
sqlcmd -S localhost -d TakeCareMeDB -i Backend/scripts/insert-test-data.sql
```

## Dữ liệu được thêm vào

### Vital Readings (Sinh hiệu)
- **Elder 1**: 90 records × 5 loại = 450 records (30 ngày qua)
  - Nhịp tim, Huyết áp tâm thu, Huyết áp tâm trương, Nhiệt độ, SpO2
- **Elder 2**: 21 records × 5 loại = 105 records (7 ngày qua)
  - Nhịp tim, Huyết áp, Nhiệt độ, Đường huyết
- **Elder 3**: 8 records × 4 loại = 32 records (1 ngày qua)
  - Nhịp tim, Huyết áp, Nhiệt độ

### Medications (Thuốc)
- **Elder 1**: 5 thuốc với frequency khác nhau
  - 1 lần/ngày: Aspirin, Amlodipine, Atorvastatin, Omeprazole
  - 2 lần/ngày: Metformin
- **Elder 2**: 3 thuốc
  - 1 lần/ngày: Lisinopril
  - 2 lần/ngày: Calcium
  - 3 lần/ngày: Metformin
- **Elder 3**: 2 thuốc
  - 1 lần/ngày: Warfarin, Furosemide

### Medical History (BMI)
- **Elder 1**: BMI = 23.5 (Bình thường)
- **Elder 2**: BMI = 21.8 (Bình thường)
- **Elder 3**: BMI = 19.2 (Thiếu cân)

### Alerts (Cảnh báo)
- **Elder 1**: 4 alerts
  - 1 Critical (Huyết áp cao)
  - 1 High (Nhịp tim cao)
  - 1 Medium (Nhiệt độ)
  - 1 Low (Quên uống thuốc)
- **Elder 2**: 2 alerts
  - 1 High (Đường huyết thấp)
  - 1 Low (Cần kiểm tra)
- **Elder 3**: 2 alerts
  - 1 Critical (SpO2 thấp)
  - 1 Medium (Nhịp tim không đều)

## Lưu ý

1. **Script tự động tìm Elder IDs**: Script sẽ tự động lấy 3 elder đầu tiên từ database
2. **Tự động tìm Doctor/Staff**: Script sẽ tìm user có role 'Doctor' và 'Staff', nếu không có thì dùng user đầu tiên
3. **Dữ liệu ngẫu nhiên**: Các giá trị sinh hiệu được tạo ngẫu nhiên trong khoảng hợp lý
4. **Timestamp**: Dữ liệu được tạo với timestamp trong quá khứ để test các filter day/week/month

## Kiểm tra dữ liệu

Sau khi chạy script, có thể kiểm tra bằng các query:

```sql
-- Kiểm tra số lượng vital readings
SELECT elder_id, type, COUNT(*) as count 
FROM VitalReadings 
GROUP BY elder_id, type
ORDER BY elder_id, type;

-- Kiểm tra medications
SELECT elder_id, name, frequency, COUNT(*) as count
FROM Medications
GROUP BY elder_id, name, frequency
ORDER BY elder_id;

-- Kiểm tra BMI
SELECT elder_id, bmi 
FROM MedicalHistory
WHERE bmi IS NOT NULL;

-- Kiểm tra alerts
SELECT elder_id, severity, status, COUNT(*) as count
FROM Alerts
GROUP BY elder_id, severity, status
ORDER BY elder_id, severity;
```

## Xóa dữ liệu test (nếu cần)

Nếu muốn xóa dữ liệu test, chạy script sau:

```sql
-- Xóa alerts test
DELETE FROM Alerts WHERE notes LIKE '%test%' OR notes LIKE '%cần%';

-- Xóa medications test (cẩn thận!)
-- DELETE FROM Medications WHERE elder_id IN (SELECT TOP 3 elder_id FROM Elders);

-- Xóa vital readings test (cẩn thận!)
-- DELETE FROM VitalReadings WHERE elder_id IN (SELECT TOP 3 elder_id FROM Elders);
```

## Troubleshooting

1. **Lỗi "Invalid object name"**: Đảm bảo đã chọn đúng database `TakeCareMeDB`
2. **Lỗi "Cannot insert NULL":** Kiểm tra xem có ít nhất 1 Elder và 1 User trong database
3. **Không có dữ liệu**: Kiểm tra lại các Elder IDs và User IDs đã được tìm thấy (xem output của PRINT statements)







