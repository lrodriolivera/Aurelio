// =========================================
// Shipment Routes
// =========================================

import { Router } from 'express';
import shipmentController from '../controllers/shipment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/shipments/health - Health check endpoint for debugging
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2025-01-27-v9-full-schema-working'
  });
});

// GET /api/shipments/stats - Get shipment statistics
router.get('/stats', shipmentController.getStats);

// GET /api/shipments - Get all shipments (paginated)
router.get('/', shipmentController.getAll);

// GET /api/shipments/:id - Get shipment by ID with orders
router.get('/:id', shipmentController.getById);

// POST /api/shipments - Create new shipment
router.post('/', authorize('admin', 'operator', 'warehouse'), shipmentController.create);

// POST /api/shipments/:id/orders - Add order to shipment
router.post('/:id/orders', authorize('admin', 'operator', 'warehouse'), shipmentController.addOrder);

// DELETE /api/shipments/:id/orders/:orderId - Remove order from shipment
router.delete('/:id/orders/:orderId', authorize('admin', 'operator', 'warehouse'), shipmentController.removeOrder);

// POST /api/shipments/:id/scan - Scan package for shipment
router.post('/:id/scan', authorize('admin', 'operator', 'warehouse'), shipmentController.scanPackage);

// PUT /api/shipments/:id/dispatch - Dispatch shipment
router.put('/:id/dispatch', authorize('admin', 'operator'), shipmentController.dispatch);

export default router;
