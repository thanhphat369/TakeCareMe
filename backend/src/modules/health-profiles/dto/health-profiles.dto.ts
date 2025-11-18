import { IsOptional, IsString, IsArray } from 'class-validator';

// DTO cho Nutrition Profile
export class CreateNutritionProfileDto {
  @IsOptional()
  @IsArray()
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsArray()
  preferredFoods?: string[];

  @IsOptional()
  @IsString()
  nutritionNotes?: string;
}

export class UpdateNutritionProfileDto {
  @IsOptional()
  @IsArray()
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsArray()
  preferredFoods?: string[];

  @IsOptional()
  @IsString()
  nutritionNotes?: string;
}

// DTO cho Exercise Profile
export class CreateExerciseProfileDto {
  @IsOptional()
  @IsArray()
  exerciseType?: string[];

  @IsOptional()
  @IsString()
  exerciseFrequency?: string;

  @IsOptional()
  @IsString()
  exerciseNotes?: string;
}

export class UpdateExerciseProfileDto {
  @IsOptional()
  @IsArray()
  exerciseType?: string[];

  @IsOptional()
  @IsString()
  exerciseFrequency?: string;

  @IsOptional()
  @IsString()
  exerciseNotes?: string;
}

// DTO cho Mobility Profile
export class CreateMobilityProfileDto {
  @IsOptional()
  @IsString()
  mobilityLevel?: string;

  @IsOptional()
  @IsArray()
  assistiveDevices?: string[];

  @IsOptional()
  @IsString()
  mobilityNotes?: string;
}

export class UpdateMobilityProfileDto {
  @IsOptional()
  @IsString()
  mobilityLevel?: string;

  @IsOptional()
  @IsArray()
  assistiveDevices?: string[];

  @IsOptional()
  @IsString()
  mobilityNotes?: string;
}

// Combined DTO for all health profiles
export class UpdateHealthProfilesDto {
  @IsOptional()
  nutrition?: UpdateNutritionProfileDto;

  @IsOptional()
  exercise?: UpdateExerciseProfileDto;

  @IsOptional()
  mobility?: UpdateMobilityProfileDto;
}