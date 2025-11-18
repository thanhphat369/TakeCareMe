import apiClient from './apiClient';
import { User, CreateUserRequest, UpdateUserRequest, UserStats } from '../types';

// Get all users with optional filters
export const getUsers = async (filters?: {
  role?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<User[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await apiClient.get(`/api/users?${params.toString()}`);
    // Map userId to id if id is missing
    const users: User[] = Array.isArray(response.data) 
      ? response.data.map((user: any) => ({
          ...user,
          id: user.id || String(user.userId || ''),
          userId: user.userId || Number(user.id) || undefined,
        }))
      : [];
    return users;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách người dùng');
  }
};

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await apiClient.get('/api/users/stats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải thống kê người dùng');
  }
};

// Get a specific user by ID
export const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/api/users/${userId}`);
    const user = response.data;
    // Map userId to id if id is missing
    return {
      ...user,
      id: user.id || String(user.userId || ''),
      userId: user.userId || Number(user.id) || undefined,
    };
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin người dùng');
  }
};

// Create a new user
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  try {
    const response = await apiClient.post('/api/users', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error.response?.data?.message || 'Không thể tạo người dùng mới');
  }
};

// Update a user
export const updateUser = async (userId: string, data: UpdateUserRequest): Promise<User> => {
  try {
    // Backend uses PATCH, not PUT
    const response = await apiClient.patch(`/api/users/${userId}`, data);
    const user = response.data;
    // Map userId to id if id is missing
    return {
      ...user,
      id: user.id || String(user.userId || ''),
      userId: user.userId || Number(user.id) || undefined,
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin người dùng');
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/users/${userId}`);
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa người dùng');
  }
};

// Ban a user
export const banUser = async (userId: string): Promise<User> => {
  try {
    // Use PATCH to update status to Banned
    const response = await apiClient.patch(`/api/users/${userId}`, { status: 'Banned' });
    const user = response.data;
    // Map userId to id if id is missing
    return {
      ...user,
      id: user.id || String(user.userId || ''),
      userId: user.userId || Number(user.id) || undefined,
    };
  } catch (error: any) {
    console.error('Error banning user:', error);
    throw new Error(error.response?.data?.message || 'Không thể khóa tài khoản');
  }
};

// Unban a user
export const unbanUser = async (userId: string): Promise<User> => {
  try {
    // Use PATCH to update status to Active
    const response = await apiClient.patch(`/api/users/${userId}`, { status: 'Active' });
    const user = response.data;
    // Map userId to id if id is missing
    return {
      ...user,
      id: user.id || String(user.userId || ''),
      userId: user.userId || Number(user.id) || undefined,
    };
  } catch (error: any) {
    console.error('Error unbanning user:', error);
    throw new Error(error.response?.data?.message || 'Không thể mở khóa tài khoản');
  }
};

// Change user password
export const changePassword = async (userId: string, newPassword: string): Promise<void> => {
  try {
    await apiClient.patch(`/api/users/${userId}/password`, { password: newPassword });
  } catch (error: any) {
    console.error('Error changing password:', error);
    throw new Error(error.response?.data?.message || 'Không thể đổi mật khẩu');
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: string, roleData?: any): Promise<User> => {
  try {
    const response = await apiClient.patch(`/api/users/${userId}/role`, { role, roleData });
    return response.data;
  } catch (error: any) {
    console.error('Error updating user role:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật vai trò');
  }
};

// Get users by role
export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const response = await apiClient.get(`/api/users/role/${role}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users by role:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải người dùng theo vai trò');
  }
};

// Get doctors and staff (accessible by Doctor and Staff roles)
export const getDoctorsAndStaff = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/api/users/doctors-and-staff');
    // Map userId to id if id is missing
    const users: User[] = Array.isArray(response.data) 
      ? response.data.map((user: any) => ({
          ...user,
          id: user.id || String(user.userId || ''),
          userId: user.userId || Number(user.id) || undefined,
        }))
      : [];
    return users;
  } catch (error: any) {
    console.error('Error fetching doctors and staff:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách bác sĩ và điều dưỡng');
  }
};

// Bulk operations
export const bulkUpdateUsers = async (userIds: string[], updates: Partial<UpdateUserRequest>): Promise<User[]> => {
  try {
    const response = await apiClient.patch('/api/users/bulk', { userIds, updates });
    return response.data;
  } catch (error: any) {
    console.error('Error bulk updating users:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật hàng loạt');
  }
};

export const bulkDeleteUsers = async (userIds: string[]): Promise<void> => {
  try {
    await apiClient.delete('/api/users/bulk', { data: { userIds } });
  } catch (error: any) {
    console.error('Error bulk deleting users:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa hàng loạt');
  }
};

// Export users data
export const exportUsers = async (filters?: {
  role?: string;
  status?: string;
  format?: 'csv' | 'excel' | 'pdf';
}): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.format) params.append('format', filters.format);

    const response = await apiClient.get(`/api/users/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting users:', error);
    throw new Error(error.response?.data?.message || 'Không thể xuất dữ liệu');
  }
};
