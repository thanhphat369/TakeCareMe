import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftDto } from './create-shift.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @IsOptional()
  @IsIn(['Scheduled', 'InProgress', 'Completed', 'Cancelled'])
  status?: string;
}