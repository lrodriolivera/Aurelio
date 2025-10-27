// =========================================
// Report Routes
// API Endpoints for Reports and Analytics
// =========================================

import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/reports/stats - Get general statistics
router.get('/stats', reportController.getGeneralStats);

// GET /api/reports/orders - Get orders report
router.get('/orders', reportController.getOrdersReport);

// GET /api/reports/shipments - Get shipments report
router.get('/shipments', reportController.getShipmentsReport);

// GET /api/reports/deliveries - Get deliveries report
router.get('/deliveries', reportController.getDeliveriesReport);

export default router;
