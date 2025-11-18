import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RehabilitationRecord } from '../../entities/rehabilitation-record.entity';
import { RehabilitationRecordsController } from './rehabilitation-records.controller';
import { RehabilitationRecordsService } from './rehabilitation-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([RehabilitationRecord])],
  controllers: [RehabilitationRecordsController],
  providers: [RehabilitationRecordsService],
  exports: [RehabilitationRecordsService],
})
export class RehabilitationRecordsModule {}








