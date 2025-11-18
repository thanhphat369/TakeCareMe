import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionProfile } from '../../entities/nutrition-profile.entity';
import { ExerciseProfile } from '../../entities/exercise-profile.entity';
import { MobilityProfile } from '../../entities/mobility-profile.entity';
import { Elder } from '../../entities/elder.entity';
import {
  CreateNutritionProfileDto,
  UpdateNutritionProfileDto,
  CreateExerciseProfileDto,
  UpdateExerciseProfileDto,
  CreateMobilityProfileDto,
  UpdateMobilityProfileDto,
} from './dto/health-profiles.dto';

@Injectable()
export class HealthProfilesService {
  constructor(
    @InjectRepository(NutritionProfile)
    private nutritionRepository: Repository<NutritionProfile>,
    @InjectRepository(ExerciseProfile)
    private exerciseRepository: Repository<ExerciseProfile>,
    @InjectRepository(MobilityProfile)
    private mobilityRepository: Repository<MobilityProfile>,
    @InjectRepository(Elder)
    private elderRepository: Repository<Elder>,
  ) {}

  // Helper: Convert array to JSON string
  private arrayToString(arr: string[] | undefined): string | null {
    if (!arr || arr.length === 0) return null;
    return JSON.stringify(arr);
  }

  // Helper: Parse JSON string to array
  private stringToArray(str: string | null | undefined): string[] {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // ==================== NUTRITION PROFILE ====================

  async getNutritionProfile(elderId: number): Promise<any> {
    const profile = await this.nutritionRepository.findOne({
      where: { elderId },
    });

    if (!profile) {
      return null;
    }

    return {
      nutritionId: profile.nutritionId,
      elderId: profile.elderId,
      dietaryRestrictions: this.stringToArray(profile.dietaryRestrictions),
      preferredFoods: this.stringToArray(profile.favoriteFoods),
      nutritionNotes: profile.notes,
      lastUpdate: profile.lastUpdate,
    };
  }

  async createNutritionProfile(
    elderId: number,
    dto: CreateNutritionProfileDto,
  ): Promise<any> {
    // Check if elder exists
    const elder = await this.elderRepository.findOne({
      where: { elderId },
    });

    if (!elder) {
      throw new NotFoundException('Không tìm thấy người cao tuổi');
    }

    // Check if profile already exists
    const existing = await this.nutritionRepository.findOne({
      where: { elderId },
    });

    if (existing) {
      // Update instead
      return this.updateNutritionProfile(elderId, dto);
    }

    const profile = this.nutritionRepository.create({
      elderId,
      dietaryRestrictions: this.arrayToString(dto.dietaryRestrictions),
      favoriteFoods: this.arrayToString(dto.preferredFoods),
      notes: dto.nutritionNotes,
    });

    await this.nutritionRepository.save(profile);
    return this.getNutritionProfile(elderId);
  }

  async updateNutritionProfile(
    elderId: number,
    dto: UpdateNutritionProfileDto,
  ): Promise<any> {
    const profile = await this.nutritionRepository.findOne({
      where: { elderId },
    });

    if (!profile) {
      // Create if not exists
      return this.createNutritionProfile(elderId, dto);
    }

    if (dto.dietaryRestrictions !== undefined) {
      profile.dietaryRestrictions = this.arrayToString(dto.dietaryRestrictions);
    }
    if (dto.preferredFoods !== undefined) {
      profile.favoriteFoods = this.arrayToString(dto.preferredFoods);
    }
    if (dto.nutritionNotes !== undefined) {
      profile.notes = dto.nutritionNotes;
    }

    await this.nutritionRepository.save(profile);
    return this.getNutritionProfile(elderId);
  }

  async deleteNutritionProfile(elderId: number): Promise<void> {
    const result = await this.nutritionRepository.delete({ elderId });
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy hồ sơ dinh dưỡng');
    }
  }

  // ==================== EXERCISE PROFILE ====================

  async getExerciseProfile(elderId: number): Promise<any> {
    const profile = await this.exerciseRepository.findOne({
      where: { elderId },
    });

    if (!profile) {
      return null;
    }

    return {
      exerciseId: profile.exerciseId,
      elderId: profile.elderId,
      exerciseType: this.stringToArray(profile.exerciseType),
      exerciseFrequency: profile.frequency,
      exerciseNotes: profile.notes,
      lastUpdate: profile.lastUpdate,
    };
  }

