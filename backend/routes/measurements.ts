import express from 'express';
import { auth } from '../middleware/auth';
import { createMeasurement, getUserMeasurements } from '../controllers/measurementController';

const router = express.Router();

router.post('/', auth, createMeasurement);
router.get('/:userId', auth, getUserMeasurements);

export default router; 