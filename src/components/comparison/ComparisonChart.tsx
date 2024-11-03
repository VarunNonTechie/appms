import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Measurement } from '../../types/measurement';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  measurements: Measurement[];
}

const ComparisonChart: React.FC<Props> = ({ measurements }) => {
  const measurementTypes = [
    'shoulderWidth',
    'chestCircumference',
    'waistCircumference',
    'hipCircumference',
    'inseamLength'
  ];

  const labels = measurementTypes.map(type => 
    type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  );

  const data = {
    labels,
    datasets: measurements.map((m, index) => ({
      label: new Date(m.createdAt).toLocaleDateString(),
      data: measurementTypes.map(type => m[type as keyof Measurement] as number),
      backgroundColor: index === 0 ? 'rgba(53, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)',
      borderColor: index === 0 ? 'rgb(53, 162, 235)' : 'rgb(255, 99, 132)',
      borderWidth: 1
    }))
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Measurement Comparison'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <div className="comparison-chart">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ComparisonChart; 