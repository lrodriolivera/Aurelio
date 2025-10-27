// =========================================
// Thermal Printer Service
// ESC/POS Commands for Label Printing
// =========================================

import logger from '../utils/logger';

interface ShipmentLabelData {
  tracking_number: string;
  origin: string;
  destination: string;
  weight: number;
  customer_name: string;
  customer_rut?: string;
  packages_count?: number;
  declared_value?: number;
}

interface PackageLabelData {
  package_number: string;
  tracking_number: string;
  order_number: string;
  customer_name: string;
  destination: string;
  weight: number;
  description?: string;
}

class PrinterService {
  private device: any = null;
  private printer: any = null;
  private isConnected: boolean = false;

  /**
   * Initialize printer connection
   * For production, this would connect to actual USB device
   */
  async initialize(): Promise<void> {
    try {
      // Simulation mode for development
      // In production: uncomment and configure USB device
      /*
      const escpos = require('escpos');
      const USB = require('escpos-usb');
      this.device = new USB();
      this.printer = new escpos.Printer(this.device);
      */

      this.isConnected = true;
      logger.info('Printer service initialized (simulation mode)');
    } catch (error) {
      logger.error('Error initializing printer:', error);
      throw error;
    }
  }

  /**
   * Generate ESC/POS commands for shipment label
   */
  private generateShipmentLabelCommands(data: ShipmentLabelData): Buffer {
    const commands: number[] = [];

    // ESC @ - Initialize printer
    commands.push(0x1b, 0x40);

    // Center alignment
    commands.push(0x1b, 0x61, 0x01);

    // Large text
    commands.push(0x1d, 0x21, 0x11);
    const title = 'ETIQUETA DE ENVÍO\n\n';
    commands.push(...Buffer.from(title, 'utf-8'));

    // Normal text
    commands.push(0x1d, 0x21, 0x00);

    // Left alignment
    commands.push(0x1b, 0x61, 0x00);

    // Tracking number (bold)
    commands.push(0x1b, 0x45, 0x01); // Bold on
    const trackingLabel = `Tracking: ${data.tracking_number}\n`;
    commands.push(...Buffer.from(trackingLabel, 'utf-8'));
    commands.push(0x1b, 0x45, 0x00); // Bold off

    commands.push(...Buffer.from('------------------------\n', 'utf-8'));

    // Customer info
    const customerInfo = `Cliente: ${data.customer_name}\n`;
    commands.push(...Buffer.from(customerInfo, 'utf-8'));

    if (data.customer_rut) {
      const rutInfo = `RUT: ${data.customer_rut}\n`;
      commands.push(...Buffer.from(rutInfo, 'utf-8'));
    }

    commands.push(...Buffer.from('------------------------\n', 'utf-8'));

    // Route info
    const originInfo = `Origen: ${data.origin}\n`;
    const destInfo = `Destino: ${data.destination}\n`;
    commands.push(...Buffer.from(originInfo, 'utf-8'));
    commands.push(...Buffer.from(destInfo, 'utf-8'));

    commands.push(...Buffer.from('------------------------\n', 'utf-8'));

    // Weight and packages
    const weightInfo = `Peso: ${data.weight} kg\n`;
    commands.push(...Buffer.from(weightInfo, 'utf-8'));

    if (data.packages_count) {
      const packagesInfo = `Bultos: ${data.packages_count}\n`;
      commands.push(...Buffer.from(packagesInfo, 'utf-8'));
    }

    if (data.declared_value) {
      const valueInfo = `Valor: $${data.declared_value.toLocaleString('es-CL')}\n`;
      commands.push(...Buffer.from(valueInfo, 'utf-8'));
    }

    commands.push(...Buffer.from('\n', 'utf-8'));

    // Center alignment for barcode
    commands.push(0x1b, 0x61, 0x01);

    // Barcode - CODE128
    commands.push(0x1d, 0x6b, 0x49); // CODE128
    commands.push(data.tracking_number.length);
    commands.push(...Buffer.from(data.tracking_number, 'utf-8'));

    commands.push(...Buffer.from('\n\n', 'utf-8'));

    // Cut paper
    commands.push(0x1d, 0x56, 0x00);

    return Buffer.from(commands);
  }

