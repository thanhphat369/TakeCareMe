import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  async create(@Body() createDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  async findAll(@Query('elderId') elderId: string, @Req() req) {
    const user = req.user; // Lấy user từ JWT token
    if (elderId) {
      return this.appointmentsService.findByElder(Number(elderId), user);
    }
    return this.appointmentsService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  async findOne(@Param('id') id: string, @Req() req) {
    const user = req.user; // Lấy user từ JWT token
    return this.appointmentsService.findOne(Number(id), user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  async update(@Param('id') id: string, @Body() updateDto: UpdateAppointmentDto, @Req() req) {
    const user = req.user; // Lấy user từ JWT token
    return this.appointmentsService.update(Number(id), updateDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  async remove(@Param('id') id: string, @Req() req) {
    const user = req.user; // Lấy user từ JWT token
    return this.appointmentsService.remove(Number(id), user);
  }
}