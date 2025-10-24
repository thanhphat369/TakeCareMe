import { Elderly } from '../types';
import apiClient from '../api/apiClient';
import dayjs from 'dayjs';

/**
 * 🔹 Lấy danh sách Elder
 */
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
    contactPersonId: item.contactPerson?.userId || null,
    contactName: item.contactPerson?.fullName || item.contactName || '',
    contactPhone: item.contactPerson?.phone || item.contactPhone || '',
    relationship: item.relationship || '',
    note: item.note || '',
    status: item.status || 'Active',
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
  }));
  return mapped;
}

/**
 * 🔹 Lấy chi tiết 1 Elder
 */
export async function fetchElderDetailController(id: string) {
  const res = await apiClient.get(`/api/elders/${id}`);
  return res.data;
}

/**
 * 🔹 Thêm mới Elder
 */
export async function createElderController(values: any) {
  const payload = {
    fullName: values.fullName,
    dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
    age: values.age || null,
    phone: values.phone || null,
    gender: values.gender,
    avatar: values.avatar || null,
    address: values.address || null,
    note: values.note || null,
    contactPhone: values.contactPhone || null,
    insuranceInfo: values.insuranceInfo || null,
    contactPersonId: values.contactPersonId || null,
  };
  console.log('🧾 PAYLOAD gửi backend:', payload); 
  const res = await apiClient.post('/api/elders', payload);
  return res.data;
}

/**
 * 🔹 Cập nhật Elder
 */
export async function updateElderController(id: string, values: any) {
  const payload = {
    fullName: values.fullName,
    dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
    age: values.age || null,
    phone: values.phone || null,
    gender: values.gender,
    avatar: values.avatar || null,
    address: values.address || null,
    note: values.note || null,
    contactPhone: values.contactPhone || null,
    insuranceInfo: values.insuranceInfo || null,
    contactPersonId: values.contactPersonId || null,
  };
  const res = await apiClient.patch(`/api/elders/${id}`, payload);
  return res.data;
}

/**
 * 🔹 Xóa Elder
 */
export async function deleteElderController(id: string) {
  await apiClient.delete(`/api/elders/${id}`);
}

/**
 * 🔹 Cập nhật hồ sơ y tế Elder (medical-history)
 */
export async function updateMedicalHistoryController(id: string, data: any) {
  const res = await apiClient.patch(`/api/elders/${id}/medical-history`, data);
  return res.data;
}


