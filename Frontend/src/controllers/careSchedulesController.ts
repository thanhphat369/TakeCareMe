import apiClient from '../api/apiClient';

interface CareSchedulePayload {
  elderId: number;
  type: string;
  recurrence: string;
  startTime?: string | null;
  endTime?: string | null;
  assignedTo?: number | null;
  status?: string;
}

export async function fetchCareSchedules() {
  const res = await apiClient.get('/api/care-schedules', { params: { page: 1, limit: 100 } });
  const raw = res.data?.data || res.data || [];
  return raw.map((r: any) => ({
    id: String(r.scheduleId ?? r.id),
    elderId: r.elderId,
    elderName: r.elder?.fullName ?? r.elder?.user?.fullName ?? undefined,
    type: r.type,
    recurrence: r.recurrence,
    startTime: r.startTime,
    endTime: r.endTime,
    assignedTo: r.assignedTo ?? null,
    assigneeName: r.assignee?.fullName ?? undefined,
    status: r.status || 'Active',
  }));
}

export async function createCareSchedule(payload: CareSchedulePayload) {
  const res = await apiClient.post('/api/care-schedules', payload);
  return res.data;
}

export async function updateCareSchedule(id: string, payload: CareSchedulePayload) {
  const res = await apiClient.patch(`/api/care-schedules/${id}`, payload);
  return res.data;
}

export async function deleteCareSchedule(id: string) {
  await apiClient.delete(`/api/care-schedules/${id}`);
}


