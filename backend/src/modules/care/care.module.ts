import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareSchedule } from '../../entities/care-schedule.entity';
import { CareEvent } from '../../entities/care-event.entity';
import { Elder } from '../../entities/elder.entity';
import { User } from '../../entities/user.entity';
import { CareSchedulesService } from './care-schedules.service';
import { CareSchedulesController } from './care-schedules.controller';
import { CareEventsService } from './care-events.service';
import { CareEventsController } from './care-events.controller';

@Module({
	imports: [TypeOrmModule.forFeature([CareSchedule, CareEvent, Elder, User])],
	controllers: [CareSchedulesController, CareEventsController],
	providers: [CareSchedulesService, CareEventsService],
	exports: [CareSchedulesService, CareEventsService],
})
export class CareModule {}










