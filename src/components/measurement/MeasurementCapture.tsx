import React, { useState } from 'react';
import CameraCapture from '../camera/CameraCapture';
import ImageUpload from '../camera/ImageUpload';
import { processImageMeasurements } from '../../services/measurementService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MeasurementCapture: React.FC = () => {
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload'>('camera');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageCapture = async (imageData: string) => {
    try {
      setProcessing(true);
      setError('');

      // Process image to get measurements
      const measurements = await processImageMeasurements(imageData);

      // Save measurements to backend
      const response = await fetch('http://localhost:5000/api/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?.id,
          measurements,
          imageData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save measurements');
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process measurements');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="measurement-capture">
      <h2>Take New Measurements</h2>
      
      <div className="capture-methods">
        <button
          className={`method-btn ${captureMethod === 'camera' ? 'active' : ''}`}
          onClick={() => setCaptureMethod('camera')}
        >
          Use Camera
        </button>
        <button
          className={`method-btn ${captureMethod === 'upload' ? 'active' : ''}`}
          onClick={() => setCaptureMethod('upload')}
        >
          Upload Image
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {processing ? (
        <div className="processing">
          <div className="spinner"></div>
          <p>Processing measurements...</p>
        </div>
      ) : (
        <>
          {captureMethod === 'camera' ? (
            <CameraCapture onCapture={handleImageCapture} />
          ) : (
            <ImageUpload onUpload={handleImageCapture} />
          )}
        </>
      )}

      <div className="measurement-guidelines">
        <h3>Guidelines for accurate measurements:</h3>
        <ul>
          <li>Stand straight against a plain background</li>
          <li>Wear fitting clothes</li>
          <li>Ensure good lighting</li>
          <li>Keep the reference object visible</li>
        </ul>
      </div>
    </div>
  );
};

export default MeasurementCapture; 