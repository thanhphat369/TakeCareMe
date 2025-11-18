import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionProfile } from '../../entities/nutrition-profile.entity';
import { ExerciseProfile } from '../../entities/exercise-profile.entity';
import { MobilityProfile } from '../../entities/mobility-profile.entity';
import { Elder } from '../../entities/elder.entity';
import { HealthProfilesController } from './health-profiles.controller';
import { HealthProfilesService } from './health-profiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NutritionProfile,
      ExerciseProfile,
      MobilityProfile,
      Elder,
    ]),
  ],
  controllers: [HealthProfilesController],
  providers: [HealthProfilesService],
  exports: [HealthProfilesService],
})
export class HealthProfilesModule {}