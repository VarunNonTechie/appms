import * as tf from '@tensorflow/tfjs-node';
import { Goal } from '../models/Goal';
import { Measurement } from '../models/Measurement';

class MLRecommendationService {
  private model: tf.LayersModel | null = null;

  async initialize() {
    try {
      // Load pre-trained model or create a new one
      this.model = await this.loadModel();
      if (!this.model) {
        this.model = await this.createModel();
        await this.trainModel();
      }
    } catch (error) {
      console.error('Error initializing ML model:', error);
    }
  }

  private async createModel() {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [10] // Input features
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    return model;
  }

  private async trainModel() {
    // Implement model training logic using historical data
    // This is a simplified version
    const trainingData = await this.prepareTrainingData();
    
    if (this.model && trainingData.length > 0) {
      const { inputs, outputs } = this.preprocessData(trainingData);
      
      await this.model.fit(inputs, outputs, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
          }
        }
      });

      await this.model.save('file://./models/goal-predictor');
    }
  }

  private async loadModel() {
    try {
      return await tf.loadLayersModel('file://./models/goal-predictor/model.json');
    } catch {
      return null;
    }
  }

  private async prepareTrainingData() {
    // Fetch historical goal and measurement data
    const goals = await Goal.findAll({
      where: { status: ['completed', 'failed'] },
      include: [{ model: Measurement }]
    });

    return goals.map(goal => ({
      startValue: goal.startValue,
      targetValue: goal.targetValue,
      timeframe: (goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      measurements: goal.progressUpdates.map(u => u.value),
      success: goal.status === 'completed' ? 1 : 0
    }));
  }

  private preprocessData(data: any[]) {
    // Convert data to tensors
    const inputs = data.map(d => [
      d.startValue,
      d.targetValue,
      d.timeframe,
      ...d.measurements.slice(-7) // Last 7 measurements
    ]);

    const outputs = data.map(d => [d.success]);

    return {
      inputs: tf.tensor2d(inputs),
      outputs: tf.tensor2d(outputs)
    };
  }

  async getRecommendations(goal: Goal) {
    try {
      if (!this.model) await this.initialize();

      const prediction = await this.predictSuccess(goal);
      const recommendations = this.generateRecommendations(goal, prediction);

      return recommendations;
    } catch (error) {
      console.error('Error generating ML recommendations:', error);
      return this.getFallbackRecommendations(goal);
    }
  }

  private async predictSuccess(goal: Goal) {
    if (!this.model) return 0.5;

    const input = tf.tensor2d([[
      goal.startValue,
      goal.targetValue,
      (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      ...goal.progressUpdates.slice(-7).map(u => u.value)
    ]]);

    const prediction = await this.model.predict(input) as tf.Tensor;
    return prediction.dataSync()[0];
  }

  private generateRecommendations(goal: Goal, successProbability: number) {
    const recommendations = [];

    if (successProbability < 0.3) {
      recommendations.push({
        type: 'adjustment_needed',
        priority: 'high',
        message: 'Your current progress suggests you might need to adjust your approach',
        suggestions: this.generateAdjustmentSuggestions(goal)
      });
    } else if (successProbability < 0.7) {
      recommendations.push({
        type: 'optimization_possible',
        priority: 'medium',
        message: 'You\'re making progress, but there\'s room for optimization',
        suggestions: this.generateOptimizationSuggestions(goal)
      });
    } else {
      recommendations.push({
        type: 'on_track',
        priority: 'low',
        message: 'You\'re on track to reach your goal',
        suggestions: this.generateMaintenanceSuggestions(goal)
      });
    }

    return recommendations;
  }

  private getFallbackRecommendations(goal: Goal) {
    // Provide basic recommendations when ML model is unavailable
    return [{
      type: 'general',
      priority: 'medium',
      message: 'Keep tracking your progress regularly',
      suggestions: [
        'Maintain consistent measurement times',
        'Update your progress at least weekly',
        'Review your goal timeline periodically'
      ]
    }];
  }
}

export const mlRecommendationService = new MLRecommendationService();