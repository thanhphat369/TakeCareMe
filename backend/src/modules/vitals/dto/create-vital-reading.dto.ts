import { IsNumber, IsOptional, IsString, IsIn, Min, Max } from 'class-validator';

export class CreateVitalReadingDto {
  @IsOptional()
  elderId?: number;

  @IsOptional()
  @IsString()
  @IsIn(['Manual', 'IoT'])
  source?: string;

  @IsOptional()
  @IsNumber()
  recordedBy?: number;

  // New format: Direct vital sign fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  systolic?: number; // Huyết áp tâm thu (mmHg)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  diastolic?: number; // Huyết áp tâm trương (mmHg)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  heartRate?: number; // Nhịp tim (bpm)

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature?: number; // Nhiệt độ (°C)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  spo2?: number; // SpO2 (%)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  bloodGlucose?: number; // Đường huyết (mg/dL)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  weight?: number; // Cân nặng (kg)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  height?: number; // Chiều cao (cm)

  @IsOptional()
  @IsString()
  notes?: string; // Ghi chú

  // Old format: For backward compatibility
  @IsOptional()
  @IsString()
  type?: string; // BP_SYSTOLIC, BP_DIASTOLIC, HEART_RATE, etc.

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}