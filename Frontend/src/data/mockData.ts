import { Elderly, Caregiver, Appointment, HealthRecord, Activity, DashboardStats } from '../types';

export const mockElderly: Elderly[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    age: 75,
    gender: 'male',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    emergencyContact: '0907654321',
    medicalHistory: 'Cao huyết áp, Tiểu đường', // Single string
    medications: ['Metformin 500mg - 2 lần/ngày', 'Aspirin 100mg - 1 lần/ngày'], // Array of strings
    allergies: 'Penicillin', // Comma-separated string
    bloodType: 'A+',
    doctor: 'BS. Trần Văn B',
    lastCheckup: new Date('2023-11-01'),
    nextCheckup: new Date('2023-12-01'),
    status: 'monitoring',
    notes: 'Cần theo dõi huyết áp hàng ngày',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    age: 82,
    gender: 'female',
    phone: '0902345678',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    emergencyContact: '0908765432',
    medicalHistory: 'Alzheimer, Loãng xương',
    medications: ['Donepezil 5mg - 1 lần/ngày', 'Calcium 600mg - 2 lần/ngày'],
    allergies: '', // Empty string if no allergies
    bloodType: 'O+',
    doctor: 'BS. Lê Thị C',
    lastCheckup: new Date('2023-10-15'),
    nextCheckup: new Date('2023-12-15'),
    status: 'critical',
    notes: 'Cần chăm sóc đặc biệt, có người thân ở bên',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '3',
    name: 'Lê Văn Cường',
    age: 68,
    gender: 'male',
    phone: '0903456789',
    address: '789 Đường DEF, Quận 5, TP.HCM',
    emergencyContact: '0909876543',
    medicalHistory: 'Tim mạch, Cholesterol cao',
    medications: ['Aspirin 100mg - 1 lần/ngày', 'Atorvastatin 20mg - 1 lần/ngày'],
    allergies: 'Sulfa drugs',
    bloodType: 'B+',
    doctor: 'BS. Phạm Văn D',
    lastCheckup: new Date('2023-11-10'),
    nextCheckup: new Date('2024-01-10'),
    status: 'healthy',
    notes: 'Tình trạng sức khỏe ổn định',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    age: 79,
    gender: 'female',
    phone: '0904567890',
    address: '321 Đường GHI, Quận 7, TP.HCM',
    emergencyContact: '0910987654',
    medicalHistory: 'Suy thận nhẹ, Đau khớp',
    medications: ['Paracetamol 500mg - khi cần', 'Glucosamine 1500mg - 1 lần/ngày'],
    allergies: 'Không có',
    bloodType: 'AB+',
    doctor: 'BS. Nguyễn Văn E',
    lastCheckup: new Date('2023-11-05'),
    nextCheckup: new Date('2023-12-20'),
    status: 'monitoring',
    notes: 'Cần kiểm tra chức năng thận định kỳ',
    createdAt: new Date('2023-04-01'),
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
    assignedElderly: ['4']
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    elderlyId: '1',
    elderlyName: 'Nguyễn Văn An',
    doctorId: 'doc1',
    doctorName: 'BS. Trần Văn B',
    date: new Date('2023-12-01'),
    time: '09:00',
    type: 'checkup',
    status: 'scheduled',
    notes: 'Kiểm tra huyết áp, đường huyết',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: 'apt2',
    elderlyId: '2',
    elderlyName: 'Trần Thị Bình',
    doctorId: 'doc2',
    doctorName: 'BS. Lê Thị C',
    date: new Date('2023-11-20'),
    time: '14:00',
    type: 'followup',
    status: 'completed',
    notes: 'Kiểm tra tình trạng Alzheimer',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-20')
  },
  {
    id: 'apt3',
    elderlyId: '3',
    elderlyName: 'Lê Văn Cường',
    doctorId: 'doc3',
    doctorName: 'BS. Phạm Văn D',
    date: new Date('2024-01-10'),
    time: '10:30',
    type: 'checkup',
    status: 'scheduled',
    notes: 'Khám định kỳ tim mạch',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15')
  }
];

export const mockHealthRecords: HealthRecord[] = [
  {
    id: 'hr1',
    elderlyId: '1',
    date: new Date('2023-11-15'),
    diagnosis: 'Cao huyết áp',
    treatment: 'Điều chỉnh thuốc, theo dõi huyết áp',
    medications: ['Metformin 500mg', 'Aspirin 100mg'],
    doctorId: 'doc1',
    doctorName: 'BS. Trần Văn B',
    notes: 'Huyết áp 140/90, cần theo dõi',
    attachments: [],
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: 'hr2',
    elderlyId: '2',
    date: new Date('2023-10-15'),
    diagnosis: 'Alzheimer giai đoạn trung bình',
    treatment: 'Duy trì thuốc, tập luyện trí nhớ',
    medications: ['Donepezil 5mg'],
    doctorId: 'doc2',
    doctorName: 'BS. Lê Thị C',
    notes: 'Tình trạng ổn định, cần chăm sóc thường xuyên',
    attachments: [],
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-15')
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'act1',
    type: 'appointment',
    description: 'Khám sức khỏe định kỳ - Nguyễn Văn An',
    timestamp: new Date('2023-11-15T09:00:00'),
    elderlyName: 'Nguyễn Văn An',
    staffName: 'BS. Trần Văn B'
  },
  {
    id: 'act2',
    type: 'checkup',
    description: 'Kiểm tra huyết áp - Trần Thị Bình',
    timestamp: new Date('2023-11-15T10:30:00'),
    elderlyName: 'Trần Thị Bình',
    staffName: 'Y tá Nguyễn Lan'
  },
  {
    id: 'act3',
    type: 'admission',
    description: 'Nhập viện theo dõi - Lê Văn Cường',
    timestamp: new Date('2023-11-14T14:00:00'),
    elderlyName: 'Lê Văn Cường',
    staffName: 'BS. Phạm Văn D'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalElderly: 4,
  totalStaff: 12,
  todayAppointments: 5,
  criticalCases: 1,
  elderlyByStatus: {
    healthy: 1,
    monitoring: 2,
    critical: 1
  },
  staffByRole: {
    doctors: 5,
    nurses: 7
  },
  recentActivities: mockActivities.slice(0, 5)
};