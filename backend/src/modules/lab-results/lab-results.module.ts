import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabResult } from '../../entities/lab-result.entity';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';

@Module({
  imports: [TypeOrmModule.forFeature([LabResult])],
  controllers: [LabResultsController],
  providers: [LabResultsService],
  exports: [LabResultsService],
})
export class LabResultsModule {}








