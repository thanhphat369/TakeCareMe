import apiClient from './apiClient';

// Types
export interface NutritionProfile {
  nutritionId: number;
  elderId: number;
  dietaryRestrictions: string[];
  preferredFoods: string[];
  nutritionNotes: string;
  lastUpdate: Date;
}

export interface ExerciseProfile {
  exerciseId: number;
  elderId: number;
  exerciseType: string[];
  exerciseFrequency: string;
  exerciseNotes: string;
  lastUpdate: Date;
}

export interface MobilityProfile {
  mobilityId: number;
  elderId: number;
  mobilityLevel: string;
  assistiveDevices: string[];
  mobilityNotes: string;
  lastUpdate: Date;
}

export interface AllHealthProfiles {
  nutrition: NutritionProfile | null;
  exercise: ExerciseProfile | null;
  mobility: MobilityProfile | null;
}

// ==================== GET ALL PROFILES ====================

export const getAllHealthProfiles = async (
  elderId: number
): Promise<AllHealthProfiles> => {
  const response = await apiClient.get(
    `/api/elders/${elderId}/health-profiles`
  );
  return response.data;
};

// ==================== NUTRITION PROFILE ====================

export const getNutritionProfile = async (
  elderId: number
): Promise<NutritionProfile | null> => {
  const response = await apiClient.get(
    `/api/elders/${elderId}/health-profiles/nutrition`
  );
  return response.data;
};

export const createNutritionProfile = async (
  elderId: number,
  data: {
    dietaryRestrictions?: string[];
    preferredFoods?: string[];
    nutritionNotes?: string;
  }
): Promise<NutritionProfile> => {
  const response = await apiClient.post(
    `/api/elders/${elderId}/health-profiles/nutrition`,
    data
  );
  return response.data;
};

export const updateNutritionProfile = async (
  elderId: number,
  data: {
    dietaryRestrictions?: string[];
    preferredFoods?: string[];
    nutritionNotes?: string;
  }
): Promise<NutritionProfile> => {
  const response = await apiClient.put(
    `/api/elders/${elderId}/health-profiles/nutrition`,
    data
  );
  return response.data;
};

export const deleteNutritionProfile = async (elderId: number): Promise<void> => {
  await apiClient.delete(
    `/api/elders/${elderId}/health-profiles/nutrition`
  );
};

// ==================== EXERCISE PROFILE ====================

export const getExerciseProfile = async (
  elderId: number
): Promise<ExerciseProfile | null> => {
  const response = await apiClient.get(
    `/api/elders/${elderId}/health-profiles/exercise`
  );
  return response.data;
};

export const createExerciseProfile = async (
  elderId: number,
  data: {
    exerciseType?: string[];
    exerciseFrequency?: string;
    exerciseNotes?: string;
  }
): Promise<ExerciseProfile> => {
  const response = await apiClient.post(
    `/api/elders/${elderId}/health-profiles/exercise`,
    data
  );
  return response.data;
};

export const updateExerciseProfile = async (
  elderId: number,
  data: {
    exerciseType?: string[];
    exerciseFrequency?: string;
    exerciseNotes?: string;
  }
): Promise<ExerciseProfile> => {
  const response = await apiClient.put(
    `/api/elders/${elderId}/health-profiles/exercise`,
    data
  );
  return response.data;
};

export const deleteExerciseProfile = async (elderId: number): Promise<void> => {
  await apiClient.delete(
    `/api/elders/${elderId}/health-profiles/exercise`
  );
};

// ==================== MOBILITY PROFILE ====================

export const getMobilityProfile = async (
  elderId: number
): Promise<MobilityProfile | null> => {
  const response = await apiClient.get(
    `/api/elders/${elderId}/health-profiles/mobility`
  );
  return response.data;
};

export const createMobilityProfile = async (
  elderId: number,
  data: {
    mobilityLevel?: string;
    assistiveDevices?: string[];
    mobilityNotes?: string;
  }
): Promise<MobilityProfile> => {
  const response = await apiClient.post(
    `/api/elders/${elderId}/health-profiles/mobility`,
    data
  );
  return response.data;
};

export const updateMobilityProfile = async (
  elderId: number,
  data: {
    mobilityLevel?: string;
    assistiveDevices?: string[];
    mobilityNotes?: string;
  }
): Promise<MobilityProfile> => {
  const response = await apiClient.put(
    `/api/elders/${elderId}/health-profiles/mobility`,
    data
  );
  return response.data;
};

export const deleteMobilityProfile = async (elderId: number): Promise<void> => {
  await apiClient.delete(
    `/api/elders/${elderId}/health-profiles/mobility`
  );
};