import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MedicationFrequencyChartProps {
  byFrequency: Record<string, number>;
}

const MedicationFrequencyChart: React.FC<MedicationFrequencyChartProps> = ({ byFrequency }) => {
  const chartData = useMemo(() => {
    const frequencies = Object.keys(byFrequency);
    const counts = Object.values(byFrequency);

    if (frequencies.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: frequencies,
      datasets: [
        {
          label: 'Số lượng thuốc',
          data: counts,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  }, [byFrequency]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Phân bố tần suất dùng thuốc',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Số lượng thuốc',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Tần suất',
        },
      },
    },
  };

  if (Object.keys(byFrequency).length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Chưa có dữ liệu thuốc
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MedicationFrequencyChart;







