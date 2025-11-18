import { PartialType } from '@nestjs/mapped-types';
import { CreateRehabilitationRecordDto } from './create-rehabilitation-record.dto';

export class UpdateRehabilitationRecordDto extends PartialType(CreateRehabilitationRecordDto) {}








