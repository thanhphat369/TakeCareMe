export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'SuperAdmin' | 'Admin' | 'Doctor' | 'Staff' | 'Family' | 'Elder';
  avatar?: string;
  status: 'Active' | 'Inactive' | 'Banned';
  notes?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}