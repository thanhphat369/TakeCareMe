import { IsNotEmpty, IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateRehabilitationRecordDto {
  @IsNumber()
  @IsNotEmpty()
  elderId: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}








