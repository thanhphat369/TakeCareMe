import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { KpiService } from './kpi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('api/kpi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('staff/:staffId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  getStaffKPI(
    @Param('staffId', ParseIntPipe) staffId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.kpiService.getStaffKPI(staffId, {
      staffId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('staff')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  getAllStaffKPIs(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('department') department?: string,
  ) {
    return this.kpiService.getAllStaffKPIs({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      department,
    });
  }

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  getKPISummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('department') department?: string,
  ) {
    return this.kpiService.getKPISummary({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      department,
    });
  }

  @Get('staff/:staffId/care-history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  getCareHistory(
    @Param('staffId', ParseIntPipe) staffId: number,
    @Query('limit') limit?: string,
  ) {
    return this.kpiService.getCareHistory(
      staffId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('staff/:staffId/alert-history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  getAlertHistory(
    @Param('staffId', ParseIntPipe) staffId: number,
    @Query('limit') limit?: string,
  ) {
    return this.kpiService.getAlertHistory(
      staffId,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}

