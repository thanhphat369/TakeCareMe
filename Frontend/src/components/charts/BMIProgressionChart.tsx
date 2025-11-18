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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BMIHistoryPoint {
  date: string;
  value: number;
}

interface BMIProgressionChartProps {
  history: BMIHistoryPoint[];
  current: number;
}

const BMIProgressionChart: React.FC<BMIProgressionChartProps> = ({ history, current }) => {
  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sort by date
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sortedHistory.map((point) =>
      dayjs(point.date).format('DD/MM/YYYY')
    );
    const values = sortedHistory.map((point) => point.value);

    return {
      labels,
      datasets: [
        {
          label: 'BMI',
          data: values,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        // Add reference lines for BMI categories
        {
          label: 'BMI Bình thường (18.5-25)',
          data: Array(labels.length).fill(21.75), // Middle of normal range
          borderColor: 'rgba(34, 197, 94, 0.3)',
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [history]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tiến triển BMI theo thời gian',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.datasetIndex === 0) {
              const value = context.parsed.y;
              let status = '';
              if (value < 18.5) status = ' (Thiếu cân)';
              else if (value > 25) status = ' (Thừa cân)';
              else status = ' (Bình thường)';
              return `BMI: ${value.toFixed(1)}${status}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        min: 15,
        max: 30,
        title: {
          display: true,
          text: 'BMI',
        },
        grid: {
          color: function (context: any) {
            if (context.tick.value === 18.5 || context.tick.value === 25) {
              return 'rgba(34, 197, 94, 0.5)';
            }
            return 'rgba(0, 0, 0, 0.1)';
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
      },
    },
  };

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Chưa có dữ liệu BMI
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default BMIProgressionChart;







