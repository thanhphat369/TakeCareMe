import apiClient from './apiClient';
import { Prescription, CreatePrescriptionRequest, UpdatePrescriptionRequest } from '../types';

export const prescriptionsApi = {
  // Lấy tất cả đơn thuốc
  getAll: async (): Promise<Prescription[]> => {
    const response = await apiClient.get('/api/prescriptions');
    return response.data;
  },

  // Lấy đơn thuốc theo Elder ID
  getByElder: async (elderId: number): Promise<Prescription[]> => {
    const response = await apiClient.get(`/api/prescriptions/elder/${elderId}`);
    return response.data;
  },

  // Lấy đơn thuốc theo ID
  getById: async (id: number): Promise<Prescription> => {
    const response = await apiClient.get(`/api/prescriptions/${id}`);
    return response.data;
  },

  // Tạo đơn thuốc mới
  create: async (data: CreatePrescriptionRequest): Promise<Prescription> => {
    const response = await apiClient.post('/api/prescriptions', data);
    return response.data;
  },

  // Cập nhật đơn thuốc
  update: async (id: number, data: UpdatePrescriptionRequest): Promise<Prescription> => {
    const response = await apiClient.put(`/api/prescriptions/${id}`, data);
    return response.data;
  },

  // Xóa đơn thuốc
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/prescriptions/${id}`);
  },
};
