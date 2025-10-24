import { IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateAppointmentDto {
  @IsNumber()
  @IsNotEmpty()
  elderId: number;

  @IsNumber()
  @IsOptional()
  doctorId?: number;

  @IsDateString()
  @IsNotEmpty()
  visitDate: Date;

  @IsDateString()
  @IsOptional()
  nextVisitDate?: Date;

  @IsOptional()
  notes?: string;

  @IsOptional()
  status?: string;
}