// =========================================
// Freight Rate Routes
// API Endpoints for Freight Rate Management
// =========================================

import { Router } from 'express';
import * as freightRateController from '../controllers/freightRate.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/freight-rates/stats - Get freight rate statistics (admin only)
router.get('/stats', authorize('admin'), freightRateController.getRateStats);

// GET /api/freight-rates/route - Get active rates for a specific route
router.get('/route', freightRateController.getActiveRatesForRoute);

// GET /api/freight-rates - Get all freight rates
router.get('/', freightRateController.getAllRates);

// GET /api/freight-rates/:id - Get freight rate by ID
router.get('/:id', freightRateController.getRateById);

// POST /api/freight-rates - Create new freight rate (admin only)
router.post('/', authorize('admin'), freightRateController.createRate);

// PUT /api/freight-rates/:id - Update freight rate (admin only)
router.put('/:id', authorize('admin'), freightRateController.updateRate);

// DELETE /api/freight-rates/:id - Delete freight rate (admin only)
router.delete('/:id', authorize('admin'), freightRateController.deleteRate);

export default router;