  async createExerciseProfile(
    elderId: number,
    dto: CreateExerciseProfileDto,
  ): Promise<any> {
    const elder = await this.elderRepository.findOne({
      where: { elderId },
    });

    if (!elder) {
      throw new NotFoundException('Không tìm thấy người cao tuổi');
    }

    const existing = await this.exerciseRepository.findOne({
      where: { elderId },
    });

    if (existing) {
      return this.updateExerciseProfile(elderId, dto);
    }

    const profile = this.exerciseRepository.create({
      elderId,
      exerciseType: this.arrayToString(dto.exerciseType),
      frequency: dto.exerciseFrequency,
      notes: dto.exerciseNotes,
    });

    await this.exerciseRepository.save(profile);
    return this.getExerciseProfile(elderId);
  }

  async updateExerciseProfile(
    elderId: number,
    dto: UpdateExerciseProfileDto,
  ): Promise<any> {
    const profile = await this.exerciseRepository.findOne({
      where: { elderId },
    });

    if (!profile) {
      return this.createExerciseProfile(elderId, dto);
    }

    if (dto.exerciseType !== undefined) {
      profile.exerciseType = this.arrayToString(dto.exerciseType);
    }
    if (dto.exerciseFrequency !== undefined) {
      profile.frequency = dto.exerciseFrequency;
    }
    if (dto.exerciseNotes !== undefined) {
      profile.notes = dto.exerciseNotes;
    }

    await this.exerciseRepository.save(profile);
    return this.getExerciseProfile(elderId);
  }

  async deleteExerciseProfile(elderId: number): Promise<void> {
    const result = await this.exerciseRepository.delete({ elderId });
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy hồ sơ tập luyện');
    }
  }

  // ==================== MOBILITY PROFILE ====================

  async getMobilityProfile(elderId: number): Promise<any> {
    const profile = await this.mobilityRepository.findOne({
      where: { elderId },
    });

    if (!profile) {
      return null;
    }

    return {
      mobilityId: profile.mobilityId,
      elderId: profile.elderId,
      mobilityLevel: profile.mobilityLevel,
      assistiveDevices: this.stringToArray(profile.assistiveDevice),
      mobilityNotes: profile.notes,
      lastUpdate: profile.lastUpdate,
    };
  }

  async createMobilityProfile(
    elderId: number,
    dto: CreateMobilityProfileDto,
  ): Promise<any> {
    const elder = await this.elderRepository.findOne({
      where: { elderId },
    });

    if (!elder) {
      throw new NotFoundException('Không tìm thấy người cao tuổi');
    }

    const existing = await this.mobilityRepository.findOne({
      where: { elderId },
    });

    if (existing) {
      return this.updateMobilityProfile(elderId, dto);
    }

    const profile = this.mobilityRepository.create({
      elderId,
      mobilityLevel: dto.mobilityLevel,
      assistiveDevice: this.arrayToString(dto.assistiveDevices),
      notes: dto.mobilityNotes,
    });

    await this.mobilityRepository.save(profile);
    return this.getMobilityProfile(elderId);
  }

  async updateMobilityProfile(
    elderId: number,
    dto: UpdateMobilityProfileDto,
  ): Promise<any> {
    const profile = await this.mobilityRepository.findOne({
      where: { elderId },
    });

    if (!profile) {
      return this.createMobilityProfile(elderId, dto);
    }

    if (dto.mobilityLevel !== undefined) {
      profile.mobilityLevel = dto.mobilityLevel;
    }
    if (dto.assistiveDevices !== undefined) {
      profile.assistiveDevice = this.arrayToString(dto.assistiveDevices);
    }
    if (dto.mobilityNotes !== undefined) {
      profile.notes = dto.mobilityNotes;
    }

    await this.mobilityRepository.save(profile);
    return this.getMobilityProfile(elderId);
  }

  async deleteMobilityProfile(elderId: number): Promise<void> {
    const result = await this.mobilityRepository.delete({ elderId });
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy hồ sơ vận động');
    }
  }

  // ==================== GET ALL PROFILES ====================

  async getAllProfiles(elderId: number): Promise<any> {
    const [nutrition, exercise, mobility] = await Promise.all([
      this.getNutritionProfile(elderId),
      this.getExerciseProfile(elderId),
      this.getMobilityProfile(elderId),
    ]);

    return {
      nutrition,
      exercise,
      mobility,
    };
  }
}