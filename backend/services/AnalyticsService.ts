import { Goal } from '../models/Goal';
import { Measurement } from '../models/Measurement';
import * as tf from '@tensorflow/tfjs-node';

class AnalyticsService {
  async generateProgressAnalytics(userId: number, goalId: number) {
    try {
      const goal = await Goal.findByPk(goalId);
      if (!goal) throw new Error('Goal not found');

      const measurements = await Measurement.findAll({
        where: { userId, measurementType: goal.measurementType },
        order: [['createdAt', 'ASC']]
      });

      return {
        trendAnalysis: this.analyzeTrends(measurements, goal),
        progressPrediction: await this.predictProgress(measurements, goal),
        milestones: this.calculateMilestones(goal),
        insights: this.generateInsights(measurements, goal)
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  }

  private analyzeTrends(measurements: Measurement[], goal: Goal) {
    const values = measurements.map(m => m[goal.measurementType]);
    const dates = measurements.map(m => new Date(m.createdAt).getTime());

    // Calculate rate of change
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      const timeDiff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24); // days
      const valueDiff = values[i] - values[i-1];
      changes.push(valueDiff / timeDiff);
    }

    // Perform regression analysis
    const regression = this.performRegression(dates, values);

    return {
      averageChangePerDay: changes.reduce((a, b) => a + b, 0) / changes.length,
      volatility: this.calculateVolatility(changes),
      regression: regression,
      consistency: this.analyzeConsistency(changes)
    };
  }

  private async predictProgress(measurements: Measurement[], goal: Goal) {
    const model = await this.getProgressionModel();
    const recentData = measurements.slice(-30); // Last 30 measurements

    const input = tf.tensor2d([
      recentData.map(m => m[goal.measurementType])
    ]);

    const prediction = await model.predict(input) as tf.Tensor;
    const predictedValues = prediction.dataSync();

    return {
      predictedValue: predictedValues[0],
      confidence: this.calculatePredictionConfidence(predictedValues),
      estimatedCompletion: this.estimateCompletionDate(goal, predictedValues[0])
    };
  }

  private calculateMilestones(goal: Goal) {
    const totalChange = Math.abs(goal.targetValue - goal.startValue);
    const milestones = [];
    const milestonePercentages = [25, 50, 75, 100];

    for (const percentage of milestonePercentages) {
      const milestone = {
        percentage,
        value: goal.startValue + (totalChange * (percentage / 100) * Math.sign(goal.targetValue - goal.startValue)),
        achieved: false,
        achievedDate: null
      };

      // Check if milestone is achieved
      for (const update of goal.progressUpdates) {
        if (this.isMilestoneAchieved(update.value, milestone.value, goal.startValue > goal.targetValue)) {
          milestone.achieved = true;
          milestone.achievedDate = update.date;
          break;
        }
      }

      milestones.push(milestone);
    }

    return milestones;
  }

  private generateInsights(measurements: Measurement[], goal: Goal) {
    const insights = [];
    const recentMeasurements = measurements.slice(-5);
    const trend = this.calculateTrend(recentMeasurements);

    // Generate trend-based insights
    if (trend === 'plateau') {
      insights.push({
        type: 'plateau',
        priority: 'high',
        message: 'Your progress has plateaued. Consider adjusting your routine.',
        suggestions: [
          'Increase workout intensity',
          'Modify your nutrition plan',
          'Ensure adequate rest and recovery'
        ]
      });
    }

    // Check consistency
    const consistency = this.analyzeConsistency(recentMeasurements);
    if (consistency < 0.7) {
      insights.push({
        type: 'consistency',
        priority: 'medium',
        message: 'Your measurements show inconsistent progress',
        suggestions: [
          'Maintain regular measurement times',
          'Track your daily habits',
          'Follow a structured routine'
        ]
      });
    }

    return insights;
  }

  private performRegression(dates: number[], values: number[]) {
    const n = dates.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += dates[i];
      sumY += values[i];
      sumXY += dates[i] * values[i];
      sumX2 += dates[i] * dates[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private calculateVolatility(changes: number[]) {
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const squaredDiffs = changes.map(x => Math.pow(x - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / changes.length);
  }

  private analyzeConsistency(changes: number[]) {
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const threshold = mean * 0.2; // 20% deviation threshold
    const consistentChanges = changes.filter(c => Math.abs(c - mean) <= threshold);
    return consistentChanges.length / changes.length;
  }

  private calculateTrend(measurements: Measurement[]): 'plateau' | 'upward' | 'downward' {
    // Implement trend calculation logic here
    return 'plateau';
  }

  private estimateCompletionDate(goal: Goal, predictedValue: number): Date {
    // Implement completion date estimation logic here
    return new Date();
  }

  private isMilestoneAchieved(updateValue: number, milestoneValue: number, ascending: boolean): boolean {
    // Implement milestone achievement logic here
    return false;
  }

  private getProgressionModel(): Promise<tf.LayersModel> {
    // Implement model loading logic here
    return Promise.resolve(tf.layers.model());
  }
}

export const analyticsService = new AnalyticsService(); 