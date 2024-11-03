import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Measurement } from '../../types/measurement';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  measurements: Measurement[];
}

const MeasurementChart: React.FC<Props> = ({ measurements }) => {
  const dates = measurements.map(m => 
    new Date(m.createdAt).toLocaleDateString()
  ).reverse();

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Chest',
        data: measurements.map(m => m.chestCircumference).reverse(),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Waist',
        data: measurements.map(m => m.waistCircumference).reverse(),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      },
      {
        label: 'Hip',
        data: measurements.map(m => m.hipCircumference).reverse(),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Measurement Trends Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <div className="measurement-chart">
      {measurements.length === 0 ? (
        <p>No data available for visualization</p>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export default MeasurementChart; 