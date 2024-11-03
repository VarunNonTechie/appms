import React from 'react';
import { Measurement } from '../../types/measurement';

interface Props {
  measurements: Measurement[];
}

const ComparisonTable: React.FC<Props> = ({ measurements }) => {
  const calculateDifference = (current: number, previous: number) => {
    const diff = current - previous;
    return {
      value: Math.abs(diff).toFixed(1),
      direction: diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'same'
    };
  };

  const [current, previous] = measurements;

  return (
    <div className="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Measurement</th>
            <th>{new Date(previous.createdAt).toLocaleDateString()}</th>
            <th>{new Date(current.createdAt).toLocaleDateString()}</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(current)
            .filter(([key]) => 
              ['shoulderWidth', 'chestCircumference', 'waistCircumference', 'hipCircumference', 'inseamLength']
              .includes(key)
            )
            .map(([key, value]) => {
              const diff = calculateDifference(
                value as number,
                previous[key as keyof Measurement] as number
              );
              
              return (
                <tr key={key}>
                  <td>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                  <td>{previous[key as keyof Measurement]}cm</td>
                  <td>{value}cm</td>
                  <td className={`difference ${diff.direction}`}>
                    {diff.direction === 'same' ? 
                      'No change' : 
                      `${diff.value}cm ${diff.direction === 'increase' ? '↑' : '↓'}`
                    }
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable; 