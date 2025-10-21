import { Staff } from '../types';
import apiClient from '../config/api';

export async function fetchStaffController() {
  const res = await apiClient.get('/api/staff', { params: { page: 1, limit: 50 } });
  const raw = res.data?.data || [];
  const mapped: Staff[] = raw.map((item: any) => ({
    id: item.staffId?.toString?.() || String(item.staffId || ''),
    fullName: item.user?.fullName || '',
    email: item.user?.email || '',
    phone: item.user?.phone || '',
    role: item.user?.role || '',
    roleTitle: item.roleTitle || '',
    licenseNo: item.licenseNo || '',
    department: item.department || '',
    status: item.status || '',
    shift: item.shift || '',
    experienceYears: item.experienceYears || 0,
    education: item.education || '',
    skills: item.skills || '',
    notes: item.notes || '',
    hireDate: item.createdAt ? new Date(item.createdAt) : undefined,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
  }));
  return mapped;
}

export async function fetchStaffStatisticsController() {
  const res = await apiClient.get('/api/staff/statistics');
  return res.data;
}

export async function createStaffController(values: any) {
  const payload = {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    role: values.role,
    roleTitle: values.roleTitle,
    licenseNo: values.licenseNo || null,
    department: values.department,
    shift: values.shift,
    experienceYears: Number(values.experienceYears) || 0,
    education: values.education || null,
    skills: values.skills || null,
    notes: values.notes || null,
    status: values.status || 'Active',
    password: values.password || '123456',
  };
  const res = await apiClient.post('/api/staff', payload);
  return res.data;
}

export async function updateStaffController(id: string, values: any) {
  const payload = {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    role: values.role,
    roleTitle: values.roleTitle,
    licenseNo: values.licenseNo || null,
    department: values.department,
    shift: values.shift,
    experienceYears: Number(values.experienceYears) || 0,
    education: values.education || null,
    skills: values.skills || null,
    notes: values.notes || null,
    status: values.status || 'Active',
  };
  const res = await apiClient.patch(`/api/staff/${id}`, payload);
  return res.data;
}

export async function deleteStaffController(id: string) {
  await apiClient.delete(`/api/staff/${id}`);
}


