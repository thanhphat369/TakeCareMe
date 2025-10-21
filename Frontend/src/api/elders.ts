import apiClient from './apiClient';

export interface ElderDto {
  elderId: number;
  fullName: string;
  dob: string; // ISO 8601 date
  gender: 'M' | 'F';
  address?: string;
  contactPhone?: string;
  contactPersonId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
}

export interface CreateElderPayload {
  fullName: string;
  dob: string; // ISO 8601 date
  gender: 'M' | 'F';
  address?: string;
  contactPhone?: string;
  contactPersonId?: number;
}

export type UpdateElderPayload = Partial<CreateElderPayload>;

export async function listElders(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get('/api/elders', { params });
  return res.data?.data ?? res.data;
}

export async function getElder(id: string | number): Promise<ElderDto> {
  const res = await apiClient.get(`/api/elders/${id}`);
  return res.data;
}

export async function createElder(payload: CreateElderPayload): Promise<ElderDto> {
  const res = await apiClient.post('/api/elders', payload);
  return res.data;
}

export async function updateElder(
  id: string | number,
  payload: UpdateElderPayload
): Promise<ElderDto> {
  const res = await apiClient.patch(`/api/elders/${id}`, payload);
  return res.data;
}

export async function deleteElder(id: string | number): Promise<void> {
  await apiClient.delete(`/api/elders/${id}`);
}

export async function updateMedicalHistory(
  id: string | number,
  medicalHistory: any
) {
  const res = await apiClient.patch(`/api/elders/${id}/medical-history`, medicalHistory);
  return res.data;
}


