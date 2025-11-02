// src/modules/medical-history/dto/create-medical-history.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMedicalHistoryDto {
  @IsNumber()
  elderId: number;

  @IsOptional()
  @IsString()
  diagnoses?: string; // JSON string

  @IsOptional()
  @IsString()
  allergies?: string; // JSON string

  @IsOptional()
  @IsString()
  chronicMedications?: string; // JSON string

  @IsOptional()
  bmi?: number;

  @IsOptional()
  updatedBy?: number;
}
