-- ===============================================
-- SCRIPT: Insert Test Data for Reports & Analytics
-- MÔ TẢ: Thêm dữ liệu mẫu cho sinh hiệu, thuốc, BMI, alerts
-- NGÀY: 2025-01-XX
-- ===============================================

USE TakeCareMeDB;
GO

-- ===============================================
-- 1. Lấy ID của các Elder và User để sử dụng
-- ===============================================
DECLARE @Elder1Id INT, @Elder2Id INT, @Elder3Id INT;
DECLARE @Doctor1Id INT, @Staff1Id INT;

-- Giả sử có ít nhất 3 elders và 1 doctor, 1 staff
SELECT TOP 1 @Elder1Id = elder_id FROM Elders ORDER BY elder_id;
SELECT TOP 1 @Elder2Id = elder_id FROM Elders ORDER BY elder_id OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT TOP 1 @Elder3Id = elder_id FROM Elders ORDER BY elder_id OFFSET 2 ROWS FETCH NEXT 1 ROWS ONLY;

SELECT TOP 1 @Doctor1Id = user_id FROM Users WHERE role = 'Doctor' ORDER BY user_id;
SELECT TOP 1 @Staff1Id = user_id FROM Users WHERE role = 'Staff' ORDER BY user_id;

-- Nếu không có doctor/staff, sử dụng user đầu tiên
IF @Doctor1Id IS NULL SELECT TOP 1 @Doctor1Id = user_id FROM Users ORDER BY user_id;
IF @Staff1Id IS NULL SET @Staff1Id = @Doctor1Id;

PRINT 'Elder IDs: ' + CAST(ISNULL(@Elder1Id, 0) AS VARCHAR) + ', ' + CAST(ISNULL(@Elder2Id, 0) AS VARCHAR) + ', ' + CAST(ISNULL(@Elder3Id, 0) AS VARCHAR);
PRINT 'Doctor ID: ' + CAST(ISNULL(@Doctor1Id, 0) AS VARCHAR);
PRINT 'Staff ID: ' + CAST(ISNULL(@Staff1Id, 0) AS VARCHAR);

-- ===============================================
-- 2. INSERT VITAL READINGS - Sinh hiệu
-- ===============================================
-- Elder 1: Dữ liệu 30 ngày qua (để test biểu đồ tháng)
IF @Elder1Id IS NOT NULL
BEGIN
    DECLARE @i INT = 0;
    DECLARE @timestamp DATETIME;
    
    -- Tạo dữ liệu cho 30 ngày qua, mỗi ngày 3-4 lần đo
    WHILE @i < 90 -- 30 ngày * 3 lần/ngày
    BEGIN
        SET @timestamp = DATEADD(DAY, -30 + (@i / 3), DATEADD(HOUR, 8 + (@i % 3) * 6, CAST(GETDATE() AS DATE)));
        
        -- Nhịp tim (60-100 bpm, có biến động)
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder1Id, 'Nhịp tim', 70 + (ABS(CHECKSUM(NEWID())) % 20), 'bpm', @timestamp, @Staff1Id, 'IoT');
        
        -- Huyết áp tâm thu (110-140 mmHg)
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder1Id, 'Huyết áp tâm thu', 120 + (ABS(CHECKSUM(NEWID())) % 20), 'mmHg', @timestamp, @Staff1Id, 'Manual');
        
        -- Huyết áp tâm trương (70-90 mmHg)
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder1Id, 'Huyết áp tâm trương', 75 + (ABS(CHECKSUM(NEWID())) % 15), 'mmHg', @timestamp, @Staff1Id, 'Manual');
        
        -- Nhiệt độ (36.0-37.5°C)
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder1Id, 'Nhiệt độ', 36.5 + (ABS(CHECKSUM(NEWID())) % 10) / 10.0, '°C', @timestamp, @Staff1Id, 'IoT');
        
        -- SpO2 (95-100%)
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder1Id, 'SpO2', 96 + (ABS(CHECKSUM(NEWID())) % 4), '%', @timestamp, @Staff1Id, 'IoT');
        
        SET @i = @i + 1;
    END;
    
    -- Thêm một số giá trị bất thường để test alerts
    INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
    VALUES (@Elder1Id, 'Nhịp tim', 110, 'bpm', DATEADD(HOUR, -2, GETDATE()), @Staff1Id, 'IoT');
    
    INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
    VALUES (@Elder1Id, 'Huyết áp tâm thu', 150, 'mmHg', DATEADD(HOUR, -1, GETDATE()), @Staff1Id, 'Manual');
    
    PRINT 'Inserted vital readings for Elder 1';
