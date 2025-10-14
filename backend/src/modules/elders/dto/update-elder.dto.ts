import { PartialType } from '@nestjs/mapped-types';
import { CreateElderDto } from './create-elder.dto';

export class UpdateElderDto extends PartialType(CreateElderDto) {}