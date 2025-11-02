// src/modules/medical-history/medical-history.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from '../../entities/medical-history.entity';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryController } from './medical-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalHistory])],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
