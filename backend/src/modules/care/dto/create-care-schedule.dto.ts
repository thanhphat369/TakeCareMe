import { IsInt, IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class CreateCareScheduleDto {
	@IsInt()
	elderId: number;

	@IsString()
	type: string;

	@IsString()
	recurrence: string;

	@IsOptional()
	@IsDateString()
	startTime?: string | null;

	@IsOptional()
	@IsDateString()
	endTime?: string | null;

	@IsOptional()
	@IsInt()
	assignedTo?: number | null;

	@IsOptional()
	@IsString()
	@IsIn(['Active', 'Inactive'])
	status?: string;
}










