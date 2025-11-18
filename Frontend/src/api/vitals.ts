import apiClient from './apiClient';

export interface VitalRecorder {
  userId: number;
  fullName: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface VitalReadingDto {
  vitalId?: number;
  recordId?: number;
  elderId: number;
  // New format: Direct vital sign fields
  systolic?: number | null;
  diastolic?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  bloodGlucose?: number | null;
  weight?: number | null;
  height?: number | null;
  notes?: string | null;
  // Legacy format: For backward compatibility
  type?: string;
  value?: number;
  unit?: string;
  timestamp: string;
  source: string;
  recorder?: VitalRecorder | null;
  recordedBy?: number | null;
}

export interface FetchVitalsParams {
  from?: string;
  to?: string;
  limit?: number;
}

export interface CreateVitalReadingInput {
  // New format: Direct vital sign fields
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  bloodGlucose?: number;
  weight?: number;
  height?: number;
  notes?: string;
  // Legacy format: For backward compatibility
  type?: string;
  value?: number;
  unit?: string;
  recordedBy?: number;
  source?: string;
}

export async function fetchVitalReadings(
  elderId: number,
  params?: FetchVitalsParams,
): Promise<VitalReadingDto[]> {
  const response = await apiClient.get(`/api/elders/${elderId}/vitals`, {
    params,
  });

  const payload = response.data?.data ?? response.data ?? [];
  return Array.isArray(payload) ? payload : [];
}

export async function createVitalReading(
  elderId: number,
  body: CreateVitalReadingInput,
): Promise<VitalReadingDto> {
  const response = await apiClient.post(`/api/elders/${elderId}/vitals`, body);
  const payload = response.data?.data ?? response.data;
  return payload as VitalReadingDto;
}

// Import nhiều chỉ số sức khỏe từ file Excel
export async function importVitals(file: File): Promise<{ 
  success: boolean; 
  message: string; 
  imported: number; 
  failed: number;
  errors?: string[];
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await apiClient.post('/api/vitals/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data?.data || res.data;
}






