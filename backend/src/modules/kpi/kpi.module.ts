import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';
import { CareEvent } from '../../entities/care-event.entity';
import { Alert } from '../../entities/alert.entity';
import { Staff } from '../../entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareEvent, Alert, Staff])],
  controllers: [KpiController],
  providers: [KpiService],
  exports: [KpiService],
})
export class KpiModule {}













