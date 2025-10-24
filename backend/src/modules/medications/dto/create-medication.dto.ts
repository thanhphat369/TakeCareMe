import { IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateMedicationDto {
  @IsNumber()
  elderId: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  dose?: string;

  @IsOptional()
  frequency?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsNumber()
  prescribedBy?: number;

  @IsOptional()
  time?: string;
}