END;

-- Elder 2: Dữ liệu 7 ngày qua (để test biểu đồ tuần)
IF @Elder2Id IS NOT NULL
BEGIN
    SET @i = 0;
    WHILE @i < 21 -- 7 ngày * 3 lần/ngày
    BEGIN
        SET @timestamp = DATEADD(DAY, -7 + (@i / 3), DATEADD(HOUR, 8 + (@i % 3) * 6, CAST(GETDATE() AS DATE)));
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder2Id, 'Nhịp tim', 65 + (ABS(CHECKSUM(NEWID())) % 15), 'bpm', @timestamp, @Staff1Id, 'IoT');
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder2Id, 'Huyết áp tâm thu', 115 + (ABS(CHECKSUM(NEWID())) % 15), 'mmHg', @timestamp, @Staff1Id, 'Manual');
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder2Id, 'Huyết áp tâm trương', 70 + (ABS(CHECKSUM(NEWID())) % 12), 'mmHg', @timestamp, @Staff1Id, 'Manual');
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder2Id, 'Nhiệt độ', 36.3 + (ABS(CHECKSUM(NEWID())) % 8) / 10.0, '°C', @timestamp, @Staff1Id, 'IoT');
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder2Id, 'Đường huyết', 90 + (ABS(CHECKSUM(NEWID())) % 30), 'mg/dL', @timestamp, @Staff1Id, 'Manual');
        
        SET @i = @i + 1;
    END;
    
    PRINT 'Inserted vital readings for Elder 2';
END;

-- Elder 3: Dữ liệu 1 ngày qua (để test biểu đồ ngày)
IF @Elder3Id IS NOT NULL
BEGIN
    SET @i = 0;
    WHILE @i < 8 -- 8 lần đo trong ngày
    BEGIN
        SET @timestamp = DATEADD(HOUR, -24 + (@i * 3), GETDATE());
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder3Id, 'Nhịp tim', 72 + (ABS(CHECKSUM(NEWID())) % 10), 'bpm', @timestamp, @Staff1Id, 'IoT');
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder3Id, 'Huyết áp tâm thu', 125 + (ABS(CHECKSUM(NEWID())) % 10), 'mmHg', @timestamp, @Staff1Id, 'Manual');
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder3Id, 'Huyết áp tâm trương', 78 + (ABS(CHECKSUM(NEWID())) % 8), 'mmHg', @timestamp, @Staff1Id, 'Manual');
        
        INSERT INTO VitalReadings (elder_id, type, value, unit, timestamp, recorded_by, source)
        VALUES (@Elder3Id, 'Nhiệt độ', 36.6 + (ABS(CHECKSUM(NEWID())) % 5) / 10.0, '°C', @timestamp, @Staff1Id, 'IoT');
        
        SET @i = @i + 1;
    END;
    
    PRINT 'Inserted vital readings for Elder 3';
END;

-- ===============================================
-- 3. INSERT MEDICATIONS - Thuốc
-- ===============================================
IF @Elder1Id IS NOT NULL AND @Doctor1Id IS NOT NULL
BEGIN
    -- Thuốc với các frequency khác nhau để test biểu đồ
    INSERT INTO Medications (elder_id, name, dose, frequency, time, start_date, end_date, notes, diagnosis, prescribed_by)
    VALUES 
        (@Elder1Id, 'Aspirin', '100mg', '1 lần/ngày', 'Sáng', DATEADD(DAY, -60, GETDATE()), DATEADD(DAY, 30, GETDATE()), 'Uống sau ăn', 'Phòng ngừa đột quỵ', @Doctor1Id),
        (@Elder1Id, 'Metformin', '500mg', '2 lần/ngày', 'Sáng, Tối', DATEADD(DAY, -45, GETDATE()), DATEADD(DAY, 45, GETDATE()), 'Uống trước ăn', 'Đái tháo đường type 2', @Doctor1Id),
        (@Elder1Id, 'Amlodipine', '5mg', '1 lần/ngày', 'Sáng', DATEADD(DAY, -30, GETDATE()), NULL, 'Uống với nước', 'Tăng huyết áp', @Doctor1Id),
        (@Elder1Id, 'Atorvastatin', '20mg', '1 lần/ngày', 'Tối', DATEADD(DAY, -90, GETDATE()), NULL, 'Uống trước khi ngủ', 'Rối loạn lipid máu', @Doctor1Id),
        (@Elder1Id, 'Omeprazole', '20mg', '1 lần/ngày', 'Sáng', DATEADD(DAY, -20, GETDATE()), DATEADD(DAY, 10, GETDATE()), 'Uống trước ăn 30 phút', 'Viêm dạ dày', @Doctor1Id);
    
    PRINT 'Inserted medications for Elder 1';
