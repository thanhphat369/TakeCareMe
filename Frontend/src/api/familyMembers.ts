import apiClient from './apiClient';
import {
  FamilyMember,
  CreateFamilyMemberRequest,
  UpdateFamilyMemberRequest,
} from '../types';

export const getFamilyMembers = async (elderId: string): Promise<FamilyMember[]> => {
  const res = await apiClient.get(`/api/family-members/elder/${elderId}`);
  const data = res.data;

  return data.map((item: any) => ({
    familyId: item.familyId,
    elderId: item.elderId,
    relationship: item.relationship,
    isPrimary: item.isPrimary,
    createdAt: item.createdAt,
    family: {
      userId: item.family?.userId,
      fullName: item.family?.fullName,
      email: item.family?.email,
      phone: item.family?.phone,
      avatar: item.family?.avatar,
      address: item.family?.address,
      status: item.family?.status,
    }
  }));
};

export const createFamilyMember = async (
  elderId: string,
  data: CreateFamilyMemberRequest
): Promise<FamilyMember> => {
  try {
    const response = await apiClient.post(`/api/family-members/${elderId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating family member:', error);
    throw new Error(error.response?.data?.message || 'Kh�ng th? t?o ngu?i th�n m?i');
  }
};

export const updateFamilyMember = async (
  familyId: string,
  data: UpdateFamilyMemberRequest
): Promise<FamilyMember> => {
  try {
    const response = await apiClient.put(`/api/family-members/${familyId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating family member:', error);
    throw new Error(error.response?.data?.message || 'Kh�ng th? c?p nh?t th�ng tin ngu?i th�n');
  }
};

export const deleteFamilyMember = async (
  familyId: string,
  elderId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/api/family-members/${familyId}/${elderId}`);
  } catch (error: any) {
    console.error('Error deleting family member:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa người thân');
  }
};

export const getPrimaryFamilyMember = async (elderId: number): Promise<FamilyMember | null> => {
  const res = await apiClient.get(`/api/family-members/elder/${elderId}/primary`);
  return res.data;
};
