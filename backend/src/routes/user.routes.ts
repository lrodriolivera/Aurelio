// =========================================
// User Routes
// API Endpoints for User Management
// =========================================

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users/stats - Get user statistics
router.get('/stats', authorize('admin'), userController.getUserStats);

// GET /api/users - Get all users (admin only)
router.get('/', authorize('admin'), userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user (admin only)
router.post('/', authorize('admin'), userController.createUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authorize('admin'), userController.updateUser);

// POST /api/users/:id/change-password - Change password
router.post('/:id/change-password', userController.changePassword);

// POST /api/users/:id/reset-password - Reset password (admin only)
router.post('/:id/reset-password', authorize('admin'), userController.resetPassword);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authorize('admin'), userController.deleteUser);

export default router;