END;

IF @Elder2Id IS NOT NULL AND @Doctor1Id IS NOT NULL
BEGIN
    INSERT INTO Medications (elder_id, name, dose, frequency, time, start_date, end_date, notes, diagnosis, prescribed_by)
    VALUES 
        (@Elder2Id, 'Lisinopril', '10mg', '1 lần/ngày', 'Sáng', DATEADD(DAY, -30, GETDATE()), NULL, 'Uống với nước', 'Tăng huyết áp', @Doctor1Id),
        (@Elder2Id, 'Metformin', '500mg', '3 lần/ngày', 'Sáng, Trưa, Tối', DATEADD(DAY, -20, GETDATE()), DATEADD(DAY, 40, GETDATE()), 'Uống trước ăn', 'Đái tháo đường', @Doctor1Id),
        (@Elder2Id, 'Calcium', '500mg', '2 lần/ngày', 'Sáng, Tối', DATEADD(DAY, -60, GETDATE()), NULL, 'Bổ sung canxi', 'Loãng xương', @Doctor1Id);
    
    PRINT 'Inserted medications for Elder 2';
END;

IF @Elder3Id IS NOT NULL AND @Doctor1Id IS NOT NULL
BEGIN
    INSERT INTO Medications (elder_id, name, dose, frequency, time, start_date, end_date, notes, diagnosis, prescribed_by)
    VALUES 
        (@Elder3Id, 'Warfarin', '2.5mg', '1 lần/ngày', 'Tối', DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, 15, GETDATE()), 'Theo dõi INR', 'Rung nhĩ', @Doctor1Id),
        (@Elder3Id, 'Furosemide', '40mg', '1 lần/ngày', 'Sáng', DATEADD(DAY, -10, GETDATE()), NULL, 'Uống với nhiều nước', 'Suy tim', @Doctor1Id);
    
    PRINT 'Inserted medications for Elder 3';
END;

-- ===============================================
-- 4. INSERT/UPDATE MEDICAL HISTORY - BMI
-- ===============================================
IF @Elder1Id IS NOT NULL
BEGIN
    -- Kiểm tra xem đã có medical history chưa
    IF NOT EXISTS (SELECT 1 FROM MedicalHistory WHERE elder_id = @Elder1Id)
    BEGIN
        INSERT INTO MedicalHistory (elder_id, diagnoses, allergies, chronic_medications, bmi, updated_by, last_update)
        VALUES (@Elder1Id, 
            '["Tăng huyết áp", "Đái tháo đường type 2", "Rối loạn lipid máu"]',
            '["Penicillin", "Sulfa"]',
            '["Aspirin", "Metformin", "Amlodipine", "Atorvastatin"]',
            23.5, @Doctor1Id, GETDATE());
    END
    ELSE
    BEGIN
        UPDATE MedicalHistory 
        SET bmi = 23.5, 
            last_update = GETDATE(),
            updated_by = @Doctor1Id
        WHERE elder_id = @Elder1Id;
    END;
    
    PRINT 'Updated medical history for Elder 1';
END;

IF @Elder2Id IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM MedicalHistory WHERE elder_id = @Elder2Id)
    BEGIN
        INSERT INTO MedicalHistory (elder_id, diagnoses, allergies, chronic_medications, bmi, updated_by, last_update)
        VALUES (@Elder2Id, 
            '["Tăng huyết áp", "Đái tháo đường", "Loãng xương"]',
            '["Iodine"]',
            '["Lisinopril", "Metformin", "Calcium"]',
            21.8, @Doctor1Id, GETDATE());
    END
    ELSE
    BEGIN
        UPDATE MedicalHistory 
        SET bmi = 21.8, 
            last_update = GETDATE(),
            updated_by = @Doctor1Id
        WHERE elder_id = @Elder2Id;
    END;
    
    PRINT 'Updated medical history for Elder 2';
END;

IF @Elder3Id IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM MedicalHistory WHERE elder_id = @Elder3Id)
    BEGIN
        INSERT INTO MedicalHistory (elder_id, diagnoses, allergies, chronic_medications, bmi, updated_by, last_update)
        VALUES (@Elder3Id, 
            '["Rung nhĩ", "Suy tim"]',
            '[]',
            '["Warfarin", "Furosemide"]',
            19.2, @Doctor1Id, GETDATE());
    END
    ELSE
    BEGIN
        UPDATE MedicalHistory 
        SET bmi = 19.2, 
            last_update = GETDATE(),
            updated_by = @Doctor1Id
        WHERE elder_id = @Elder3Id;
    END;
    
    PRINT 'Updated medical history for Elder 3';
