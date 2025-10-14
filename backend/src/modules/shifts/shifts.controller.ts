import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('api/shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  findAll(
    @Query('staffId', ParseIntPipe) staffId?: number,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.shiftsService.findAll({
      staffId,
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('my-shifts-today')
  @Roles(UserRole.STAFF, UserRole.DOCTOR)
  getMyShiftsToday(@Request() req) {
    return this.shiftsService.getMyShiftsToday(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShiftDto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.remove(id);
  }

  @Patch(':id/assign-elders')
  @Roles(UserRole.ADMIN)
  assignElders(
    @Param('id', ParseIntPipe) id: number,
    @Body('elderIds') elderIds: number[],
  ) {
    return this.shiftsService.assignElders(id, elderIds);
  }

  @Patch(':id/start')
  @Roles(UserRole.STAFF, UserRole.DOCTOR)
  startShift(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.startShift(id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.STAFF, UserRole.DOCTOR)
  completeShift(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.completeShift(id);
  }
}