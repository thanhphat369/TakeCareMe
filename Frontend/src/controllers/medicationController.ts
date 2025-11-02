import dayjs from 'dayjs';
import apiClient from '../config/api';
import { Medication } from '../types/Medication';

/**
 * 🔹 Lấy danh sách người cao tuổi
 */
export async function fetchElders() {
  try {
    const res = await apiClient.get('/api/elders');
    const raw = res.data?.data || res.data || [];
    return raw.map((item: any) => ({
      elderId: item.elderId,
      fullName: item.fullName,
      age: item.age,
      gender: item.gender,
      phone: item.phone,  
    }));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách người cao tuổi');
  }
}

/**
 * 🔹 Lấy danh sách bác sĩ (dựa trên các thuốc đã kê)
 */
export async function fetchDoctors() {
  try {
    // Gọi API lấy tất cả user
    const res = await apiClient.get('/api/users');
    const raw = res.data?.data || res.data || [];

    // Lọc chỉ user có role = 'Doctor'
    const doctors = raw
      .filter((user: any) => user.role === 'Doctor')
      .map((user: any) => ({
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
      }));

    console.log('👨‍⚕️ Danh sách bác sĩ:', doctors);
    return doctors;
  } catch (error: any) {
    console.error('❌ Lỗi khi tải danh sách bác sĩ:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách bác sĩ'
    );
  }
}


/**
 * 🔹 Lấy toàn bộ thuốc
 */
export async function fetchMedications(): Promise<Medication[]> {
  try {
    const res = await apiClient.get('/api/medications');
    return res.data?.data || res.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách thuốc');
  }
}

/**
 * 🔹 Lấy thuốc theo Elder
 */
export async function fetchMedicationsByElder(elderId: number): Promise<Medication[]> {
  try {
    const res = await apiClient.get(`/api/medications?elderId=${elderId}`);
    return res.data?.data || res.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách thuốc');
  }
}

/**
 * 🔹 Thêm thuốc mới
 */
export async function createMedication(values: Partial<Medication>): Promise<Medication> {
  try {
    const payload = {
      elderId: Number(values.elderId),
      name: values.name?.trim(),
      dose: values.dose || null,
      diagnosis: values.diagnosis || null,
      frequency: values.frequency || null,
      time: values.time || null,
      startDate: values.startDate ? dayjs(values.startDate).toISOString() : null,
      endDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
      notes: values.notes || '',
      prescribedBy: values.prescribedBy ? Number(values.prescribedBy) : null,
    };

    const res = await apiClient.post('/api/medications', payload);
    return res.data?.data || res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể thêm thuốc');
  }
}

/**
 * 🔹 Cập nhật thuốc
 */
export async function updateMedication(id: number, values: Partial<Medication>): Promise<Medication> {
  try {
    const payload = {
      elderId: values.elderId ? Number(values.elderId) : undefined,
      name: values.name?.trim(),
      dose: values.dose || null,
      diagnosis: values.diagnosis || null,
      frequency: values.frequency || null,
      time: values.time || null,
      startDate: values.startDate ? dayjs(values.startDate).toISOString() : null,
      endDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
      notes: values.notes || '',
      prescribedBy: values.prescribedBy ? Number(values.prescribedBy) : null,
    };

    const res = await apiClient.patch(`/api/medications/${id}`, payload);
    return res.data?.data || res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thuốc');
  }
}

/**
 * 🔹 Xóa thuốc
 */
export async function deleteMedication(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/medications/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể xóa thuốc');
  }
}

/**
 * 🔹 Thống kê thuốc
 */
export async function fetchStatistics(elderId?: number) {
  try {
    const url = elderId
      ? `/api/medications/statistics?elderId=${elderId}`
      : '/api/medications/statistics';
    const res = await apiClient.get(url);
    return res.data?.data || res.data;
  } catch {
    return { total: 0, active: 0, expired: 0 };
  }
}
