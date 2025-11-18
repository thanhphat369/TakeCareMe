import apiClient from './apiClient';

// Types
export interface NutritionProfile {
  nutritionId: number;
  elderId: number;
  elder?: {
    fullName: string;
    elderId: number;
  };
  dietaryRestrictions?: string;
  favoriteFoods?: string;
  allergies?: string;
  mealPreferences?: string;
  dailyCalories?: number;
  dailyWaterIntake?: number;
  specialDiet?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdate: Date;
}

export interface ExerciseProfile {
  exerciseId: number;
  elderId: number;
  elder?: {
    fullName: string;
    elderId: number;
  };
  exerciseType?: string;
  frequency?: string;
  duration?: string;
  intensity?: string;
  preferredActivities?: string;
  physicalLimitations?: string;
  weeklyGoalMinutes?: number;
  equipmentUsed?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdate: Date;
}

export interface CreateNutritionProfileDto {
  elderId: number;
  dietaryRestrictions?: string;
  favoriteFoods?: string;
  allergies?: string;
  mealPreferences?: string;
  dailyCalories?: number;
  dailyWaterIntake?: number;
  specialDiet?: string;
  notes?: string;
}

export interface UpdateNutritionProfileDto {
  dietaryRestrictions?: string;
  favoriteFoods?: string;
  allergies?: string;
  mealPreferences?: string;
  dailyCalories?: number;
  dailyWaterIntake?: number;
  specialDiet?: string;
  notes?: string;
}

export interface CreateExerciseProfileDto {
  elderId: number;
  exerciseType?: string;
  frequency?: string;
  duration?: string;
  intensity?: string;
  preferredActivities?: string;
  physicalLimitations?: string;
  weeklyGoalMinutes?: number;
  equipmentUsed?: string;
  notes?: string;
}

export interface UpdateExerciseProfileDto {
  exerciseType?: string;
  frequency?: string;
  duration?: string;
  intensity?: string;
  preferredActivities?: string;
  physicalLimitations?: string;
  weeklyGoalMinutes?: number;
  equipmentUsed?: string;
  notes?: string;
}

export interface CombinedProfile {
  elderId: number;
  nutritionProfile?: NutritionProfile;
  exerciseProfile?: ExerciseProfile;
}

export interface ImportResult {
  success: number;
  errors: string[];
}

export interface ProfileStatistics {
  totalNutritionProfiles: number;
  totalExerciseProfiles: number;
  profilesWithBoth: number;
  recentUpdates: number;
}

// API Functions
export const nutritionExerciseApi = {
  // Nutrition Profile APIs
  createNutritionProfile: (data: CreateNutritionProfileDto) =>
    apiClient.post('/nutrition-exercise/nutrition', data),

  getAllNutritionProfiles: () =>
    apiClient.get('/nutrition-exercise/nutrition'),

  getNutritionProfileById: (id: number) =>
    apiClient.get(`/nutrition-exercise/nutrition/${id}`),

  getNutritionProfileByElderId: (elderId: number) =>
    apiClient.get(`/nutrition-exercise/nutrition/elder/${elderId}`),

  updateNutritionProfile: (id: number, data: UpdateNutritionProfileDto) =>
    apiClient.put(`/nutrition-exercise/nutrition/${id}`, data),

  deleteNutritionProfile: (id: number) =>
    apiClient.delete(`/nutrition-exercise/nutrition/${id}`),

  // Exercise Profile APIs
  createExerciseProfile: (data: CreateExerciseProfileDto) =>
    apiClient.post('/nutrition-exercise/exercise', data),

  getAllExerciseProfiles: () =>
    apiClient.get('/nutrition-exercise/exercise'),

  getExerciseProfileById: (id: number) =>
    apiClient.get(`/nutrition-exercise/exercise/${id}`),

  getExerciseProfileByElderId: (elderId: number) =>
    apiClient.get(`/nutrition-exercise/exercise/elder/${elderId}`),

  updateExerciseProfile: (id: number, data: UpdateExerciseProfileDto) =>
    apiClient.put(`/nutrition-exercise/exercise/${id}`, data),

  deleteExerciseProfile: (id: number) =>
    apiClient.delete(`/nutrition-exercise/exercise/${id}`),

  // Combined Profile APIs
  getCombinedProfileByElderId: (elderId: number) =>
    apiClient.get(`/nutrition-exercise/combined/elder/${elderId}`),

  // Import APIs
  importNutritionProfiles: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/nutrition-exercise/nutrition/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  importExerciseProfiles: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/nutrition-exercise/exercise/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Export APIs
  exportNutritionProfiles: () =>
    apiClient.get('/nutrition-exercise/nutrition/export', {
      responseType: 'blob',
    }),

  exportExerciseProfiles: () =>
    apiClient.get('/nutrition-exercise/exercise/export', {
      responseType: 'blob',
    }),

  // Bulk Update APIs
  bulkUpdateNutritionProfiles: (updates: Array<{ id: number; data: UpdateNutritionProfileDto }>) =>
    apiClient.put('/nutrition-exercise/nutrition/bulk-update', updates),

  bulkUpdateExerciseProfiles: (updates: Array<{ id: number; data: UpdateExerciseProfileDto }>) =>
    apiClient.put('/nutrition-exercise/exercise/bulk-update', updates),

  // Statistics API
  getStatistics: () =>
    apiClient.get('/nutrition-exercise/statistics'),
};
