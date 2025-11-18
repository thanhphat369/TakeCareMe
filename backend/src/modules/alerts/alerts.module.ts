import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from '../../entities/alert.entity';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { FamilyElder } from '../../entities/family-elder.entity';
import { User } from '../../entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, FamilyElder, User]), NotificationsModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}