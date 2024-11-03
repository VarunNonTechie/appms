import * as tf from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';

let model: tf.GraphModel | null = null;

export const processImageMeasurements = async (imageData: string): Promise<any> => {
  try {
    // Load model if not already loaded
    if (!model) {
      model = await loadGraphModel('/models/measurement-model/model.json');
    }

    // Process image
    const image = await preprocessImage(imageData);
    
    // Get predictions
    const predictions = await model.predict(image) as tf.Tensor;
    const measurements = await processPredictions(predictions);

    return measurements;
  } catch (error) {
    console.error('Error processing measurements:', error);
    throw new Error('Failed to process measurements');
  }
};

const preprocessImage = async (imageData: string): Promise<tf.Tensor> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Convert image to tensor
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([512, 512]) // Resize to model input size
          .expandDims(0)
          .toFloat()
          .div(255.0); // Normalize pixel values

        resolve(tensor);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imageData;
  });
};

const processPredictions = async (predictions: tf.Tensor): Promise<any> => {
  const measurementPoints = await predictions.array();
  
  // Calculate measurements from detected points
  return {
    chest: calculateMeasurement(measurementPoints[0].chest),
    waist: calculateMeasurement(measurementPoints[0].waist),
    hips: calculateMeasurement(measurementPoints[0].hips),
    inseam: calculateMeasurement(measurementPoints[0].inseam),
    // Add more measurements as needed
  };
};

const calculateMeasurement = (points: number[][]): number => {
  // Implement measurement calculation logic based on detected points
  // This is a simplified example
  return Math.round(euclideanDistance(points[0], points[1]) * PIXEL_TO_CM_RATIO);
};

const euclideanDistance = (point1: number[], point2: number[]): number => {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)
  );
};

// Calibration constant (should be adjusted based on reference object)
const PIXEL_TO_CM_RATIO = 0.264583;