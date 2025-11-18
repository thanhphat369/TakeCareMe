import { IsNotEmpty, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateShiftDto {
  @IsInt()
  staffId: number;

  @IsDateString({}, { message: 'Thời gian bắt đầu không hợp lệ' })
  startTime: string;

  @IsDateString({}, { message: 'Thời gian kết thúc không hợp lệ' })
  endTime: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  note?: string;
}