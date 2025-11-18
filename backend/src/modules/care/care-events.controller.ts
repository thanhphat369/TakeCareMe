import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CareEventsService } from './care-events.service';
import { CreateCareEventDto } from './dto/create-care-event.dto';
import { UpdateCareEventDto } from './dto/update-care-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('care-events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CareEventsController {
	constructor(private readonly service: CareEventsService) {}

	@Post()
	@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
	create(@Body() dto: CreateCareEventDto) {
		return this.service.create(dto);
	}

	@Get()
	findAll(@Query('elderId') elderId?: string, @Query('scheduleId') scheduleId?: string) {
		return this.service.findAll({
			elderId: elderId ? Number(elderId) : undefined,
			scheduleId: scheduleId ? Number(scheduleId) : undefined,
		});
	}

	@Patch(':id')
	@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
	update(@Param('id') id: string, @Body() dto: UpdateCareEventDto) {
		return this.service.update(Number(id), dto);
	}

	@Delete(':id')
	@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
	remove(@Param('id') id: string) {
		return this.service.remove(Number(id));
	}
}










