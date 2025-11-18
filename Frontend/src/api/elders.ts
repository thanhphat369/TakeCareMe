import { Elderly } from '../types';
import apiClient from '../api/apiClient';
import dayjs from 'dayjs';

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

// export interface CreateElderPayload {
//   fullName: string;
//   dob: string; // ISO 8601 date
//   gender: 'M' | 'F';
//   address?: string;
//   contactPhone?: string;
//   contactPersonId?: number;
// }

export interface CreateElderPayload {
  fullName: string
  dob: string;
  age: number;
  phone: string;
  gender: 'M' | 'F';
  avatar: string;
  address: string;
  note: string;
  contactPhone: string;
  insuranceInfo: string;
  contactPersonId: number;
};

// lấy danh sách elders
export async function fetchEldersController() {
  const res = await apiClient.get('/api/elders', { params: { page: 1, limit: 50 } });
  const raw = res.data?.data || res.data || [];
  const mapped: Elderly[] = raw.map((item: any) => ({
    id: item.elderId?.toString?.() || String(item.elderId || ''),
    fullName: item.fullName || '',
    dob: item.dob ? dayjs(item.dob) : null,
    age: item.age ?? null,
    phone: item.phone || '',
    gender: item.gender || '',
    address: item.address || '',
    avatar: item.avatar || null,
    email: item.user?.email || item.email || null,
    note: item.note || '',
    status: item.status || 'Active',
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
  
    familyName: item.familyName || null,
    familyPhone: item.familyPhone || null,
    relationship: item.relationship || null,
  }));
  return mapped;
}

export type UpdateElderPayload = Partial<CreateElderPayload>;

export async function listElders(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get('/api/elders', { params });
  return res.data?.data ?? res.data;
}

// export async function getElder(id: string | number): Promise<ElderDto> {
//   const res = await apiClient.get(`/api/elders/${id}`);
//   return res.data;
// }

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

export const getElder = async (elderId: number): Promise<Elderly | null> => {
  const res = await apiClient.get(`/api/elders/${elderId}/primary`);
  const data = res.data;
  if (!data) return null;
  
  // Map email từ user relation
  return {
    ...data,
    email: data.user?.email || data.email || null,
  } as Elderly;
};

// Re-export controller functions for backward compatibility
export { 
  createElderController, 
  updateElderController, 
  deleteElderController 
} from '../controllers/eldersController';


