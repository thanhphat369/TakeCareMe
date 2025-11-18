import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateCareEventDto {
	@IsInt()
	elderId: number;

	@IsOptional()
	@IsInt()
	scheduleId?: number | null;

	@IsString()
	type: string;

	@IsOptional()
	@IsString()
	notes?: string | null;

	@IsOptional()
	@IsDateString()
	timestamp?: string | null;

	@IsOptional()
	@IsInt()
	performedBy?: number | null;
}










