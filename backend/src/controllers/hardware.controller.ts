// =========================================
// Hardware Controller
// Printer, Scale, Email Services
// =========================================

import { Request, Response, NextFunction } from 'express';
import printerService from '../services/printer.service';
import scaleService from '../services/scale.service';
import emailService from '../services/email.service';
import logger from '../utils/logger';

export const printerController = {
  /**
   * Print shipment label
   */
  printShipmentLabel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      await printerService.printShipmentLabel(data);
      res.status(200).json({
        success: true,
        message: 'Etiqueta de envío impresa exitosamente',
      });
    } catch (error) {
      logger.error('Error printing shipment label:', error);
      next(error);
    }
  },

  /**
   * Print package label
   */
  printPackageLabel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      await printerService.printPackageLabel(data);
      res.status(200).json({
        success: true,
        message: 'Etiqueta de bulto impresa exitosamente',
      });
    } catch (error) {
      logger.error('Error printing package label:', error);
      next(error);
    }
  },

  /**
   * Test print
   */
  testPrint: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await printerService.testPrint();
      res.status(200).json({
        success: true,
        message: 'Impresión de prueba exitosa',
      });
    } catch (error) {
      logger.error('Error in test print:', error);
      next(error);
    }
  },

  /**
   * Get printer status
   */
  getStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = printerService.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Error getting printer status:', error);
      next(error);
    }
  },
};

export const scaleController = {
  /**
   * Get current weight
   */
  getWeight: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weight = scaleService.getCurrentWeight();
      res.status(200).json({
        success: true,
        data: { weight },
      });
    } catch (error) {
      logger.error('Error getting weight:', error);
      next(error);
    }
  },

  /**
   * Tare scale
   */
  tare: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await scaleService.tare();
      res.status(200).json({
        success: true,
        message: 'Balanza tarada exitosamente',
      });
    } catch (error) {
      logger.error('Error taring scale:', error);
      next(error);
    }
  },

  /**
   * Connect scale
   */
  connect: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { port } = req.body;
      await scaleService.connect(port);
      res.status(200).json({
        success: true,
        message: 'Balanza conectada exitosamente',
      });
    } catch (error) {
      logger.error('Error connecting scale:', error);
      next(error);
    }
  },

  /**
   * Disconnect scale
   */
  disconnect: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await scaleService.disconnect();
      res.status(200).json({
        success: true,
        message: 'Balanza desconectada exitosamente',
      });
    } catch (error) {
      logger.error('Error disconnecting scale:', error);
      next(error);
    }
  },

  /**
   * Get scale status
   */
  getStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = scaleService.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Error getting scale status:', error);
      next(error);
    }
  },
};

export const emailController = {
  /**
   * Send shipment notification
   */
  sendShipmentNotification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      await emailService.sendShipmentNotification(data);
      res.status(200).json({
        success: true,
        message: 'Notificación de envío enviada',
      });
    } catch (error) {
      logger.error('Error sending shipment notification:', error);
      next(error);
    }
  },

  /**
   * Send delivery notification
   */
  sendDeliveryNotification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      await emailService.sendDeliveryNotification(data);
      res.status(200).json({
        success: true,
        message: 'Notificación de entrega enviada',
      });
    } catch (error) {
      logger.error('Error sending delivery notification:', error);
      next(error);
    }
  },

  /**
   * Send status update notification
   */
  sendStatusUpdate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, tracking, status, location } = req.body;
      await emailService.sendStatusUpdateNotification(email, tracking, status, location);
      res.status(200).json({
        success: true,
        message: 'Notificación de actualización enviada',
      });
    } catch (error) {
      logger.error('Error sending status update:', error);
      next(error);
    }
  },

  /**
   * Get email service status
   */
  getStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = emailService.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Error getting email status:', error);
      next(error);
    }
  },
};
