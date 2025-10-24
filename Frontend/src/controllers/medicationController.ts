import dayjs from 'dayjs';
import apiClient, { API_ENDPOINTS } from '../config/api';
import { Medication } from '../types/Medication';

/**
 * 🔹 Lấy danh sách người cao tuổi
 */
export async function fetchEldersController() {
  try {
    const res = await apiClient.get('/api/elders');
    const raw = res.data?.data || res.data || [];

    return raw.map((item: any) => ({
      elderId: item.elderId || item.id,
      fullName: item.fullName || item.name || '',
      dob: item.dob ? dayjs(item.dob) : null,
      age: item.age ?? null,
      gender: item.gender || '',
      address: item.address || '',
      phone: item.phone || '',
      status: item.status || 'Active',
      
    }));
  } catch (error: any) {
    console.error('❌ Lỗi khi load Elders:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách người cao tuổi'
    );
  }
}

/**
 * 🔹 Lấy danh sách tất cả thuốc
 */
export async function fetchMedications(): Promise<Medication[]> {
  try {
    const res = await apiClient.get('/api/medications');
    const raw = res.data?.data || res.data || [];

    return raw.map((item: any): Medication => ({
      medicationId: item.medicationId || item.medication_id,
      elderId: item.elderId || item.elder_id,
      name: item.name,
      dose: item.dose || '',
      frequency: item.frequency || '',
      time: item.time || null,
      startDate: item.startDate || item.start_date || null,
      endDate: item.endDate || item.end_date || null,
      notes: item.notes || '',
      prescribedBy: item.prescribedBy || item.prescribed_by || null,
      elder: item.elder
        ? {
          elderId: item.elder.elderId || item.elder.elder_id,
          fullName: item.elder.fullName || item.elder.full_name,
          age: item.elder.age,
          gender: item.elder.gender,
          phone: item.elder.phone,
        }
        : undefined,
      prescriber: item.prescriber
  ? {
      userId: item.prescriber.userId || item.prescriber.user_id,
      fullName: item.prescriber.fullName || item.prescriber.full_name || 'Bác sĩ không xác định',
    }
  : item.prescribedBy
    ? {
        userId: item.prescribedBy,
        fullName: `Bác sĩ #${item.prescribedBy}`, // Hiển thị tạm nếu không có tên
      }
    : undefined,
    }));
  } catch (error: any) {
    console.error('❌ Lỗi khi load medications:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách thuốc'
    );
  }
}

/**
 * 🔹 Lấy danh sách thuốc theo người cao tuổi
 */
export async function fetchMedicationsByElder(
  elderId: number
): Promise<Medication[]> {
  try {
    const res = await apiClient.get(`/api/medications/elder/${elderId}`);
    const raw = res.data?.data || res.data || [];

    return raw.map((item: any): Medication => ({
      medicationId: item.medicationId || item.medication_id,
      elderId: item.elderId || item.elder_id,
      name: item.name,
      dose: item.dose || '',
      frequency: item.frequency || '',
      time: item.time || null,
      startDate: item.startDate || item.start_date || null,
      endDate: item.endDate || item.end_date || null,
      notes: item.notes || '',
      prescribedBy: item.prescribedBy || item.prescribed_by || null,
      elder: item.elder
        ? {
          elderId: item.elder.elderId || item.elder.elder_id,
          fullName: item.elder.fullName || item.elder.full_name,
          age: item.elder.age,
          gender: item.elder.gender,
          phone: item.elder.phone,
        }
        : undefined,
      prescriber: item.prescriber
  ? {
      userId: item.prescriber.userId || item.prescriber.user_id,
      fullName: item.prescriber.fullName || item.prescriber.full_name || 'Bác sĩ không xác định',
    }
  : item.prescribedBy
    ? {
        userId: item.prescribedBy,
        fullName: `Bác sĩ #${item.prescribedBy}`, // Hiển thị tạm nếu không có tên
      }
    : undefined,
    }));
  } catch (error: any) {
    console.error('❌ Lỗi khi load medications by elder:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách thuốc'
    );
  }
}

/**
 * 🔹 Lấy chi tiết 1 thuốc
 */
export async function fetchMedicationDetail(id: number): Promise<Medication> {
  try {
    const res = await apiClient.get(`${API_ENDPOINTS.MEDICATIONS.LIST}/${id}`);
    const item = res.data?.data || res.data;

    return {
      medicationId: item.medicationId || item.medication_id,
      elderId: item.elderId || item.elder_id,
      name: item.name,
      dose: item.dose || '',
      frequency: item.frequency || '',
      time: item.time || null,
      startDate: item.startDate || item.start_date || null,
      endDate: item.endDate || item.end_date || null,
      notes: item.notes || '',
      prescribedBy: item.prescribedBy || item.prescribed_by || null,
      elder: item.elder,
      prescriber: item.prescriber
  ? {
      userId: item.prescriber.userId || item.prescriber.user_id,
      fullName: item.prescriber.fullName || item.prescriber.full_name || 'Bác sĩ không xác định',
    }
  : item.prescribedBy
    ? {
        userId: item.prescribedBy,
        fullName: `Bác sĩ #${item.prescribedBy}`, // Hiển thị tạm nếu không có tên
      }
    : undefined,
    };
  } catch (error: any) {
    console.error('❌ Lỗi khi load medication detail:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải thông tin thuốc'
    );
  }
}

/**
 * 🔹 Thêm thuốc mới
 */
export async function createMedication( values: Partial<Medication> ): Promise<Medication> {
  try {
    const payload = {
      elderId: Number(values.elderId), // Đảm bảo là number
      name: values.name,
      dose: values.dose || undefined,
      frequency: values.frequency || undefined,
      time: values.time || undefined,
      startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null,
      endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
      notes: values.notes || undefined,
      prescribedBy: values.prescribedBy ? Number(values.prescribedBy) : undefined,
    };

    console.log('📤 Sending medication payload:', payload);

    const res = await apiClient.post('/api/medications', payload);
    return res.data?.data || res.data;

  } catch (error: any) {
    console.error('❌ Lỗi khi tạo medication:', error);
    console.error('❌ Error response:', error.response?.data);
    throw new Error( error.response?.data?.message || 'Không thể thêm thuốc mới' );
  }
}



/**
 * 🔹 Cập nhật thuốc
 */
export async function updateMedication(
  id: number,
  values: Partial<Medication>
): Promise<Medication> {
  try {
    const payload = {
      elderId: Number(values.elderId), // Đảm bảo là number
      name: values.name,
      dose: values.dose || undefined,
      frequency: values.frequency || undefined,
      time: values.time || undefined,
      startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null,
      endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
      notes: values.notes || undefined,
      prescribedBy: values.prescribedBy ? Number(values.prescribedBy) : undefined,
    };

    console.log('📤 Updating medication payload:', payload);

    const res = await apiClient.put(`/api/medications/${id}`, payload);
    return res.data?.data || res.data;
  } catch (error: any) {
    console.error('❌ Lỗi khi cập nhật medication:', error);
    console.error('❌ Error response:', error.response?.data);
    throw new Error(
      error.response?.data?.message || 'Không thể cập nhật thuốc'
    );
  }
}

/**
 * 🔹 Xóa thuốc
 */
export async function deleteMedication(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/medications/${id}`);
  } catch (error: any) {
    console.error('❌ Lỗi khi xóa medication:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa thuốc');
  }
}