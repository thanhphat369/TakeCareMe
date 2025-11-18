import { PartialType } from '@nestjs/mapped-types';
import { CreateCareScheduleDto } from './create-care-schedule.dto';

export class UpdateCareScheduleDto extends PartialType(CreateCareScheduleDto) {}










