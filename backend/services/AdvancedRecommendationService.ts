import { Measurement } from '../models/Measurement';
import { User } from '../models/User';
import { Goal } from '../models/Goal';
import { notificationService } from './NotificationService';

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  consistency: number;
}

class AdvancedRecommendationService {
  private readonly TREND_THRESHOLD = 0.02; // 2% change threshold
  private readonly CONSISTENCY_THRESHOLD = 0.7; // 70% consistency threshold

  async generateAdvancedRecommendations(userId: number) {
    try {
      const [measurements, goals, user] = await Promise.all([
        this.getRecentMeasurements(userId),
        Goal.findAll({ where: { userId } }),
        User.findByPk(userId)
      ]);

      if (measurements.length < 3) {
        return this.getInitialRecommendations();
      }

      const recommendations = [];

      // Analyze trends for each measurement type
      const trends = this.analyzeTrends(measurements);
      
      // Compare with goals
      const goalAnalysis = this.analyzeGoals(trends, goals);

      // Generate personalized recommendations
      recommendations.push(...this.generatePersonalizedRecommendations(
        trends,
        goalAnalysis,
        user
      ));

      // Analyze measurement patterns
      const patterns = this.analyzeMeasurementPatterns(measurements);
      recommendations.push(...this.generatePatternBasedRecommendations(patterns));

      // Prioritize recommendations
      return this.prioritizeRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating advanced recommendations:', error);
      throw error;
    }
  }

  private async getRecentMeasurements(userId: number) {
    return await Measurement.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
  }

  private analyzeTrends(measurements: Measurement[]): Record<string, TrendAnalysis> {
    const measurementTypes = ['waistCircumference', 'chestCircumference', 'hipCircumference'];
    const trends: Record<string, TrendAnalysis> = {};

    for (const type of measurementTypes) {
      const values = measurements.map(m => m[type]);
      const changes = [];

      for (let i = 1; i < values.length; i++) {
        changes.push((values[i-1] - values[i]) / values[i]);
      }

      const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
      const consistency = changes.filter(c => Math.sign(c) === Math.sign(avgChange)).length / changes.length;

      trends[type] = {
        trend: avgChange > this.TREND_THRESHOLD ? 'increasing' : 
               avgChange < -this.TREND_THRESHOLD ? 'decreasing' : 'stable',
        rate: Math.abs(avgChange),
        consistency
      };
    }

    return trends;
  }

  private analyzeGoals(trends: Record<string, TrendAnalysis>, goals: Goal[]) {
    const analysis = {};

    for (const goal of goals) {
      const trend = trends[goal.measurementType];
      if (!trend) continue;

      const isOnTrack = (goal.targetType === 'decrease' && trend.trend === 'decreasing') ||
                       (goal.targetType === 'increase' && trend.trend === 'increasing');

      analysis[goal.measurementType] = {
        isOnTrack,
        confidence: trend.consistency,
        remainingChange: this.calculateRemainingChange(goal, trend)
      };
    }

    return analysis;
  }

  private generatePersonalizedRecommendations(
    trends: Record<string, TrendAnalysis>,
    goalAnalysis: any,
    user: User
  ) {
    const recommendations = [];

    for (const [measurementType, analysis] of Object.entries(goalAnalysis)) {
      if (!analysis.isOnTrack) {
        recommendations.push({
          type: 'goal_adjustment',
          priority: analysis.confidence > this.CONSISTENCY_THRESHOLD ? 'high' : 'medium',
          message: this.generateGoalAdjustmentMessage(measurementType, analysis),
          actionItems: this.generateActionItems(measurementType, trends[measurementType], user)
        });
      }
    }

    return recommendations;
  }

  private analyzeMeasurementPatterns(measurements: Measurement[]) {
    const patterns = {
      irregularMeasurements: false,
      rapidChanges: false,
      plateaus: false
    };

    // Analyze measurement frequency
    const measurementDates = measurements.map(m => new Date(m.createdAt).getTime());
    const intervals = [];
    for (let i = 1; i < measurementDates.length; i++) {
      intervals.push(measurementDates[i-1] - measurementDates[i]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length
    );

    patterns.irregularMeasurements = stdDev / avgInterval > 0.5;

    return patterns;
  }

  private generatePatternBasedRecommendations(patterns: any) {
    const recommendations = [];

    if (patterns.irregularMeasurements) {
      recommendations.push({
        type: 'measurement_consistency',
        priority: 'medium',
        message: 'Your measurement schedule has been irregular',
        actionItems: [
          'Set up regular measurement reminders',
          'Try to measure at the same time of day',
          'Use our mobile app for quick measurements'
        ]
      });
    }

    return recommendations;
  }

  private prioritizeRecommendations(recommendations: any[]) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return recommendations.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  private getInitialRecommendations() {
    return [{
      type: 'getting_started',
      priority: 'high',
      message: 'Start tracking your measurements regularly',
      actionItems: [
        'Take measurements at least once a week',
        'Use the measurement guide for accurate results',
        'Set your fitness goals in the app'
      ]
    }];
  }
}

export const advancedRecommendationService = new AdvancedRecommendationService();