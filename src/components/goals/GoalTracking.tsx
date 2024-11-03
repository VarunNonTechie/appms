import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Goal } from '../../types/goal';
import { MLRecommendation } from '../../types/recommendation';

interface Props {
  goal: Goal;
  onUpdateGoal: (goalId: number) => void;
}

const GoalTracking: React.FC<Props> = ({ goal, onUpdateGoal }) => {
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);

  useEffect(() => {
    fetchRecommendations();
  }, [goal]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/goals/${goal.id}/recommendations`);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const chartData = {
    labels: goal.progressUpdates.map(update => 
      new Date(update.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Progress',
        data: goal.progressUpdates.map(update => update.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Target',
        data: Array(goal.progressUpdates.length).fill(goal.targetValue),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5]
      }
    ]
  };

  return (
    <div className="goal-tracking">
      <h3>{goal.measurementType} Goal Progress</h3>
      
      <div className="goal-stats">
        <div className="stat">
          <label>Start Value</label>
          <span>{goal.startValue}</span>
        </div>
        <div className="stat">
          <label>Current Value</label>
          <span>{goal.progressUpdates[goal.progressUpdates.length - 1].value}</span>
        </div>
        <div className="stat">
          <label>Target Value</label>
          <span>{goal.targetValue}</span>
        </div>
        <div className="stat">
          <label>Days Remaining</label>
          <span>{Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}</span>
        </div>
      </div>

      <div className="goal-chart">
        <Line data={chartData} />
      </div>

      <div className="recommendations">
        <h4>AI Recommendations</h4>
        {recommendations.map((rec, index) => (
          <div key={index} className={`recommendation ${rec.priority}`}>
            <p className="message">{rec.message}</p>
            <ul className="suggestions">
              {rec.suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracking; 