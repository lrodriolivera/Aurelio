// =========================================
// Hardware Routes
// Printer, Scale, Email APIs
// =========================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { printerController, scaleController, emailController } from '../controllers/hardware.controller';

const router = Router();

// Protect all routes
router.use(authenticate);

// ===== PRINTER ROUTES =====
router.post('/printer/shipment-label', printerController.printShipmentLabel);
router.post('/printer/package-label', printerController.printPackageLabel);
router.post('/printer/test', printerController.testPrint);
router.get('/printer/status', printerController.getStatus);

// ===== SCALE ROUTES =====
router.get('/scale/weight', scaleController.getWeight);
router.post('/scale/tare', scaleController.tare);
router.post('/scale/connect', scaleController.connect);
router.post('/scale/disconnect', scaleController.disconnect);
router.get('/scale/status', scaleController.getStatus);

// ===== EMAIL ROUTES =====
router.post('/email/shipment-notification', emailController.sendShipmentNotification);
router.post('/email/delivery-notification', emailController.sendDeliveryNotification);
router.post('/email/status-update', emailController.sendStatusUpdate);
router.get('/email/status', emailController.getStatus);

export default router;
