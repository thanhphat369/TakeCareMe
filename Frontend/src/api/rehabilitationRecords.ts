import apiClient from './apiClient';

export interface RehabilitationRecord {
  rehabId: number;
  elderId: number;
  startDate?: string;
  status?: string;
  notes?: string;
  elder?: {
    elderId: number;
    fullName: string;
  };
}

export interface CreateRehabilitationRecordDto {
  elderId: number;
  startDate?: string;
  status?: string;
  notes?: string;
}

export interface UpdateRehabilitationRecordDto extends Partial<CreateRehabilitationRecordDto> {}

// Get all rehabilitation records or by elderId
export async function getRehabilitationRecords(elderId?: number): Promise<RehabilitationRecord[]> {
  const params = elderId ? { elderId } : {};
  const res = await apiClient.get('/api/rehabilitation-records', { params });
  return res.data;
}

// Get single rehabilitation record
export async function getRehabilitationRecord(id: number): Promise<RehabilitationRecord> {
  const res = await apiClient.get(`/api/rehabilitation-records/${id}`);
  return res.data;
}

// Create rehabilitation record
export async function createRehabilitationRecord(
  data: CreateRehabilitationRecordDto
): Promise<RehabilitationRecord> {
  const res = await apiClient.post('/api/rehabilitation-records', data);
  return res.data;
}

// Update rehabilitation record
export async function updateRehabilitationRecord(
  id: number,
  data: UpdateRehabilitationRecordDto
): Promise<RehabilitationRecord> {
  const res = await apiClient.patch(`/api/rehabilitation-records/${id}`, data);
  return res.data;
}

// Delete rehabilitation record
export async function deleteRehabilitationRecord(id: number): Promise<void> {
  await apiClient.delete(`/api/rehabilitation-records/${id}`);
}








