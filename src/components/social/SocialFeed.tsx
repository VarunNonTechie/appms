import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GoalCard from './GoalCard';
import { SharedGoal } from '../../types/social';

const SocialFeed: React.FC = () => {
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSharedGoals();
  }, []);

  const fetchSharedGoals = async () => {
    try {
      const response = await fetch('/api/social/shared-goals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSharedGoals(data);
    } catch (error) {
      console.error('Error fetching shared goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (shareId: number, type: 'like' | 'comment', content?: string) => {
    try {
      const response = await fetch('/api/social/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ shareId, type, content })
      });

      if (response.ok) {
        // Update shared goals state
        const updatedGoals = [...sharedGoals];
        const goalIndex = updatedGoals.findIndex(g => g.id === shareId);
        if (goalIndex !== -1) {
          if (type === 'like') {
            updatedGoals[goalIndex].likes.push({ userId: user!.id });
          } else if (type === 'comment') {
            updatedGoals[goalIndex].comments.push({
              userId: user!.id,
              content: content!,
              createdAt: new Date().toISOString()
            });
          }
          setSharedGoals(updatedGoals);
        }
      }
    } catch (error) {
      console.error('Error adding interaction:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading social feed...</div>;
  }

  return (
    <div className="social-feed">
      {sharedGoals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onLike={() => handleInteraction(goal.id, 'like')}
          onComment={(content) => handleInteraction(goal.id, 'comment', content)}
        />
      ))}
    </div>
  );
};

export default SocialFeed; 