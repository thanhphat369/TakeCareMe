import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elder } from '../../entities/elder.entity';
import { Alert } from '../../entities/alert.entity';
import { VitalReading } from '../../entities/vital-reading.entity';
import { User } from '../../entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Elder, Alert, VitalReading, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}