import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateVitalReadingDto {
  @IsOptional()
  elderId?: number;

  @IsNotEmpty()
  type: string;

  @IsNumber()
  value: number;

  @IsNotEmpty()
  unit: string;

  @IsOptional()
  recordedBy?: number;

  @IsOptional()
  notes?: string;

  @IsOptional()
  source?: string;
}