import { IsNotEmpty, IsOptional, IsDateString, IsNumber, IsString, IsIn } from 'class-validator';

export class CreateAppointmentDto {
  @IsNumber()
  @IsNotEmpty()
  elderId: number;

  @IsNumber()
  @IsOptional()
  doctorId?: number;

  @IsNumber()
  @IsOptional()
  nurseId?: number;

  @IsString()
  @IsOptional()
  @IsIn(['Doctor', 'Nurse'])
  careType?: string;

  @IsDateString()
  @IsNotEmpty()
  visitDate: string;

  @IsDateString()
  @IsOptional()
  nextVisitDate?: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  status?: string;
}