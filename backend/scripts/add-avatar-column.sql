-- Script để thêm cột avatar vào bảng Elders
-- Chạy script này trong SQL Server Management Studio hoặc Azure Data Studio

USE [TakeCareMeDB]
GO

-- Kiểm tra xem cột avatar đã tồn tại chưa
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Elders' 
    AND COLUMN_NAME = 'avatar'
)
BEGIN
    -- Thêm cột avatar nếu chưa tồn tại
    ALTER TABLE [dbo].[Elders]
    ADD [avatar] NVARCHAR(255) NULL;
    
    PRINT 'Cột avatar đã được thêm vào bảng Elders thành công!';
END
ELSE
BEGIN
    PRINT 'Cột avatar đã tồn tại trong bảng Elders.';
END
GO

-- Kiểm tra lại cột đã được thêm
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Elders' 
AND COLUMN_NAME = 'avatar';
GO








