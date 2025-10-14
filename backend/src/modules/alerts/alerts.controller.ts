import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('api/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  findAll(
    @Query('elderId', ParseIntPipe) elderId?: number,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('assignedTo', ParseIntPipe) assignedTo?: number,
  ) {
    return this.alertsService.findAll({ elderId, status, severity, assignedTo });
  }

  @Get('statistics')
  getStatistics(@Query('elderId', ParseIntPipe) elderId?: number) {
    return this.alertsService.getStatistics(elderId);
  }

  @Get('recent')
  getRecentAlerts(
    @Query('elderId', ParseIntPipe) elderId?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.alertsService.getRecentAlerts(elderId, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id/acknowledge')
  @Roles(UserRole.STAFF, UserRole.DOCTOR, UserRole.ADMIN)
  acknowledge(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.alertsService.acknowledge(id, req.user.userId);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.STAFF, UserRole.DOCTOR, UserRole.ADMIN)
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body('notes') notes?: string,
  ) {
    return this.alertsService.resolve(id, notes);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  assignAlert(
    @Param('id', ParseIntPipe) id: number,
    @Body('staffId', ParseIntPipe) staffId: number,
  ) {
    return this.alertsService.assignAlert(id, staffId);
  }
}
