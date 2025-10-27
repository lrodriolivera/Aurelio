// =========================================
// Customer Routes
// =========================================

import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/customers/stats - Get customer statistics
router.get('/stats', customerController.getStats);

// GET /api/customers - Get all customers (paginated)
router.get('/', customerController.getAll);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', customerController.getById);

// POST /api/customers - Create new customer
router.post('/', authorize('admin', 'operator'), customerController.create);

// PUT /api/customers/:id - Update customer
router.put('/:id', authorize('admin', 'operator'), customerController.update);

// DELETE /api/customers/:id - Soft delete customer
router.delete('/:id', authorize('admin'), customerController.delete);

export default router;
