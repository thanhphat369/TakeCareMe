# Hướng dẫn thêm cột Avatar vào Database

## Vấn đề
Nếu avatar không lưu được vào database, có thể cột `avatar` chưa tồn tại trong bảng `Elders`.

## Giải pháp

### Bước 1: Kiểm tra cột avatar đã tồn tại chưa

Chạy query sau trong SQL Server Management Studio hoặc Azure Data Studio:

```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Elders' 
AND COLUMN_NAME = 'avatar';
```

Nếu không có kết quả, nghĩa là cột chưa tồn tại.

### Bước 2: Thêm cột avatar

**Cách 1: Chạy script SQL tự động**

Chạy file `add-avatar-column.sql` trong thư mục `backend/scripts/`:

```bash
# Trong SQL Server Management Studio
# File -> Open -> File -> Chọn add-avatar-column.sql -> Execute
```

**Cách 2: Chạy query thủ công**

```sql
USE [TakeCareMeDB]
GO

-- Kiểm tra và thêm cột avatar
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Elders' 
    AND COLUMN_NAME = 'avatar'
)
BEGIN
    ALTER TABLE [dbo].[Elders]
    ADD [avatar] NVARCHAR(255) NULL;
    
    PRINT 'Cột avatar đã được thêm thành công!';
END
ELSE
BEGIN
    PRINT 'Cột avatar đã tồn tại.';
END
GO
```

### Bước 3: Kiểm tra lại

```sql
-- Xem cấu trúc bảng Elders
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Elders'
ORDER BY ORDINAL_POSITION;
```

### Bước 4: Test lại chức năng

1. Khởi động lại backend server
2. Thử upload avatar cho một elder
3. Kiểm tra console log để xem:
   - "Creating elder with data:" - có avatar không?
   - "Saved elder - ID: X Avatar: ..." - avatar có được lưu không?
   - "Verified elder avatar from DB:" - avatar có trong DB không?

### Bước 5: Kiểm tra database trực tiếp

```sql
-- Xem dữ liệu avatar trong bảng Elders
SELECT 
    elder_id,
    full_name,
    avatar
FROM Elders
WHERE avatar IS NOT NULL;
```

## Lưu ý

- Đảm bảo database name đúng (thường là `TakeCareMeDB`)
- Nếu dùng database khác, thay `[TakeCareMeDB]` bằng tên database của bạn
- Sau khi thêm cột, khởi động lại backend server





