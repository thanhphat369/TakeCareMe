import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CareSchedulesService } from './care-schedules.service';
import { CreateCareScheduleDto } from './dto/create-care-schedule.dto';
import { UpdateCareScheduleDto } from './dto/update-care-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('care-schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CareSchedulesController {
	constructor(private readonly service: CareSchedulesService) {}

	@Post()
	@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
	create(@Body() dto: CreateCareScheduleDto) {
		return this.service.create(dto);
	}

	@Get()
	findAll(@Query('elderId') elderId?: string, @Query('status') status?: string) {
		return this.service.findAll({
			elderId: elderId ? Number(elderId) : undefined,
			status: status || undefined,
		});
	}

	@Patch(':id')
	@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
	update(@Param('id') id: string, @Body() dto: UpdateCareScheduleDto) {
		return this.service.update(Number(id), dto);
	}

	@Delete(':id')
	@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
	remove(@Param('id') id: string) {
		return this.service.remove(Number(id));
	}
}










