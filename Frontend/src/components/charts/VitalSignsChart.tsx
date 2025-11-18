import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { VitalReadingDto } from '../../api/vitals';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VitalSignsChartProps {
  data: VitalReadingDto[];
  period: 'day' | 'week' | 'month';
}

const VitalSignsChart: React.FC<VitalSignsChartProps> = ({ data, period }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Group by type
    const groupedByType: Record<string, VitalReadingDto[]> = {};
    data.forEach((reading) => {
      if (!groupedByType[reading.type]) {
        groupedByType[reading.type] = [];
      }
      groupedByType[reading.type].push(reading);
    });

    // Sort each group by timestamp
    Object.keys(groupedByType).forEach((type) => {
      groupedByType[type].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    // Define colors for different vital types
    const typeColors: Record<string, { border: string; background: string }> = {
      'Huyết áp tâm thu': { border: 'rgb(239, 68, 68)', background: 'rgba(239, 68, 68, 0.1)' },
      'Huyết áp tâm trương': { border: 'rgb(220, 38, 38)', background: 'rgba(220, 38, 38, 0.1)' },
      'Nhịp tim': { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.1)' },
      'Nhiệt độ': { border: 'rgb(245, 158, 11)', background: 'rgba(245, 158, 11, 0.1)' },
      'SpO2': { border: 'rgb(34, 197, 94)', background: 'rgba(34, 197, 94, 0.1)' },
      'Đường huyết': { border: 'rgb(168, 85, 247)', background: 'rgba(168, 85, 247, 0.1)' },
    };

    // Get all unique timestamps and sort them
    const allTimestamps = new Set<string>();
    Object.values(groupedByType).forEach((readings) => {
      readings.forEach((r) => {
        const timestamp = dayjs(r.timestamp).format(
          period === 'day' ? 'HH:mm' : period === 'week' ? 'DD/MM' : 'DD/MM'
        );
        allTimestamps.add(timestamp);
      });
    });
    const sortedLabels = Array.from(allTimestamps).sort((a, b) => {
      if (period === 'day') {
        return a.localeCompare(b);
      }
      return dayjs(a, 'DD/MM').unix() - dayjs(b, 'DD/MM').unix();
    });

    const datasets = Object.keys(groupedByType).map((type) => {
      const readings = groupedByType[type];
      const colors = typeColors[type] || {
        border: 'rgb(107, 114, 128)',
        background: 'rgba(107, 114, 128, 0.1)',
      };

      // Create data points for each label
      const data = sortedLabels.map((label) => {
        const matchingReading = readings.find((r) => {
          const rLabel = dayjs(r.timestamp).format(
            period === 'day' ? 'HH:mm' : period === 'week' ? 'DD/MM' : 'DD/MM'
          );
          return rLabel === label;
        });
        return matchingReading ? matchingReading.value : null;
      });

      return {
        label: type,
        data,
        borderColor: colors.border,
        backgroundColor: colors.background,
        tension: 0.4,
        fill: false,
      };
    });

    return {
      labels: sortedLabels,
      datasets,
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Biểu đồ sinh hiệu - ${period === 'day' ? 'Ngày' : period === 'week' ? 'Tuần' : 'Tháng'}`,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            // Try to find a reading with this type to get the unit
            const sampleReading = data.find((r) => r.type === datasetLabel);
            const unit = sampleReading?.unit || '';
            return `${datasetLabel}: ${value} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Giá trị',
        },
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        Chưa có dữ liệu sinh hiệu
      </div>
    );
  }

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default VitalSignsChart;

