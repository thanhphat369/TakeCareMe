// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'staff';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Elderly Types
export interface Elderly {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  emergencyContact: string;
  address: string;
  bloodType: string;
  doctor: string;
  status: 'healthy' | 'monitoring' | 'critical';
  lastCheckup?: Date;
  nextCheckup?: Date;
  notes?: string;
  medications: string[]; // Array of medication names
  medicalHistory?: string; // Single text field
  allergies?: string; // Comma-separated string
  createdAt: Date;
  updatedAt: Date;
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

// Appointment Types
export interface Appointment {
  id: string;
  elderlyId: string;
  elderlyName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  type: 'checkup' | 'followup' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Medical Record Types
export interface MedicalRecord {
  id: string;
  elderlyId: string;
  date: Date;
  diagnosis: string;
  treatment: string;
  medications: string[];
  doctorId: string;
  doctorName: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Health Metrics Types (legacy compatibility)
export interface HealthRecord {
  id: string;
  elderlyId: string;
  date: Date;
  diagnosis: string;
  treatment: string;
  medications: string[];
  doctorId: string;
  doctorName: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthMetrics {
  id: string;
  elderlyId: string;
  date: Date;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  bloodSugar?: number;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

// Caregiver Types
export interface Caregiver {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialization: string[];
  experience: number;
  rating: number;
  status: 'available' | 'busy' | 'off';
  assignedElderly: string[];
}

// Statistics Types
export interface DashboardStats {
  totalElderly: number;
  totalStaff: number;
  todayAppointments: number;
  criticalCases: number;
  elderlyByStatus: {
    healthy: number;
    monitoring: number;
    critical: number;
  };
  staffByRole: {
    doctors: number;
    nurses: number;
  };
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'appointment' | 'checkup' | 'admission' | 'discharge';
  description: string;
  timestamp: Date;
  elderlyName?: string;
  staffName?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}