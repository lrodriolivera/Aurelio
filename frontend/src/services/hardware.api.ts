import api from './api';

export const hardwareApi = {
  // Printer
  printShipmentLabel: (data: any) =>
    api.post('/hardware/printer/shipment-label', data),

  printPackageLabel: (data: any) =>
    api.post('/hardware/printer/package-label', data),

  testPrinter: () =>
    api.post('/hardware/printer/test'),

  getPrinterStatus: () =>
    api.get('/hardware/printer/status'),

  // Scale
  getWeight: () =>
    api.get('/hardware/scale/weight'),

  tareScale: () =>
    api.post('/hardware/scale/tare'),

  connectScale: (port?: string) =>
    api.post('/hardware/scale/connect', { port }),

  disconnectScale: () =>
    api.post('/hardware/scale/disconnect'),

  getScaleStatus: () =>
    api.get('/hardware/scale/status'),

  // Email
  sendShipmentNotification: (data: any) =>
    api.post('/hardware/email/shipment-notification', data),

  sendDeliveryNotification: (data: any) =>
    api.post('/hardware/email/delivery-notification', data),

  sendStatusUpdate: (data: any) =>
    api.post('/hardware/email/status-update', data),

  getEmailStatus: () =>
    api.get('/hardware/email/status'),
};
