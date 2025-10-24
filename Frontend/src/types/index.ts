
// Elderly Types
export interface Elderly {
  id: string;
  fullName: string;
  age?: number | null;
  dob?: Date;
  gender: string;
  address?: string;
  phone: string;
  contactPersonId?: number | null;
  contactName?: string;
  contactPhone?: string;
  relationship?: string;
  note?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  emergencyContact: string;
  medicalHistory: string[];
  medications: Medication[];
  allergies: string[];
  bloodType: string;
  doctor: string;
  lastCheckup: Date;
  nextCheckup: Date;
  
}

export interface Medication {
  medicationId: number;
  elderId: number;
  name: string;
  dose?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  prescribedBy?: number;
  time?: string;
  prescriptionId?: number;
  elder?: {
    elderId: number;
    fullName: string;
  };
  prescriber?: {
    userId: number;
    fullName: string;
  };
  prescription?: Prescription;
  staffInCharge?: number | null; // ID nhân viên phụ trách thuốc
  staff?: {
    staffId: number;
    fullName: string;
    department?: string;
  } | null;
}

export interface MedicationItem {
  name: string;
  dose?: string;
  frequency?: string;
  time?: string;
  notes?: string;
}

export interface Prescription {
  prescriptionId: number;
  elderId: number;
  prescribedBy: number;
  diagnosis?: string;
  notes?: string;
  prescriptionDate: string;
  startDate?: string;
  endDate?: string;
  status: string;
  elder?: {
    elderId: number;
    fullName: string;
  };
  prescriber?: {
    userId: number;
    fullName: string;
  };
  medications: Medication[];
}

export interface CreatePrescriptionRequest {
  elderId: number;
  prescribedBy: number;
  diagnosis?: string;
  notes?: string;
  prescriptionDate: string;
  startDate?: string;
  endDate?: string;
  medications: MedicationItem[];
}

export interface UpdatePrescriptionRequest {
  elderId?: number;
  prescribedBy?: number;
  diagnosis?: string;
  notes?: string;
  prescriptionDate?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  medications?: MedicationItem[];
}

// Staff Types
export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Doctor' | 'Staff';
  roleTitle: string;
  licenseNo?: string;
  department: string;
  status: 'Active' | 'Inactive' | 'OnLeave';
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  experienceYears: number;
  education?: string;
  skills?: string;
  notes?: string;
  hireDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Caregiver {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialization: string[];
  experience: number;
  rating: number;
  status: 'available' | 'busy' | 'offline';
  assignedElderly: string[];
}

export interface Appointment {
  id: string;
  elderlyId: string;
  caregiverId: string;
  type: 'checkup' | 'medication' | 'exercise' | 'social' | 'emergency';
  title: string;
  description: string;
  start: Date;
  end: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthRecord {
  id: string;
  elderlyId: string;
  date: Date;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  symptoms: string[];
  notes: string;
  recordedBy: string;
}

export interface Activity {
  id: string;
  elderlyId: string;
  type: 'exercise' | 'social' | 'cognitive' | 'recreational';
  title: string;
  description: string;
  duration: number; // in minutes
  date: Date;
  status: 'completed' | 'in-progress' | 'cancelled';
  notes: string;
}

export interface DashboardStats {
  totalElderly: number;
  activeElderly: number;
  totalAppointments: number;
  completedAppointments: number;
  totalCaregivers: number;
  availableCaregivers: number;
  criticalCases: number;
  upcomingAppointments: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Family Member Types
export interface FamilyMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
  address?: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  isPrimary: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFamilyMemberRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  relationship: string;
  address?: string;
  notes?: string;
  isPrimary?: boolean;
}

export interface UpdateFamilyMemberRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  address?: string;
  notes?: string;
  isPrimary?: boolean;
  status?: 'Active' | 'Inactive';
}

// User Management Types
export interface User {
  id: string;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'SuperAdmin' | 'Admin' | 'Doctor' | 'Staff' | 'Family' | 'Elder';
  avatar?: string;
  status: 'Active' | 'Inactive' | 'Banned';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  notes?: string;
  // Role-specific data
  roleData?: {
    // For Staff/Doctor
    roleTitle?: string;
    licenseNo?: string;
    skills?: string;
    experienceYears?: number;
    department?: string;
    // For Family
    relationship?: string;
    isPrimary?: boolean;
    // For Elder
    age?: number;
    gender?: string;
    address?: string;
    contactPersonId?: number;
  };
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'SuperAdmin' | 'Admin' | 'Doctor' | 'Staff' | 'Family' | 'Elder';
  avatar?: string;
  notes?: string;
  // Role-specific data
  roleData?: {
    roleTitle?: string;
    licenseNo?: string;
    skills?: string;
    experienceYears?: number;
    department?: string;
    relationship?: string;
    isPrimary?: boolean;
    age?: number;
    gender?: string;
    address?: string;
    contactPersonId?: number;
  };
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: 'SuperAdmin' | 'Admin' | 'Doctor' | 'Staff' | 'Family' | 'Elder';
  avatar?: string;
  status?: 'Active' | 'Inactive' | 'Banned';
  notes?: string;
  roleData?: {
    roleTitle?: string;
    licenseNo?: string;
    skills?: string;
    experienceYears?: number;
    department?: string;
    relationship?: string;
    isPrimary?: boolean;
    age?: number;
    gender?: string;
    address?: string;
    contactPersonId?: number;
  };
}

export interface UserRole {
  role: string;
  label: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  bannedUsers: number;
  usersByRole: {
    role: string;
    count: number;
    percentage: number;
  }[];
  recentLogins: number;
  newUsersThisMonth: number;
}


