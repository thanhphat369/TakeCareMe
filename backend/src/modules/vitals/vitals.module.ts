import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitalReading } from '../../entities/vital-reading.entity';
import { Elder } from '../../entities/elder.entity';
import { User } from '../../entities/user.entity';
import { VitalsController } from './vitals.controller';
import { VitalsService } from './vitals.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VitalReading, Elder, User]),
    AlertsModule,
  ],
  controllers: [VitalsController],
  providers: [VitalsService],
  exports: [VitalsService],
})
export class VitalsModule {}