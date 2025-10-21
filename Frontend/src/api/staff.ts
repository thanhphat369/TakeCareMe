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
    fullName: string;
    email: string;
    phone?: string;
    role: string;
  };
}

// ===== API Methods =====

//  Lấy danh sách nhân viên
export async function getAllStaff(): Promise<Staff[]> {
  const res = await api.get('/api/staff');
  return res.data;
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