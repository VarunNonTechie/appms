import React from 'react';
import { Measurement } from '../../types/measurement';

interface Props {
  measurements: Measurement[];
}

const ProgressIndicator: React.FC<Props> = ({ measurements }) => {
  const [current, previous] = measurements;

  const calculateProgress = () => {
    const measurementTypes = [
      'waistCircumference',
      'hipCircumference',
      'chestCircumference'
    ];

    const changes = measurementTypes.map(type => {
      const currentValue = current[type as keyof Measurement] as number;
      const previousValue = previous[type as keyof Measurement] as number;
      return {
        type: type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        change: ((currentValue - previousValue) / previousValue) * 100
      };
    });

    return changes;
  };

  const progress = calculateProgress();

  return (
    <div className="progress-indicator">
      <h3>Progress Summary</h3>
      <div className="progress-grid">
        {progress.map(({ type, change }) => (
          <div key={type} className="progress-item">
            <div className="progress-label">{type}</div>
            <div className={`progress-value ${change > 0 ? 'increase' : 'decrease'}`}>
              {Math.abs(change).toFixed(1)}% {change > 0 ? '↑' : '↓'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator; 