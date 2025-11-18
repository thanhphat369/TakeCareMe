-- =====================================================
-- Script để sửa các avatar URL đã lưu full URL thành relative path
-- Chạy script này để migrate dữ liệu cũ
-- =====================================================

-- Kiểm tra và hiển thị các record có avatar là full URL
SELECT 
    elder_id,
    full_name,
    avatar,
    CASE 
        WHEN avatar LIKE 'http://%' OR avatar LIKE 'https://%' THEN 'Full URL - Cần sửa'
        ELSE 'OK'
    END AS status
FROM Elders
WHERE avatar IS NOT NULL AND avatar != ''
ORDER BY elder_id;

-- Sửa các avatar từ full URL thành relative path
-- Ví dụ: http://localhost:3000/uploads/avatars/file.jpg -> /uploads/avatars/file.jpg
--        https://example.com/uploads/avatars/file.jpg -> /uploads/avatars/file.jpg
UPDATE Elders
SET avatar = 
    CASE 
        -- Nếu là full URL, extract pathname (phần sau domain và port)
        WHEN avatar LIKE 'http://%' OR avatar LIKE 'https://%' THEN
            -- Tìm vị trí '/' đầu tiên sau domain/port
            -- Logic: Tìm '://' -> bỏ qua protocol -> tìm '/' đầu tiên sau domain/port
            SUBSTRING(
                avatar,
                -- Tìm vị trí '/' đầu tiên sau domain (có thể có port)
                -- Bắt đầu từ sau '://', tìm '/' đầu tiên
                CASE 
                    WHEN CHARINDEX('://', avatar) > 0 THEN
                        -- Tìm '/' đầu tiên sau '://' (sau domain và port nếu có)
                        -- Ví dụ: http://localhost:3000/uploads -> tìm '/' sau '3000'
                        -- Ví dụ: https://example.com/uploads -> tìm '/' sau 'com'
                        CHARINDEX('/', avatar, CHARINDEX('://', avatar) + 3)
                    ELSE 1
                END,
                LEN(avatar)
            )
        -- Nếu đã là relative path, giữ nguyên
        ELSE avatar
    END,
    updated_at = GETDATE()
WHERE avatar IS NOT NULL 
    AND avatar != ''
    AND (avatar LIKE 'http://%' OR avatar LIKE 'https://%');

-- Kiểm tra kết quả sau khi sửa
SELECT 
    elder_id,
    full_name,
    avatar,
    CASE 
        WHEN avatar LIKE 'http://%' OR avatar LIKE 'https://%' THEN 'Vẫn còn Full URL'
        WHEN avatar LIKE '/uploads/%' THEN 'OK - Relative Path'
        ELSE 'Cần kiểm tra'
    END AS status
FROM Elders
WHERE avatar IS NOT NULL AND avatar != ''
ORDER BY elder_id;

GO

