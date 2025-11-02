import dayjs from 'dayjs';
import apiClient from '../config/api';
import { Prescription, CreatePrescriptionRequest, UpdatePrescriptionRequest } from '../types';

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
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách người cao tuổi');
  }
}

/**
 * 🔹 Lấy danh sách tất cả đơn thuốc
 */
export async function fetchPrescriptions(): Promise<Prescription[]> {
  try {
    const res = await apiClient.get('/api/prescriptions');
    const raw = res.data?.data || res.data || [];

    return raw.map((item: any): Prescription => ({
      prescriptionId: item.prescriptionId || item.prescription_id,
      elderId: item.elderId || item.elder_id,
      prescribedBy: item.prescribedBy || item.prescribed_by,
      diagnosis: item.diagnosis || '',
      notes: item.notes || '',
      prescriptionDate: item.prescriptionDate || item.prescription_date || null,
      startDate: item.startDate || item.start_date || null,
      endDate: item.endDate || item.end_date || null,
      status: item.status || 'active',
      elder: item.elder
        ? {
          elderId: item.elder.elderId || item.elder.elder_id,
          fullName: item.elder.fullName || item.elder.full_name,
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
        fullName: `Bác sĩ #${item.prescribedBy}`,
      }
    : undefined,
      medications: item.medications || [],
    }));
  } catch (error: any) {
    console.error('❌ Lỗi khi load prescriptions:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách đơn thuốc'
    );
  }
}

/**
 * 🔹 Lấy danh sách đơn thuốc theo người cao tuổi
 */
export async function fetchPrescriptionsByElder(
  elderId: number
): Promise<Prescription[]> {
  try {
    const res = await apiClient.get(`/api/prescriptions/elder/${elderId}`);
    const raw = res.data?.data || res.data || [];

    return raw.map((item: any): Prescription => ({
      prescriptionId: item.prescriptionId || item.prescription_id,
      elderId: item.elderId || item.elder_id,
      prescribedBy: item.prescribedBy || item.prescribed_by,
      diagnosis: item.diagnosis || '',
      notes: item.notes || '',
      prescriptionDate: item.prescriptionDate || item.prescription_date || null,
      startDate: item.startDate || item.start_date || null,
      endDate: item.endDate || item.end_date || null,
      status: item.status || 'active',
      elder: item.elder
        ? {
          elderId: item.elder.elderId || item.elder.elder_id,
          fullName: item.elder.fullName || item.elder.full_name,
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
      medications: item.medications || [],
    }));
  } catch (error: any) {
    console.error('❌ Lỗi khi load prescriptions by elder:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách đơn thuốc'
    );
  }
}

/**
 * 🔹 Lấy chi tiết 1 đơn thuốc
 */
export async function fetchPrescriptionDetail(id: number): Promise<Prescription> {
  try {
    const res = await apiClient.get(`/api/prescriptions/${id}`);
    const item = res.data?.data || res.data;

    return {
      prescriptionId: item.prescriptionId || item.prescription_id,
      elderId: item.elderId || item.elder_id,
      prescribedBy: item.prescribedBy || item.prescribed_by,
      diagnosis: item.diagnosis || '',
      notes: item.notes || '',
      prescriptionDate: item.prescriptionDate || item.prescription_date || null,
      startDate: item.startDate || item.start_date || null,
      endDate: item.endDate || item.end_date || null,
      status: item.status || 'active',
      elder: item.elder,
      prescriber: item.prescriber
  ? {
      userId: item.prescriber.userId || item.prescriber.user_id,
      fullName: item.prescriber.fullName || item.prescriber.full_name || 'Bác sĩ không xác định',
    }
  : item.prescribedBy
    ? {
        userId: item.prescribedBy,
        fullName: `Bác sĩ #${item.prescribedBy}`,
      }
    : undefined,
      medications: item.medications || [],
    };
  } catch (error: any) {
    console.error('❌ Lỗi khi load prescription detail:', error);
    throw new Error(
      error.response?.data?.message || 'Không thể tải thông tin đơn thuốc'
    );
  }
}
/**
 * 🔹 Thêm đơn thuốc mới
 */
export async function createPrescription(values: Partial<CreatePrescriptionRequest>): Promise<Prescription> {
  try {
    const payload = {
      elderId: Number(values.elderId),
      prescribedBy: Number(values.prescribedBy),
      diagnosis: values.diagnosis || undefined,
      notes: values.notes || undefined,
      prescriptionDate: values.prescriptionDate ? dayjs(values.prescriptionDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null,
      endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
      medications: values.medications || [],
    };

    console.log('📤 Sending prescription payload:', payload);

    const res = await apiClient.post('/api/prescriptions', payload);
    return res.data?.data || res.data;

  } catch (error: any) {
    console.error('❌ Lỗi khi tạo prescription:', error);
    console.error('❌ Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Không thể thêm đơn thuốc mới');
  }
}

/**
 * 🔹 Cập nhật đơn thuốc
 */
export async function updatePrescription(
  id: number,
  values: Partial<UpdatePrescriptionRequest>
): Promise<Prescription> {
  try {
    const payload = {
      elderId: values.elderId ? Number(values.elderId) : undefined,
      prescribedBy: values.prescribedBy ? Number(values.prescribedBy) : undefined,
      diagnosis: values.diagnosis || undefined,
      notes: values.notes || undefined,
      prescriptionDate: values.prescriptionDate ? dayjs(values.prescriptionDate).format('YYYY-MM-DD') : undefined,
      startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : undefined,
      endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
      status: values.status || undefined,
      medications: values.medications || undefined,
    };

    console.log('📤 Updating prescription payload:', payload);

    const res = await apiClient.put(`/api/prescriptions/${id}`, payload);
    return res.data?.data || res.data;
  } catch (error: any) {
    console.error('❌ Lỗi khi cập nhật prescription:', error);
    console.error('❌ Error response:', error.response?.data);
    throw new Error(
      error.response?.data?.message || 'Không thể cập nhật đơn thuốc'
    );
  }
}
/**
 * 🔹 Xóa đơn thuốc
 */
export async function deletePrescription(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/prescriptions/${id}`);
  } catch (error: any) {
    console.error('❌ Lỗi khi xóa prescription:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa đơn thuốc');
  }
}