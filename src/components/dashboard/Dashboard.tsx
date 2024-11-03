import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MeasurementHistory from './MeasurementHistory';
import MeasurementChart from './MeasurementChart';
import { Measurement } from '../../types/measurement';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/measurements/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMeasurements(data);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button 
          className="new-measurement-btn"
          onClick={() => window.location.href = '/measure'}
        >
          New Measurement
        </button>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card latest-measurements">
          <h2>Latest Measurements</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <MeasurementHistory measurements={measurements} />
          )}
        </div>

        <div className="dashboard-card measurement-trends">
          <h2>Measurement Trends</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <MeasurementChart measurements={measurements} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 