import { IsNotEmpty, IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateLabResultDto {
  @IsNumber()
  @IsNotEmpty()
  elderId: number;

  @IsDateString()
  @IsOptional()
  testDate?: string;

  @IsString()
  @IsOptional()
  testType?: string;

  @IsString()
  @IsOptional()
  result?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}








