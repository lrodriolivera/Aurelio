// =========================================
// Delivery Routes
// API Endpoints for Package Delivery/Pickup
// =========================================

import { Router } from 'express';
import * as deliveryController from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/deliveries/stats - Get delivery statistics
router.get('/stats', deliveryController.getStats);

// GET /api/deliveries/ready - Get packages ready for delivery
router.get('/ready', deliveryController.getReadyPackages);

// GET /api/deliveries - Get delivery history
router.get('/', deliveryController.getDeliveries);

// GET /api/deliveries/:id - Get delivery by ID
router.get('/:id', deliveryController.getById);

// POST /api/deliveries - Register a delivery
router.post(
  '/',
  authorize('admin', 'operator'),
  deliveryController.createDelivery
);

export default router;
