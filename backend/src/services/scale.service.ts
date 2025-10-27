// =======================================
// Digital Scale Service
// Serial Port Communication
// =======================================

import logger from '../utils/logger';

class ScaleService {
  private port: any = null;
  private currentWeight: number = 0;
  private isConnected: boolean = false;
  private simulationMode: boolean = true;

  async connect(portPath: string = '/dev/ttyUSB0'): Promise<void> {
    try {
      if (this.simulationMode) {
        logger.info('Scale service initialized (simulation mode)');
        this.isConnected = true;
        // Simulate weight changes
        this.startSimulation();
        return;
      }

      // Production code with serialport:
      /*
      const { SerialPort } = require('serialport');
      const { ReadlineParser } = require('@serialport/parser-readline');

      this.port = new SerialPort({
        path: portPath,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      parser.on('data', (data: string) => {
        const weight = this.parseWeight(data);
        if (weight !== null) {
          this.currentWeight = weight;
          logger.debug('Weight updated:', weight);
        }
      });

      this.isConnected = true;
      logger.info('Scale connected successfully');
      */
    } catch (error) {
      logger.error('Error connecting to scale:', error);
      throw error;
    }
  }

  private parseWeight(data: string): number | null {
    // Parse weight from scale response
    // Example format: "ST,GS,+00015.5kg\r\n"
    const match = data.match(/([+-]?\d+\.?\d*)kg/);
    if (match) {
      return parseFloat(match[1]);
    }
    return null;
  }

  private startSimulation(): void {
    // Simulate random weight changes
    setInterval(() => {
      this.currentWeight = Math.random() * 50;
    }, 2000);
  }

  getCurrentWeight(): number {
    return Number(this.currentWeight.toFixed(2));
  }

  async tare(): Promise<void> {
    logger.info('Tare scale');
    this.currentWeight = 0;
  }

  async disconnect(): Promise<void> {
    if (this.port && this.port.isOpen) {
      await this.port.close();
    }
    this.isConnected = false;
    logger.info('Scale disconnected');
  }

  getStatus(): { connected: boolean; mode: string } {
    return {
      connected: this.isConnected,
      mode: this.simulationMode ? 'simulation' : 'production'
    };
  }
}

export default new ScaleService();
