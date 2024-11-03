import React, { useState, useEffect } from 'react';
import { Achievement } from '../../types/achievement';
import './AchievementDisplay.css';

const AchievementDisplay: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const filteredAchievements = selectedType === 'all'
    ? achievements
    : achievements.filter(a => a.type === selectedType);

  return (
    <div className="achievements-container">
      <h2>Achievements</h2>
      
      <div className="achievement-filters">
        <button 
          className={selectedType === 'all' ? 'active' : ''}
          onClick={() => setSelectedType('all')}
        >
          All
        </button>
        <button 
          className={selectedType === 'measurement' ? 'active' : ''}
          onClick={() => setSelectedType('measurement')}
        >
          Measurements
        </button>
        <button 
          className={selectedType === 'streak' ? 'active' : ''}
          onClick={() => setSelectedType('streak')}
        >
          Streaks
        </button>
        <button 
          className={selectedType === 'goal' ? 'active' : ''}
          onClick={() => setSelectedType('goal')}
        >
          Goals
        </button>
        <button 
          className={selectedType === 'xp' ? 'active' : ''}
          onClick={() => setSelectedType('xp')}
        >
          XP
        </button>
      </div>

      <div className="achievements-grid">
        {filteredAchievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              {achievement.unlocked && (
                <span className="unlock-date">
                  Unlocked: {new Date(achievement.unlockedAt!).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementDisplay; 