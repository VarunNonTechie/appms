import { Goal } from '../models/Goal';
import { Measurement } from '../models/Measurement';
import { notificationService } from './NotificationService';
import { MLRecommendationService } from './MLRecommendationService';

class GoalTrackingService {
  async createGoal(userId: number, goalData: any) {
    try {
      const latestMeasurement = await Measurement.findOne({
        where: { userId, measurementType: goalData.measurementType },
        order: [['createdAt', 'DESC']]
      });

      const goal = await Goal.create({
        ...goalData,
        userId,
        startValue: latestMeasurement?.value || goalData.startValue,
        progressUpdates: [{
          date: new Date(),
          value: latestMeasurement?.value || goalData.startValue,
          note: 'Goal started'
        }]
      });

      return goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async updateGoalProgress(goalId: number, measurement: Measurement) {
    try {
      const goal = await Goal.findByPk(goalId);
      if (!goal) throw new Error('Goal not found');

      const progressUpdate = {
        date: new Date(),
        value: measurement[goal.measurementType],
        note: 'Measurement update'
      };

      goal.progressUpdates = [...goal.progressUpdates, progressUpdate];
      
      // Check goal progress
      const progress = this.calculateProgress(goal);
      
      // Update goal status if needed
      if (this.hasReachedTarget(goal, measurement)) {
        goal.status = 'completed';
        await notificationService.createNotification(
          goal.userId,
          'goal_achieved',
          `Congratulations! You've reached your ${goal.measurementType} goal!`
        );
      } else if (this.hasPassedDeadline(goal)) {
        goal.status = 'failed';
        await notificationService.createNotification(
          goal.userId,
          'goal_missed',
          `Your ${goal.measurementType} goal has expired. Let's set a new goal!`
        );
      }

      await goal.save();

      // Get ML-based recommendations
      const recommendations = await MLRecommendationService.getRecommendations(goal);
      
      return {
        goal,
        progress,
        recommendations
      };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  private calculateProgress(goal: Goal) {
    const totalChange = Math.abs(goal.targetValue - goal.startValue);
    const currentValue = goal.progressUpdates[goal.progressUpdates.length - 1].value;
    const currentChange = Math.abs(currentValue - goal.startValue);
    
    return {
      percentage: (currentChange / totalChange) * 100,
      remaining: Math.abs(goal.targetValue - currentValue),
      trend: this.calculateTrend(goal.progressUpdates)
    };
  }

  private calculateTrend(updates: any[]) {
    if (updates.length < 2) return 'insufficient_data';

    const recentUpdates = updates.slice(-5); // Look at last 5 updates
    const changes = [];

    for (let i = 1; i < recentUpdates.length; i++) {
      changes.push(recentUpdates[i].value - recentUpdates[i-1].value);
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    
    if (Math.abs(avgChange) < 0.1) return 'plateau';
    return avgChange > 0 ? 'improving' : 'declining';
  }

  private hasReachedTarget(goal: Goal, measurement: Measurement) {
    const currentValue = measurement[goal.measurementType];
    const isDecrease = goal.targetValue < goal.startValue;
    
    return isDecrease ? 
      currentValue <= goal.targetValue :
      currentValue >= goal.targetValue;
  }

  private hasPassedDeadline(goal: Goal) {
    return new Date() > goal.deadline;
  }
}

export const goalTrackingService = new GoalTrackingService();