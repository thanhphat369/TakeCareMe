import { PartialType } from '@nestjs/mapped-types';
import { CreateCareEventDto } from './create-care-event.dto';

export class UpdateCareEventDto extends PartialType(CreateCareEventDto) {}










