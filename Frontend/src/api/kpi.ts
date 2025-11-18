import api from '../config/api';

export interface StaffKPI {
  staffId: number;
  staffName: string;
  role: string;
  totalCareVisits: number;
  careVisitsThisMonth: number;
  careVisitsThisWeek: number;
  averageResponseTimeMinutes: number;
  totalAlertsAssigned: number;
  alertsAcknowledged: number;
  alertsResolved: number;
  averageResponseTime: number;
  fastestResponseTime: number;
  slowestResponseTime: number;
}

export interface KPISummary {
  totalStaff: number;
  totalCareVisits: number;
  totalAlerts: number;
  averageResponseTime: number;
  topPerformers: StaffKPI[];
  fastestResponders: StaffKPI[];
}

// Lấy KPI của một nhân viên
export async function getStaffKPI(
  staffId: number,
  params?: { from?: string; to?: string },
): Promise<StaffKPI> {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);

  const res = await api.get(
    `/api/kpi/staff/${staffId}?${queryParams.toString()}`,
  );
  return res.data;
}

// Lấy KPI của tất cả nhân viên
export async function getAllStaffKPIs(params?: {
  from?: string;
  to?: string;
  department?: string;
}): Promise<StaffKPI[]> {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);
  if (params?.department) queryParams.append('department', params.department);

  const res = await api.get(`/api/kpi/staff?${queryParams.toString()}`);
  return res.data;
}

// Lấy tổng quan KPI
export async function getKPISummary(params?: {
  from?: string;
  to?: string;
  department?: string;
}): Promise<KPISummary> {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);
  if (params?.department) queryParams.append('department', params.department);

  const res = await api.get(`/api/kpi/summary?${queryParams.toString()}`);
  return res.data;
}

// Lấy lịch sử chăm sóc của nhân viên
export async function getCareHistory(
  staffId: number,
  limit?: number,
): Promise<any[]> {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());

  const res = await api.get(
    `/api/kpi/staff/${staffId}/care-history?${queryParams.toString()}`,
  );
  return res.data;
}

// Lấy lịch sử cảnh báo của nhân viên
export async function getAlertHistory(
  staffId: number,
  limit?: number,
): Promise<any[]> {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());

  const res = await api.get(
    `/api/kpi/staff/${staffId}/alert-history?${queryParams.toString()}`,
  );
  return res.data;
}













