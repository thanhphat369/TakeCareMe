import apiClient from './apiClient';

export interface Alert {
  alertId: number;
  elderId: number;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  triggeredAt: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  assignedTo?: number;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
  elder?: {
    elderId: number;
    fullName: string;
  };
  assignee?: {
    userId: number;
    fullName: string;
  };
}

export interface AlertStatistics {
  total: number;
  bySeverity: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
  byStatus: {
    Open: number;
    Acknowledged: number;
    Resolved: number;
  };
}

export async function getAlertsByElder(
  elderId: number,
  params?: {
    status?: string;
    severity?: string;
    from?: string;
    to?: string;
  }
): Promise<Alert[]> {
  const response = await apiClient.get(`/api/alerts`, {
    params: {
      elderId,
      ...params,
    },
  });
  return response.data?.data || response.data || [];
}

export async function getAlertStatistics(
  elderId?: number
): Promise<AlertStatistics> {
  try {
    const response = await apiClient.get(`/api/alerts/statistics`, {
      params: elderId ? { elderId } : {},
    });
    const data = response.data?.data || response.data;
    
    // Backend returns: { total, open, acknowledged, resolved, criticalOpen, highOpen }
    // Map to frontend format
    if (data) {
      return {
        total: data.total || 0,
        bySeverity: {
          Critical: data.criticalOpen || 0,
          High: data.highOpen || 0,
          Medium: 0, // Backend doesn't provide this, calculate from total if needed
          Low: 0, // Backend doesn't provide this, calculate from total if needed
        },
        byStatus: {
          Open: data.open || 0,
          Acknowledged: data.acknowledged || 0,
          Resolved: data.resolved || 0,
        },
      };
    }
    
    return {
      total: 0,
      bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      byStatus: { Open: 0, Acknowledged: 0, Resolved: 0 },
    };
  } catch (error: any) {
    console.error('Error fetching alert statistics:', error);
    return {
      total: 0,
      bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      byStatus: { Open: 0, Acknowledged: 0, Resolved: 0 },
    };
  }
}

