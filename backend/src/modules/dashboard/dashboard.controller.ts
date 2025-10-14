import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('alert-trends')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getAlertTrends(@Query('days') days?: number) {
    return this.dashboardService.getAlertTrends(days ? +days : 7);
  }

  @Get('elder-statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getElderStatistics() {
    return this.dashboardService.getElderStatistics();
  }

  @Get('staff-performance')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getStaffPerformance() {
    return this.dashboardService.getStaffPerformance();
  }
}