import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elder } from '../../entities/elder.entity';
import { FamilyElder } from '../../entities/family-elder.entity';
import { MedicalHistory } from '../../entities/medical-history.entity';
import { User } from '../../entities/user.entity';
import { EldersController } from './elders.controller';
import { EldersService } from './elders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Elder,
      FamilyElder,
      MedicalHistory,
      User,
    ]),
  ],
  controllers: [EldersController],
  providers: [EldersService],
  exports: [EldersService],
})
export class EldersModule {}