  /**
   * Generate ESC/POS commands for package label
   */
  private generatePackageLabelCommands(data: PackageLabelData): Buffer {
    const commands: number[] = [];

    // Initialize
    commands.push(0x1b, 0x40);

    // Center alignment
    commands.push(0x1b, 0x61, 0x01);

    // Title
    commands.push(0x1d, 0x21, 0x11);
    const title = 'BULTO\n\n';
    commands.push(...Buffer.from(title, 'utf-8'));

    commands.push(0x1d, 0x21, 0x00);

    // Left alignment
    commands.push(0x1b, 0x61, 0x00);

    // Package number
    commands.push(0x1b, 0x45, 0x01);
    const packageNum = `Bulto: ${data.package_number}\n`;
    commands.push(...Buffer.from(packageNum, 'utf-8'));
    commands.push(0x1b, 0x45, 0x00);

    const tracking = `Tracking: ${data.tracking_number}\n`;
    const order = `Orden: ${data.order_number}\n`;
    commands.push(...Buffer.from(tracking, 'utf-8'));
    commands.push(...Buffer.from(order, 'utf-8'));

    commands.push(...Buffer.from('------------------------\n', 'utf-8'));

    const customer = `Cliente: ${data.customer_name}\n`;
    const dest = `Destino: ${data.destination}\n`;
    const weight = `Peso: ${data.weight} kg\n`;
    commands.push(...Buffer.from(customer, 'utf-8'));
    commands.push(...Buffer.from(dest, 'utf-8'));
    commands.push(...Buffer.from(weight, 'utf-8'));

    if (data.description) {
      const desc = `Contenido: ${data.description}\n`;
      commands.push(...Buffer.from(desc, 'utf-8'));
    }

    commands.push(...Buffer.from('\n', 'utf-8'));

    // Center barcode
    commands.push(0x1b, 0x61, 0x01);

    // Barcode
    commands.push(0x1d, 0x6b, 0x49);
    commands.push(data.package_number.length);
    commands.push(...Buffer.from(data.package_number, 'utf-8'));

    commands.push(...Buffer.from('\n\n', 'utf-8'));

    // Cut
    commands.push(0x1d, 0x56, 0x00);

    return Buffer.from(commands);
  }

  /**
   * Print shipment label
   */
  async printShipmentLabel(data: ShipmentLabelData): Promise<boolean> {
    try {
      logger.info('Printing shipment label:', { tracking: data.tracking_number });

      if (!this.isConnected) {
        // Simulation mode - just log
        logger.info('SIMULATED PRINT - Shipment Label:', data);
        return true;
      }

      // Production code (when escpos is configured):
      /*
      const commands = this.generateShipmentLabelCommands(data);

      return new Promise((resolve, reject) => {
        this.device.open((error: any) => {
          if (error) {
            logger.error('Error opening printer device:', error);
            reject(error);
            return;
          }

          this.printer.raw(commands);
          this.printer.close(() => {
            logger.info('Shipment label printed successfully');
            resolve(true);
          });
        });
      });
      */

      return true;
    } catch (error) {
      logger.error('Error printing shipment label:', error);
      throw error;
    }
  }

  /**
   * Print package label
   */
  async printPackageLabel(data: PackageLabelData): Promise<boolean> {
    try {
      logger.info('Printing package label:', { package: data.package_number });

      if (!this.isConnected) {
        // Simulation mode
        logger.info('SIMULATED PRINT - Package Label:', data);
        return true;
      }

      // Production code would go here
      return true;
    } catch (error) {
      logger.error('Error printing package label:', error);
      throw error;
    }
  }

  /**
   * Test print
   */
  async testPrint(): Promise<boolean> {
    try {
      logger.info('Executing test print');

      const testData: ShipmentLabelData = {
        tracking_number: 'TEST123456789',
        origin: 'Santiago',
        destination: 'Coyhaique',
        weight: 15.5,
        customer_name: 'Cliente de Prueba',
        customer_rut: '12.345.678-9',
        packages_count: 3,
        declared_value: 150000,
      };

      return await this.printShipmentLabel(testData);
    } catch (error) {
      logger.error('Error in test print:', error);
      throw error;
    }
  }

  /**
   * Get printer status
   */
  getStatus(): { connected: boolean; mode: string } {
    return {
      connected: this.isConnected,
      mode: this.isConnected ? 'production' : 'simulation',
    };
  }
}

export default new PrinterService();
