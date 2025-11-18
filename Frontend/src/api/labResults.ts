import apiClient from './apiClient';

export interface LabResult {
  resultId: number;
  elderId: number;
  testDate?: string;
  testType?: string;
  result?: string;
  notes?: string;
  elder?: {
    elderId: number;
    fullName: string;
  };
}

export interface CreateLabResultDto {
  elderId: number;
  testDate?: string;
  testType?: string;
  result?: string;
  notes?: string;
}

export interface UpdateLabResultDto extends Partial<CreateLabResultDto> {}

// Get all lab results or by elderId
export async function getLabResults(elderId?: number): Promise<LabResult[]> {
  const params = elderId ? { elderId } : {};
  const res = await apiClient.get('/api/lab-results', { params });
  return res.data;
}

// Get single lab result
export async function getLabResult(id: number): Promise<LabResult> {
  const res = await apiClient.get(`/api/lab-results/${id}`);
  return res.data;
}

// Create lab result
export async function createLabResult(data: CreateLabResultDto): Promise<LabResult> {
  const res = await apiClient.post('/api/lab-results', data);
  return res.data;
}

// Update lab result
export async function updateLabResult(
  id: number,
  data: UpdateLabResultDto
): Promise<LabResult> {
  const res = await apiClient.patch(`/api/lab-results/${id}`, data);
  return res.data;
}

// Delete lab result
export async function deleteLabResult(id: number): Promise<void> {
  await apiClient.delete(`/api/lab-results/${id}`);
}








