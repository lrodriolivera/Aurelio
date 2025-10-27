// =========================================
// Tracking Routes
// API Endpoints for Package/Order Tracking
// =========================================

import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/track/:trackingNumber', trackingController.track);
router.get('/order/:orderNumber', trackingController.trackByOrder);
router.get('/package/:packageNumber', trackingController.trackByPackage);

// Protected routes (authentication required)
router.get('/events', authenticate, trackingController.getRecentEvents);
router.get('/stats', authenticate, trackingController.getStats);

export default router;
