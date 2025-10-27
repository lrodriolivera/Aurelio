// =======================================
// Email Notification Service
// Using Nodemailer
// =======================================

import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

interface ShipmentNotificationData {
  customer_email: string;
  customer_name: string;
  tracking_number: string;
  origin: string;
  destination: string;
  estimated_delivery?: string;
}

interface DeliveryNotificationData {
  customer_email: string;
  customer_name: string;
  tracking_number: string;
  delivery_date: string;
  delivery_type: string;
  received_by?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize email transport
   */
  private async initialize(): Promise<void> {
    try {
      if (config.email.host && config.email.user) {
        this.transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port || 587,
          secure: config.email.port === 465,
          auth: {
            user: config.email.user,
            pass: config.email.password,
          },
        });

        // Verify connection
        await this.transporter.verify();
        this.isConfigured = true;
        logger.info('Email service initialized successfully');
      } else {
        logger.warn('Email service not configured - running in simulation mode');
        this.isConfigured = false;
      }
    } catch (error) {
      logger.error('Error initializing email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        logger.info('SIMULATED EMAIL SEND:', {
          to: options.to,
          subject: options.subject,
        });
        return true;
      }

      const mailOptions = {
        from: config.email.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter!.sendMail(mailOptions);
      logger.info('Email sent successfully:', { messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send shipment created notification
   */
  async sendShipmentNotification(data: ShipmentNotificationData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info-row { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #2563eb; }
          .label { font-weight: bold; color: #1e40af; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          .tracking { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; padding: 20px; background: white; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Envío Creado</h1>
          </div>
          <div class="content">
            <p>Estimado/a ${data.customer_name},</p>
            <p>Su envío ha sido creado exitosamente. A continuación los detalles:</p>

            <div class="tracking">
              ${data.tracking_number}
            </div>

            <div class="info-row">
              <span class="label">Origen:</span> ${data.origin}
            </div>
            <div class="info-row">
              <span class="label">Destino:</span> ${data.destination}
            </div>
            ${
              data.estimated_delivery
                ? `<div class="info-row">
                     <span class="label">Entrega Estimada:</span> ${data.estimated_delivery}
                   </div>`
                : ''
            }

            <p style="margin-top: 20px;">
              Puede hacer seguimiento de su envío usando el número de tracking proporcionado.
            </p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responder.</p>
            <p>© ${new Date().getFullYear()} Sistema de Gestión de Transporte</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: data.customer_email,
      subject: `Envío Creado - ${data.tracking_number}`,
      html,
      text: `Su envío ${data.tracking_number} ha sido creado. Origen: ${data.origin}, Destino: ${data.destination}`,
    });
  }

  /**
   * Send delivery confirmation notification
   */
  async sendDeliveryNotification(data: DeliveryNotificationData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .info-row { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #10b981; }
          .label { font-weight: bold; color: #047857; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Envío Entregado</h1>
          </div>
          <div class="content">
            <div class="success-icon">📦✓</div>

            <p>Estimado/a ${data.customer_name},</p>
            <p>Su envío ha sido entregado exitosamente.</p>

            <div class="info-row">
              <span class="label">Tracking:</span> ${data.tracking_number}
            </div>
            <div class="info-row">
              <span class="label">Fecha de Entrega:</span> ${data.delivery_date}
            </div>
            <div class="info-row">
              <span class="label">Tipo de Entrega:</span> ${data.delivery_type === 'PICKUP' ? 'Retiro en Sucursal' : 'Domicilio'}
            </div>
            ${
              data.received_by
                ? `<div class="info-row">
                     <span class="label">Recibido por:</span> ${data.received_by}
                   </div>`
                : ''
            }

            <p style="margin-top: 20px;">
              Gracias por confiar en nuestros servicios.
            </p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responder.</p>
            <p>© ${new Date().getFullYear()} Sistema de Gestión de Transporte</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: data.customer_email,
      subject: `Envío Entregado - ${data.tracking_number}`,
      html,
      text: `Su envío ${data.tracking_number} ha sido entregado el ${data.delivery_date}`,
    });
  }

  /**
   * Send status update notification
   */
  async sendStatusUpdateNotification(
    email: string,
    tracking: string,
    status: string,
    location: string
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      EN_BODEGA_ORIGEN: 'En bodega de origen',
      EN_TRANSITO_PUERTO: 'En tránsito a puerto',
      EN_BODEGA_PUERTO: 'En bodega de puerto',
      EN_TRANSITO_DESTINO: 'En tránsito a destino',
      EN_BODEGA_DESTINO: 'En bodega de destino',
      LISTO_RETIRO: 'Listo para retiro',
      ENTREGADO: 'Entregado',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .status-badge { display: inline-block; padding: 10px 20px; background: #6366f1; color: white; border-radius: 20px; margin: 20px 0; }
          .info-row { margin: 10px 0; padding: 10px; background: white; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📍 Actualización de Estado</h1>
          </div>
          <div class="content">
            <p>Su envío <strong>${tracking}</strong> ha cambiado de estado:</p>

            <div style="text-align: center;">
              <div class="status-badge">${statusMessages[status] || status}</div>
            </div>

            <div class="info-row">
              <strong>Ubicación Actual:</strong> ${location}
            </div>

            <p style="margin-top: 20px;">
              Continúe haciendo seguimiento de su envío con el número de tracking proporcionado.
            </p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: `Actualización de Envío - ${tracking}`,
      html,
      text: `Su envío ${tracking} ahora está en: ${statusMessages[status]} - ${location}`,
    });
  }

  /**
   * Get service status
   */
  getStatus(): { configured: boolean; from: string } {
    return {
      configured: this.isConfigured,
      from: config.email.from,
    };
  }
}

export default new EmailService();
