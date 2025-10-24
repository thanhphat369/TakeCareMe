import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionProfile } from '../../entities/nutrition-profile.entity';
import { ExerciseProfile } from '../../entities/exercise-profile.entity';
import { MobilityProfile } from '../../entities/mobility-profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NutritionProfile,
      ExerciseProfile,
      MobilityProfile,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}