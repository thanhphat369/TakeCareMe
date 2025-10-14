export interface Elderly {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  medications: Medication[];
  allergies: string[];
  bloodType: string;
  doctor: string;
  lastCheckup: Date;
  nextCheckup: Date;
  status: 'healthy' | 'monitoring' | 'critical';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes: string;
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
