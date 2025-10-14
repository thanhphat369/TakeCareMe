import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../../entities/device.entity';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { VitalsModule } from '../vitals/vitals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    VitalsModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
