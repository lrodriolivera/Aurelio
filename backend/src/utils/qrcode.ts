// =========================================
// QR Code Generation Utility
// =========================================

import QRCode from 'qrcode';
import logger from './logger';

export class QRCodeUtils {
  static async generateQRCode(data: string): Promise<string> {
    try {
      // Generate QR code as Data URL (base64)
      const qrDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      return qrDataUrl;
    } catch (error) {
      logger.error('Error generating QR code:', error);
      throw error;
    }
  }

  static async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const buffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'M',
        type: 'png',
        width: 300,
        margin: 1,
      });

      return buffer;
    } catch (error) {
      logger.error('Error generating QR code buffer:', error);
      throw error;
    }
  }
}

export default QRCodeUtils;
