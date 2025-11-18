import apiClient from './apiClient';

export interface Appointment {
  appointmentId: number;
  elderId: number;
  doctorId?: number;
  staffId?: number;
  nurseId?: number; // Backend uses nurseId
  visitDate: string;
  nextVisitDate?: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  careType?: 'Doctor' | 'Nurse';
  elder?: {
    elderId: number;
    fullName: string;
  };
  doctor?: {
    userId: number;
    fullName: string;
  };
  staff?: {
    userId: number;
    fullName: string;
  };
  nurse?: {
    userId: number;
    fullName: string;
  }; // Backend uses nurse relation
}

export interface CreateAppointmentDto {
  elderId: number;
  doctorId?: number;
  staffId?: number; // Frontend uses staffId, but backend expects nurseId
  nurseId?: number; // Backend expects nurseId
  visitDate: string;
  nextVisitDate?: string;
  notes?: string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled';
  careType?: 'Doctor' | 'Nurse';
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}

// Get all appointments or by elderId
export async function getAppointments(elderId?: number): Promise<Appointment[]> {
  const params = elderId ? { elderId } : {};
  const res = await apiClient.get('/api/appointments', { params });
  return res.data;
}

// Get single appointment
export async function getAppointment(id: number): Promise<Appointment> {
  const res = await apiClient.get(`/api/appointments/${id}`);
  return res.data;
}

// Create appointment
export async function createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
  const res = await apiClient.post('/api/appointments', data);
  return res.data;
}

// Update appointment
export async function updateAppointment(
  id: number,
  data: UpdateAppointmentDto
): Promise<Appointment> {
  const res = await apiClient.patch(`/api/appointments/${id}`, data);
  return res.data;
}

// Delete appointment
export async function deleteAppointment(id: number): Promise<void> {
  await apiClient.delete(`/api/appointments/${id}`);
}
