import React from 'react';
import { Measurement } from '../../types/measurement';

interface Props {
  measurements: Measurement[];
}

const MeasurementHistory: React.FC<Props> = ({ measurements }) => {
  return (
    <div className="measurement-history">
      {measurements.length === 0 ? (
        <p>No measurements recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shoulder</th>
              <th>Chest</th>
              <th>Waist</th>
              <th>Hip</th>
              <th>Inseam</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((measurement) => (
              <tr key={measurement.id}>
                <td>{new Date(measurement.createdAt).toLocaleDateString()}</td>
                <td>{measurement.shoulderWidth}cm</td>
                <td>{measurement.chestCircumference}cm</td>
                <td>{measurement.waistCircumference}cm</td>
                <td>{measurement.hipCircumference}cm</td>
                <td>{measurement.inseamLength}cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MeasurementHistory; 