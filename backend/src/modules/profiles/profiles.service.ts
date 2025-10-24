import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionProfile } from '../../entities/nutrition-profile.entity';
import { ExerciseProfile } from '../../entities/exercise-profile.entity';
import { MobilityProfile } from '../../entities/mobility-profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(NutritionProfile)
    private nutritionRepository: Repository<NutritionProfile>,
    @InjectRepository(ExerciseProfile)
    private exerciseRepository: Repository<ExerciseProfile>,
    @InjectRepository(MobilityProfile)
    private mobilityRepository: Repository<MobilityProfile>,
  ) {}

  // Nutrition Profile
  async createNutrition(elderId: number, data: any): Promise<NutritionProfile> {
    const profile = this.nutritionRepository.create({ elderId, ...data });
    return await this.nutritionRepository.save(profile as any);
  }

  async getNutritionByElder(elderId: number): Promise<NutritionProfile> {
    return this.nutritionRepository.findOne({ where: { elderId } });
  }

  async updateNutrition(elderId: number, data: any): Promise<NutritionProfile> {
    let profile = await this.getNutritionByElder(elderId);
    if (!profile) {
      return this.createNutrition(elderId, data);
    }
    Object.assign(profile, data);
    return this.nutritionRepository.save(profile);
  }

  // Exercise Profile
  async createExercise(elderId: number, data: any): Promise<ExerciseProfile> {
    const profile = this.exerciseRepository.create({ elderId, ...data });
    return await this.exerciseRepository.save(profile as any);
  }

  async getExerciseByElder(elderId: number): Promise<ExerciseProfile> {
    return this.exerciseRepository.findOne({ where: { elderId } });
  }

  async updateExercise(elderId: number, data: any): Promise<ExerciseProfile> {
    let profile = await this.getExerciseByElder(elderId);
    if (!profile) {
      return this.createExercise(elderId, data);
    }
    Object.assign(profile, data);
    return this.exerciseRepository.save(profile);
  }

  // Mobility Profile
  async createMobility(elderId: number, data: any): Promise<MobilityProfile> {
    const profile = this.mobilityRepository.create({ elderId, ...data });
    return await this.mobilityRepository.save(profile as any);
  }

  async getMobilityByElder(elderId: number): Promise<MobilityProfile> {
    return this.mobilityRepository.findOne({ where: { elderId } });
  }

  async updateMobility(elderId: number, data: any): Promise<MobilityProfile> {
    let profile = await this.getMobilityByElder(elderId);
    if (!profile) {
      return this.createMobility(elderId, data);
    }
    Object.assign(profile, data);
    return this.mobilityRepository.save(profile);
  }

  // Get all profiles for an elder
  async getAllProfilesByElder(elderId: number) {
    const [nutrition, exercise, mobility] = await Promise.all([
      this.getNutritionByElder(elderId),
      this.getExerciseByElder(elderId),
      this.getMobilityByElder(elderId),
    ]);

    return { nutrition, exercise, mobility };
  }
}