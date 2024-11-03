import React, { useState, useEffect } from 'react';
import { Measurement } from '../../types/measurement';
import ComparisonChart from './ComparisonChart';
import ComparisonTable from './ComparisonTable';
import ProgressIndicator from './ProgressIndicator';

const MeasurementComparison: React.FC = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/measurements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMeasurements(data);
      
      // Select the two most recent measurements by default
      if (data.length >= 2) {
        setSelectedDates([
          data[0].createdAt,
          data[1].createdAt
        ]);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMeasurements = () => {
    return measurements.filter(m => 
      selectedDates.includes(m.createdAt)
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  if (loading) {
    return <div className="loading">Loading comparison data...</div>;
  }

  return (
    <div className="comparison-container">
      <h2>Measurement Comparison</h2>
      
      <div className="date-selector">
        <h3>Select dates to compare:</h3>
        <div className="date-picker-group">
          {measurements.map(m => (
            <label key={m.id} className="date-checkbox">
              <input
                type="checkbox"
                checked={selectedDates.includes(m.createdAt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    if (selectedDates.length < 2) {
                      setSelectedDates([...selectedDates, m.createdAt]);
                    }
                  } else {
                    setSelectedDates(selectedDates.filter(d => d !== m.createdAt));
                  }
                }}
                disabled={!selectedDates.includes(m.createdAt) && selectedDates.length >= 2}
              />
              {new Date(m.createdAt).toLocaleDateString()}
            </label>
          ))}
        </div>
      </div>

      {selectedDates.length === 2 && (
        <>
          <ComparisonChart measurements={getSelectedMeasurements()} />
          <ComparisonTable measurements={getSelectedMeasurements()} />
          <ProgressIndicator measurements={getSelectedMeasurements()} />
        </>
      )}
    </div>
  );
};

export default MeasurementComparison; 