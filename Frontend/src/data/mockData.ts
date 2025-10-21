import { Elderly, Caregiver, Appointment, HealthRecord, Activity, DashboardStats } from '../types';

export const mockElderly: Elderly[] = [
  {
    id: '1',
    fullName: 'Nguyễn Văn An',
    age: 75,
    gender: 'male',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    emergencyContact: '0907654321',
    medicalHistory: ['Cao huyết áp', 'Tiểu đường'],
    medications: [
      {
        id: 'med1',
        name: 'Metformin',
        dosage: '500mg',
        frequency: '2 lần/ngày',
        startDate: new Date('2023-01-01'),
        notes: 'Uống sau bữa ăn'
      }
    ],
    allergies: ['Penicillin'],
    bloodType: 'A+',
    doctor: 'BS. Trần Văn B',
    lastCheckup: new Date('2023-11-01'),
    nextCheckup: new Date('2023-12-01'),
    status: 'monitoring',
    note: 'Cần theo dõi huyết áp hàng ngày',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '2',
    fullName: 'Trần Thị Bình',
    age: 82,
    gender: 'female',
    phone: '0902345678',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    emergencyContact: '0908765432',
    medicalHistory: ['Alzheimer', 'Loãng xương'],
    medications: [
      {
        id: 'med2',
        name: 'Donepezil',
        dosage: '5mg',
        frequency: '1 lần/ngày',
        startDate: new Date('2023-02-01'),
        notes: 'Uống vào buổi tối'
      }
    ],
    allergies: [],
    bloodType: 'O+',
    doctor: 'BS. Lê Thị C',
    lastCheckup: new Date('2023-10-15'),
    nextCheckup: new Date('2023-12-15'),
    status: 'critical',
    note: 'Cần chăm sóc đặc biệt, có người thân ở bên',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '3',
    fullName: 'Lê Văn Cường',
    age: 68,
    gender: 'male',
    phone: '0903456789',
    address: '789 Đường DEF, Quận 5, TP.HCM',
    emergencyContact: '0909876543',
    medicalHistory: ['Tim mạch'],
    medications: [
      {
        id: 'med3',
        name: 'Aspirin',
        dosage: '100mg',
        frequency: '1 lần/ngày',
        startDate: new Date('2023-03-01'),
        notes: 'Uống sau bữa sáng'
      }
    ],
    allergies: ['Aspirin'],
    bloodType: 'B+',
    doctor: 'BS. Phạm Văn D',
    lastCheckup: new Date('2023-11-10'),
    nextCheckup: new Date('2024-01-10'),
    status: 'healthy',
    note: 'Tình trạng sức khỏe ổn định',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-11-15')
  }
];

export const mockCaregivers: Caregiver[] = [
  {
    id: 'cg1',
    name: 'Nguyễn Thị Lan',
    phone: '0901111111',
    email: 'lan.nguyen@example.com',
    specialization: ['Chăm sóc người cao tuổi', 'Vật lý trị liệu'],
    experience: 5,
    rating: 4.8,
    status: 'available',
    assignedElderly: ['1', '3']
  },
  {
    id: 'cg2',
    name: 'Trần Văn Minh',
    phone: '0902222222',
    email: 'minh.tran@example.com',
    specialization: ['Y tá', 'Chăm sóc bệnh nhân Alzheimer'],
    experience: 8,
    rating: 4.9,
    status: 'busy',
    assignedElderly: ['2']
  },
  {
    id: 'cg3',
    name: 'Lê Thị Hoa',
    phone: '0903333333',
    email: 'hoa.le@example.com',
    specialization: ['Dinh dưỡng', 'Tâm lý học'],
    experience: 3,
    rating: 4.6,
    status: 'available',
    assignedElderly: []
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    elderlyId: '1',
    caregiverId: 'cg1',
    type: 'checkup',
    title: 'Khám sức khỏe định kỳ',
    description: 'Kiểm tra huyết áp, đường huyết và các chỉ số sức khỏe',
    start: new Date('2023-12-01T09:00:00'),
    end: new Date('2023-12-01T10:00:00'),
    status: 'scheduled',
    location: 'Phòng khám 101',
    notes: 'Nhớ mang theo thuốc',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: 'apt2',
    elderlyId: '2',
    caregiverId: 'cg2',
    type: 'medication',
    title: 'Hướng dẫn uống thuốc',
    description: 'Kiểm tra và hướng dẫn uống thuốc đúng cách',
    start: new Date('2023-11-20T14:00:00'),
    end: new Date('2023-11-20T15:00:00'),
    status: 'completed',
    location: 'Tại nhà',
    notes: 'Bệnh nhân hợp tác tốt',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-20')
  }
];

export const mockHealthRecords: HealthRecord[] = [
  {
    id: 'hr1',
    elderlyId: '1',
    date: new Date('2023-11-15'),
    bloodPressure: { systolic: 140, diastolic: 90 },
    heartRate: 75,
    temperature: 36.5,
    weight: 70,
    height: 170,
    symptoms: ['Mệt mỏi nhẹ'],
    notes: 'Huyết áp hơi cao, cần theo dõi',
    recordedBy: 'cg1'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'act1',
    elderlyId: '1',
    type: 'exercise',
    title: 'Đi bộ buổi sáng',
    description: 'Đi bộ 30 phút trong công viên',
    duration: 30,
    date: new Date('2023-11-15'),
    status: 'completed',
    notes: 'Thời tiết tốt, bệnh nhân vui vẻ'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalElderly: 3,
  activeElderly: 3,
  totalAppointments: 15,
  completedAppointments: 12,
  totalCaregivers: 3,
  availableCaregivers: 2,
  criticalCases: 1,
  upcomingAppointments: 3
};
