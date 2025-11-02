import apiClient from './apiClient';
import { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '../types/family-member';

// Get all family members for an elderly person
export const getFamilyMembers = async (elderId: number): Promise<FamilyMember[]> => {
  try {
    const response = await apiClient.get(`/api/family-elders/elders/${elderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching family members:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách người thân');
  }
};

// Create a new family member link
export const createFamilyMember = async (data: CreateFamilyMemberRequest): Promise<FamilyMember> => {
  try {
    const response = await apiClient.post('/api/family-elders', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể tạo liên kết người thân mới');
  }
};

// Update family member link (primary status, relationship)
export const updateFamilyMember = async (
  familyId: number,
  elderId: number,
  data: UpdateFamilyMemberRequest
): Promise<FamilyMember> => {
  try {
    const response = await apiClient.patch(`/api/family-elders/${familyId}/${elderId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin người thân');
  }
};

// Delete family member link
export const deleteFamilyMember = async (familyId: number, elderId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/family-elders/${familyId}/${elderId}`);
  } catch (error: any) {
    console.error('Error removing family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa liên kết người thân');
  }
};