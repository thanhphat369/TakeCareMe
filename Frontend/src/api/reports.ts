import apiClient from './apiClient';

export interface ReportRequest {
  elderId: number;
  type: 'vital' | 'medical' | 'comprehensive';
  period: 'day' | 'week' | 'month';
  format: 'pdf' | 'csv';
  from?: string;
  to?: string;
}

export async function generateReport(request: ReportRequest): Promise<Blob> {
  const response = await apiClient.post(
    `/api/reports/generate`,
    request,
    {
      responseType: 'blob',
    }
  );
  return response.data;
}

export async function downloadReport(
  elderId: number,
  format: 'pdf' | 'csv',
  period: 'day' | 'week' | 'month',
  from?: string,
  to?: string
): Promise<void> {
  try {
    const blob = await generateReport({
      elderId,
      type: 'comprehensive',
      period,
      format,
      from,
      to,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const extension = format === 'pdf' ? 'pdf' : 'csv';
    const filename = `BaoCao_${elderId}_${period}_${new Date().toISOString().split('T')[0]}.${extension}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Error downloading report:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải báo cáo');
  }
}







