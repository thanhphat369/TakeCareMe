import api from '../config/api';

// ===== Interface Type =====
export interface Staff {
  staffId: number;
  userId: number;
  roleTitle: string;
  licenseNo?: string;
  skills?: string;
  experienceYears: number;
  department?: string;
  status?: string;
  user?: {
    userId?: number;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
  };
}

// ===== API Methods =====

// 🔹 Alias để lấy danh sách nhân viên
export async function getStaffs(): Promise<Staff[]> {
  return getAllStaff();
}
//  Lấy danh sách nhân viên
export async function getAllStaff(): Promise<Staff[]> {
  const res = await api.get('/api/staff');
  // Backend returns { data: Staff[], total: number, ... } or Staff[] directly
  return Array.isArray(res.data) ? res.data : (res.data?.data || []);
}

// Thêm nhân viên mới
export async function createStaff(data: Partial<Staff>): Promise<Staff> {
  const res = await api.post('/api/staff', data);
  return res.data;
}

// Cập nhật nhân viên
export async function updateStaff(id: number, data: Partial<Staff>): Promise<Staff> {
  const res = await api.patch(`/api/staff/${id}`, data);
  return res.data;
}

// Xóa nhân viên
export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/api/staff/${id}`);
}