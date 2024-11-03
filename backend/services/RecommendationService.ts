import { Measurement } from '../models/Measurement';
import { User } from '../models/User';
import { notificationService } from './NotificationService';

class RecommendationService {
  async generateRecommendations(userId: number) {
    const measurements = await Measurement.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    if (measurements.length < 2) {
      return [];
    }

    const recommendations = [];
    const latest = measurements[0];
    const previous = measurements[1];

    // Analyze measurement changes
    const changes = this.analyzeMeasurementChanges(latest, previous);
    
    // Generate recommendations based on changes
    for (const change of changes) {
      const recommendation = this.createRecommendation(change);
      if (recommendation) {
        recommendations.push(recommendation);
        
        // Send notification for high priority recommendations
        if (recommendation.priority === 'high') {
          await notificationService.createNotification(
            userId,
            'recommendation',
            recommendation.message
          );
        }
      }
    }

    return recommendations;
  }

  private analyzeMeasurementChanges(latest: Measurement, previous: Measurement) {
    const changes = [];
    const threshold = 0.05; // 5% change threshold

    const measurementTypes = [
      { key: 'waistCircumference', name: 'Waist' },
      { key: 'chestCircumference', name: 'Chest' },
      { key: 'hipCircumference', name: 'Hip' }
    ];

    for (const type of measurementTypes) {
      const change = (latest[type.key] - previous[type.key]) / previous[type.key];
      
      if (Math.abs(change) > threshold) {
        changes.push({
          type: type.name,
          change,
          value: latest[type.key]
        });
      }
    }

    return changes;
  }

  private createRecommendation(change: any) {
    const increase = change.change > 0;
    const absChange = Math.abs(change.change) * 100;

    let priority: 'high' | 'medium' | 'low' = 'low';
    if (absChange > 10) priority = 'high';
    else if (absChange > 7) priority = 'medium';

    const recommendations = {
      Waist: {
        increase: {
          message: `Your waist measurement has increased by ${absChange.toFixed(1)}%`,
          actions: [
            'Consider reviewing your diet plan',
            'Increase cardiovascular exercises',
            'Monitor daily calorie intake'
          ]
        },
        decrease: {
          message: `Your waist measurement has decreased by ${absChange.toFixed(1)}%`,
          actions: [
            'Great progress! Keep maintaining your routine',
            'Consider strength training to maintain muscle mass',
            'Ensure adequate protein intake'
          ]
        }
      },
      // Add similar recommendations for other measurement types
    };

    const rec = recommendations[change.type]?.[increase ? 'increase' : 'decrease'];
    if (!rec) return null;

    return {
      type: change.type,
      message: rec.message,
      priority,
      actionItems: rec.actions
    };
  }
}

export const recommendationService = new RecommendationService(); 