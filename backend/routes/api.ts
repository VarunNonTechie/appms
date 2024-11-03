import express from 'express';
import { auth } from '../middleware/auth';
import { notificationService } from '../services/NotificationService';
import { exportService } from '../services/ExportService';
import { recommendationService } from '../services/RecommendationService';

const router = express.Router();

// Notification routes
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Export routes
router.post('/measurements/export', auth, async (req, res) => {
  try {
    const { format, ...options } = req.body;
    const data = await exportService.exportData(req.user.id, format, options);
    
    const contentTypes = {
      csv: 'text/csv',
      pdf: 'application/pdf',
      json: 'application/json'
    };

    res.setHeader('Content-Type', contentTypes[format]);
    res.setHeader('Content-Disposition', `attachment; filename=measurements.${format}`);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Recommendation routes
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recommendations = await recommendationService.generateRecommendations(req.user.id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router; 