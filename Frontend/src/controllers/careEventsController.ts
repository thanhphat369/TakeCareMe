import apiClient from '../api/apiClient';

interface CareEventPayload {
  elderId: number;
  scheduleId?: number | null;
  type: string;
  notes?: string | null;
  timestamp?: string | null;
  performedBy?: number | null;
}

export async function fetchCareEvents() {
  const res = await apiClient.get('/api/care-events', { params: { page: 1, limit: 100 } });
  const raw = res.data?.data || res.data || [];
  return raw.map((r: any) => ({
    id: String(r.eventId ?? r.id),
    elderId: r.elderId,
    scheduleId: r.scheduleId ?? null,
    type: r.type,
    notes: r.notes,
    timestamp: r.timestamp,
    performedBy: r.performedBy,
    attachments: r.attachments || null,
  }));
}

export async function createCareEvent(payload: CareEventPayload) {
  const res = await apiClient.post('/api/care-events', payload);
  return res.data;
}

export async function updateCareEvent(id: string, payload: CareEventPayload) {
  const res = await apiClient.patch(`/api/care-events/${id}`, payload);
  return res.data;
}

export async function deleteCareEvent(id: string) {
  await apiClient.delete(`/api/care-events/${id}`);
}


