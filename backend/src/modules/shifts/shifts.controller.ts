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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll(
    @Query('staffId') staffId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.shiftsService.findAll({
      staffId: staffId ? parseInt(staffId, 10) : undefined,
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('my')
  @Roles(UserRole.STAFF, UserRole.DOCTOR)
  getMyShifts(
    @Request() req,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.shiftsService.getShiftsForStaff(req.user.userId, {
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN)
  assignElders(
    @Param('id', ParseIntPipe) id: number,
    @Body('elderIds') elderIds: number[],
  ) {
    return this.shiftsService.assignElders(id, elderIds);
  }

  @Patch(':id/start')
  @Roles(UserRole.DOCTOR, UserRole.STAFF)
  startShift(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.startShift(id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.DOCTOR, UserRole.STAFF)
  completeShift(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.completeShift(id);
  }

  @Post('import')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importShifts(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new (require('@nestjs/common').BadRequestException)('Không có file được upload');
    }
    return this.shiftsService.importShifts(file);
  }
}