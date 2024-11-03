import React, { useState, useEffect } from 'react';
import { Measurement } from '../../types/measurement';

interface Recommendation {
  id: number;
  type: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

const MeasurementRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-container">
      <h2>Personalized Recommendations</h2>

      {loading ? (
        <div className="loading">Loading recommendations...</div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map(recommendation => (
            <div 
              key={recommendation.id}
              className={`recommendation-card priority-${recommendation.priority}`}
            >
              <div className="recommendation-header">
                <span className="recommendation-type">{recommendation.type}</span>
                <span className={`priority-badge ${recommendation.priority}`}>
                  {recommendation.priority} priority
                </span>
              </div>

              <p className="recommendation-message">{recommendation.message}</p>

              {recommendation.actionItems.length > 0 && (
                <div className="action-items">
                  <h4>Suggested Actions:</h4>
                  <ul>
                    {recommendation.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeasurementRecommendations; 