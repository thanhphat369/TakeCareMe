export interface FamilyMemberInfo {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  status: string;
}

export interface FamilyMember {
  familyId: number;
  elderId: number;
  relationship: string;
  isPrimary: boolean;
  createdAt: Date;
  family: FamilyMemberInfo;
}

export interface CreateFamilyMemberRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  relationship: string;
  address?: string;
  notes?: string;
  avatar?: string;
  isPrimary?: boolean;
  status?: string;
}

export interface UpdateFamilyMemberRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  address?: string;
  notes?: string;
  avatar?: string;
  isPrimary?: boolean;
  status?: string;
}