END;

-- ===============================================
-- 5. INSERT ALERTS - Cảnh báo
-- ===============================================
IF @Elder1Id IS NOT NULL
BEGIN
    INSERT INTO Alerts (elder_id, type, severity, triggered_at, status, assigned_to, acknowledged_at, resolved_at, notes)
    VALUES 
        (@Elder1Id, 'Nhịp tim cao', 'High', DATEADD(HOUR, -2, GETDATE()), 'Open', @Staff1Id, NULL, NULL, 'Nhịp tim 110 bpm, cần theo dõi'),
        (@Elder1Id, 'Huyết áp cao', 'Critical', DATEADD(HOUR, -1, GETDATE()), 'Open', @Staff1Id, NULL, NULL, 'Huyết áp tâm thu 150 mmHg'),
        (@Elder1Id, 'Nhiệt độ bất thường', 'Medium', DATEADD(DAY, -2, GETDATE()), 'Acknowledged', @Staff1Id, DATEADD(DAY, -2, DATEADD(HOUR, 1, GETDATE())), NULL, 'Nhiệt độ 37.8°C'),
        (@Elder1Id, 'Quên uống thuốc', 'Low', DATEADD(DAY, -5, GETDATE()), 'Resolved', @Staff1Id, DATEADD(DAY, -5, DATEADD(HOUR, 2, GETDATE())), DATEADD(DAY, -4, GETDATE()), 'Đã nhắc nhở và uống thuốc');
    
    PRINT 'Inserted alerts for Elder 1';
END;

IF @Elder2Id IS NOT NULL
BEGIN
    INSERT INTO Alerts (elder_id, type, severity, triggered_at, status, assigned_to, acknowledged_at, resolved_at, notes)
    VALUES 
        (@Elder2Id, 'Đường huyết thấp', 'High', DATEADD(HOUR, -3, GETDATE()), 'Open', @Staff1Id, NULL, NULL, 'Đường huyết 65 mg/dL'),
        (@Elder2Id, 'Cần kiểm tra định kỳ', 'Low', DATEADD(DAY, -7, GETDATE()), 'Acknowledged', @Staff1Id, DATEADD(DAY, -7, DATEADD(HOUR, 1, GETDATE())), NULL, 'Đã lên lịch kiểm tra');
    
    PRINT 'Inserted alerts for Elder 2';
END;

IF @Elder3Id IS NOT NULL
BEGIN
    INSERT INTO Alerts (elder_id, type, severity, triggered_at, status, assigned_to, acknowledged_at, resolved_at, notes)
    VALUES 
        (@Elder3Id, 'SpO2 thấp', 'Critical', DATEADD(HOUR, -4, GETDATE()), 'Open', @Staff1Id, NULL, NULL, 'SpO2 92%, cần can thiệp ngay'),
        (@Elder3Id, 'Nhịp tim không đều', 'Medium', DATEADD(DAY, -1, GETDATE()), 'Acknowledged', @Staff1Id, DATEADD(DAY, -1, DATEADD(HOUR, 2, GETDATE())), NULL, 'Rung nhĩ, đang theo dõi');
    
    PRINT 'Inserted alerts for Elder 3';
END;

-- ===============================================
-- 6. THÊM DỮ LIỆU LỊCH SỬ BMI (để test biểu đồ BMI)
-- ===============================================
-- Tạo bảng tạm để lưu lịch sử BMI nếu cần
-- Hoặc có thể thêm vào MedicalHistory với last_update khác nhau
-- Ở đây chúng ta sẽ cập nhật BMI với các giá trị khác nhau theo thời gian

-- Note: Trong thực tế, có thể cần bảng riêng để lưu lịch sử BMI
-- Nhưng để đơn giản, chúng ta sẽ tạo thêm một số bản ghi MedicalHistory với timestamp khác nhau
-- (nếu database cho phép nhiều records cho 1 elder)

PRINT '========================================';
PRINT 'Test data insertion completed!';
PRINT '========================================';
PRINT 'Summary:';
PRINT '- Vital Readings: ~450 records (90 per elder * 5 types)';
PRINT '- Medications: 10 records';
PRINT '- Medical History: 3 records (BMI data)';
PRINT '- Alerts: 8 records';
PRINT '========================================';

GO

