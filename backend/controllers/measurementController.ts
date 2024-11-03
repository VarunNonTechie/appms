import { Request, Response } from 'express';
import Measurement from '../models/Measurement';
import { uploadImage } from '../services/imageUploadService';

export const createMeasurement = async (req: Request, res: Response) => {
  try {
    const { userId, measurements, imageData } = req.body;

    // Upload image if provided
    let imageUrl = null;
    if (imageData) {
      imageUrl = await uploadImage(imageData);
    }

    // Create measurement record
    const measurement = await Measurement.create({
      userId,
      ...measurements,
      imageUrl
    });

    res.status(201).json(measurement);
  } catch (error) {
    console.error('Error creating measurement:', error);
    res.status(500).json({ error: 'Failed to create measurement' });
  }
};

export const getUserMeasurements = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const measurements = await Measurement.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(measurements);
  } catch (error) {
    console.error('Error fetching measurements:', error);
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
}; 