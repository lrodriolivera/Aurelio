// =========================================
// Order Routes
// =========================================

import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/orders/stats - Get order statistics
router.get('/stats', orderController.getStats);

// GET /api/orders - Get all orders (paginated)
router.get('/', orderController.getAll);

// GET /api/orders/:id - Get order by ID with packages
router.get('/:id', orderController.getById);

// POST /api/orders - Create new order
router.post('/', authorize('admin', 'operator'), orderController.create);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', authorize('admin', 'operator', 'warehouse'), orderController.updateStatus);

export default router;
