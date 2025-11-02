import { IsNotEmpty, IsOptional, IsDateString,IsString, IsNumber } from 'class-validator';

export class CreateMedicationDto {
  @IsNumber()
  @IsNotEmpty()
  elderId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  dose?: string;

  @IsOptional()
  frequency?: string;

  @IsOptional()
  time?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsNumber()
  prescribedBy?: number;
}