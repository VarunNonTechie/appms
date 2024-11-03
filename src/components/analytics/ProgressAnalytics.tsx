import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { ProgressAnalytics } from '../../types/analytics';

interface Props {
  goalId: number;
}

const ProgressAnalytics: React.FC<Props> = ({ goalId }) => {
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [goalId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/goals/${goalId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="error">Failed to load analytics</div>;
  }

  return (
    <div className="progress-analytics">
      <div className="analytics-section">
        <h3>Progress Trends</h3>
        <div className="trend-stats">
          <div className="stat">
            <label>Average Change/Day</label>
            <span>{analytics.trendAnalysis.averageChangePerDay.toFixed(2)}</span>
          </div>
          <div className="stat">
            <label>Consistency Score</label>
            <span>{(analytics.trendAnalysis.consistency * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="trend-chart">
          <Line data={/* ... chart data ... */} />
        </div>
      </div>

      <div className="analytics-section">
        <h3>Milestones</h3>
        <div className="milestone-list">
          {analytics.milestones.map(milestone => (
            <div 
              key={milestone.percentage}
              className={`milestone ${milestone.achieved ? 'achieved' : ''}`}
            >
              <div className="milestone-header">
                <span>{milestone.percentage}%</span>
                {milestone.achieved && (
                  <span className="achievement-date">
                    {new Date(milestone.achievedDate!).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="milestone-value">{milestone.value.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h3>Insights & Recommendations</h3>
        <div className="insights-list">
          {analytics.insights.map((insight, index) => (
            <div key={index} className={`insight ${insight.priority}`}>
              <p className="insight-message">{insight.message}</p>
              <ul className="insight-suggestions">
                {insight.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics; 