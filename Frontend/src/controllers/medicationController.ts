import dayjs from 'dayjs';
import apiClient, { API_ENDPOINTS } from '../config/api';
import { Medication } from '../types/Medication';

/**
 * 🔹 Lấy danh sách người cao tuổi
 */
export async function fetchEldersController() {
  try {
    const res = await apiClient.get(API_ENDPOINTS.ELDERS.LIST);
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
    const res = await apiClient.get(API_ENDPOINTS.MEDICATIONS.LIST);
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
            fullName: item.prescriber.fullName || item.prescriber.full_name,
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
 * (Filter từ tất cả medications vì backend không có endpoint riêng)
 */
export async function fetchMedicationsByElder(
  elderId: number
): Promise<Medication[]> {
  try {
    // Lấy tất cả medications và filter theo elderId ở frontend
    const allMedications = await fetchMedications();
    return allMedications.filter((med) => med.elderId === elderId);
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
      prescriber: item.prescriber,
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
export async function createMedication(
  values: Partial<Medication>
): Promise<Medication> {
  try {
    const payload = {
      elderId: Number(values.elderId), // Đảm bảo là number
      name: values.name,
      dose: values.dose || undefined,
      frequency: values.frequency || undefined,
      time: values.time || undefined,
      startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD')  : null,
      endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
      notes: values.notes || undefined,
      prescribedBy: values.prescribedBy ? Number(values.prescribedBy) : undefined,
    };

    console.log('📤 Sending medication payload:', payload);

    const res = await apiClient.post(API_ENDPOINTS.MEDICATIONS.CREATE, payload);
    return res.data?.data || res.data;
  } catch (error: any) {
    console.error('❌ Lỗi khi tạo medication:', error);
    console.error('❌ Error response:', error.response?.data);
    throw new Error(
      error.response?.data?.message || 'Không thể thêm thuốc mới'
    );
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
        startDate: values.startDate
    ? dayjs(values.startDate).format('YYYY-MM-DD') // ✅ đúng định dạng ISO
    : null,
  endDate: values.endDate
    ? dayjs(values.endDate).format('YYYY-MM-DD')
    : null,
      notes: values.notes || undefined,
      prescribedBy: values.prescribedBy ? Number(values.prescribedBy) : undefined,
    };

    console.log('📤 Updating medication payload:', payload);

    const res = await apiClient.put(
      API_ENDPOINTS.MEDICATIONS.UPDATE(String(id)),
      payload
    );
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
    await apiClient.delete(API_ENDPOINTS.MEDICATIONS.DELETE(String(id)));
  } catch (error: any) {
    console.error('❌ Lỗi khi xóa medication:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa thuốc');
  }
}