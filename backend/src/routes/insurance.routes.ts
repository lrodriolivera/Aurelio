// =========================================
// Insurance Routes
// API Endpoints for Insurance Configuration Management
// =========================================

import { Router } from 'express';
import * as insuranceController from '../controllers/insurance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/insurance/stats - Get insurance config statistics (admin only)
router.get('/stats', authorize('admin'), insuranceController.getConfigStats);

// GET /api/insurance/active - Get active insurance configuration
router.get('/active', insuranceController.getActiveConfig);

// GET /api/insurance - Get all insurance configurations
router.get('/', insuranceController.getAllConfigs);

// GET /api/insurance/:id - Get insurance config by ID
router.get('/:id', insuranceController.getConfigById);

// POST /api/insurance - Create new insurance config (admin only)
router.post('/', authorize('admin'), insuranceController.createConfig);

// PUT /api/insurance/:id - Update insurance config (admin only)
router.put('/:id', authorize('admin'), insuranceController.updateConfig);

// DELETE /api/insurance/:id - Delete insurance config (admin only)
router.delete('/:id', authorize('admin'), insuranceController.deleteConfig);

export default router;
