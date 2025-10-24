import apiClient from './apiClient';
import { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '../types';

// Get all family members for an elderly person
export const getFamilyMembers = async (elderlyId: string): Promise<FamilyMember[]> => {
  try {
    const response = await apiClient.get(`/api/elders/${elderlyId}/family-members`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching family members:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách người thân');
  }
};

// Create a new family member
export const createFamilyMember = async (
  elderlyId: string, 
  data: CreateFamilyMemberRequest
): Promise<FamilyMember> => {
  try {
    const response = await apiClient.post(`/api/elders/${elderlyId}/family-members`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể tạo người thân mới');
  }
};

// Update a family member
export const updateFamilyMember = async (
  elderlyId: string,
  familyMemberId: string,
  data: UpdateFamilyMemberRequest
): Promise<FamilyMember> => {
  try {
    const response = await apiClient.put(
      `/api/elders/${elderlyId}/family-members/${familyMemberId}`, 
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin người thân');
  }
};

// Delete a family member
export const deleteFamilyMember = async (
  elderlyId: string,
  familyMemberId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/api/elders/${elderlyId}/family-members/${familyMemberId}`);
  } catch (error: any) {
    console.error('Error deleting family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa người thân');
  }
};

// Get a specific family member
export const getFamilyMember = async (
  elderlyId: string,
  familyMemberId: string
): Promise<FamilyMember> => {
  try {
    const response = await apiClient.get(`/api/elders/${elderlyId}/family-members/${familyMemberId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin người thân');
  }
};

// Set primary family member
export const setPrimaryFamilyMember = async (
  elderlyId: string,
  familyMemberId: string
): Promise<FamilyMember> => {
  try {
    const response = await apiClient.patch(
      `/api/elders/${elderlyId}/family-members/${familyMemberId}/set-primary`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error setting primary family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể đặt người liên hệ chính');
  }
};
