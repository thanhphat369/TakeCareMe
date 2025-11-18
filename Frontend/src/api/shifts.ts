import api from '../config/api';

export interface Shift {
  shiftId: number;
  staffId: number;
  staff?: {
    userId: number;
    fullName: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  location?: string;
  note?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  elders?: Array<{
    elderId: number;
    user?: {
      fullName: string;
      email: string;
    };
  }>;
}

export interface CreateShiftDto {
  staffId: number;
  startTime: string;
  endTime: string;
  location?: string;
  note?: string;
}

export interface UpdateShiftDto {
  startTime?: string;
  endTime?: string;
  location?: string;
  note?: string;
  status?: string;
}

// Lấy danh sách ca trực
export async function getShifts(params?: {
  staffId?: number;
  status?: string;
  from?: string;
  to?: string;
}): Promise<Shift[]> {
  const queryParams = new URLSearchParams();
  if (params?.staffId) queryParams.append('staffId', params.staffId.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);

  const res = await api.get(`/api/shifts?${queryParams.toString()}`);
  return res.data;
}

// Lấy ca trực của tôi hôm nay
export async function getMyShiftsToday(): Promise<Shift[]> {
  const res = await api.get('/api/shifts/my-shifts-today');
  return res.data;
}

// Lấy lịch trực của chính tôi
export async function getMyShifts(params?: {
  status?: string;
  from?: string;
  to?: string;
}): Promise<Shift[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);

  const query = queryParams.toString();
  const url = query ? `/api/shifts/my?${query}` : '/api/shifts/my';
  const res = await api.get(url);
  return res.data;
}

// Lấy chi tiết một ca trực
export async function getShift(id: number): Promise<Shift> {
  const res = await api.get(`/api/shifts/${id}`);
  return res.data;
}

// Tạo ca trực mới
export async function createShift(data: CreateShiftDto): Promise<Shift> {
  const res = await api.post('/api/shifts', data);
  return res.data;
}

// Cập nhật ca trực
export async function updateShift(
  id: number,
  data: UpdateShiftDto,
): Promise<Shift> {
  const res = await api.patch(`/api/shifts/${id}`, data);
  return res.data;
}

// Xóa ca trực
export async function deleteShift(id: number): Promise<void> {
  await api.delete(`/api/shifts/${id}`);
}

// Phân công người cao tuổi cho ca trực
export async function assignEldersToShift(
  shiftId: number,
  elderIds: number[],
): Promise<Shift> {
  const res = await api.patch(`/api/shifts/${shiftId}/assign-elders`, {
    elderIds,
  });
  return res.data;
}

// Bắt đầu ca trực
export async function startShift(id: number): Promise<Shift> {
  const res = await api.patch(`/api/shifts/${id}/start`);
  return res.data;
}

// Hoàn thành ca trực
export async function completeShift(id: number): Promise<Shift> {
  const res = await api.patch(`/api/shifts/${id}/complete`);
  return res.data;
}

// Import nhiều ca trực từ file Excel
export async function importShifts(file: File): Promise<{ 
  success: boolean; 
  message: string; 
  imported: number; 
  failed: number;
  errors?: string[];
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/api/shifts/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}



