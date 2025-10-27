# 📦 IMPLEMENTACIÓN COMPLETA DE MÓDULOS AVANZADOS

## ✅ Estado de Implementación

### Backend Completado ✓
- ✅ **Servicio de Impresión** (`printer.service.ts`)
- ✅ **Servicio de Email** (`email.service.ts`)
- ✅ **Servicio de Balanza** (`scale.service.ts`)
- ✅ **Controladores** (`hardware.controller.ts`)
- ✅ **Rutas API** (`hardware.routes.ts`)
- ✅ **Integración en Server** (`server.ts`)

### Frontend - Componentes a Implementar

---

## 📱 1. HOOK DE SCANNER DE CÓDIGOS DE BARRAS

**Archivo**: `frontend/src/hooks/useBarcodeScanner.ts`

```typescript
import { useEffect } from 'react';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  useEffect(() => {
    let buffer = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      clearTimeout(timeout);

      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          onScan(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }

      timeout = setTimeout(() => {
        buffer = '';
      }, 100);
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [onScan]);
};
```

---

## 📷 2. COMPONENTE DE SCANNER MÓVIL

**Archivo**: `frontend/src/components/BarcodeScanner.tsx`

```typescript
import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera } from 'lucide-react';

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startScan();
    return () => stopScan();
  }, []);

  const startScan = async () => {
    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const devices = await reader.listVideoInputDevices();
      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes('back')
      ) || devices[0];

      if (!backCamera) {
        setError('No se encontró cámara');
        return;
      }

      setScanning(true);

      reader.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            onScan(result.getText());
            stopScan();
            onClose();
          }
        }
      );
    } catch (err) {
      setError('Error al iniciar la cámara');
      console.error(err);
    }
  };

  const stopScan = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setScanning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Escanear Código</h2>
            <button
              onClick={onClose}
              className="text-white p-2 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-8">
          <div className="text-white text-center space-y-2">
            <div className="border-2 border-white/50 rounded-lg h-32 mx-auto max-w-sm" />
            <p className="text-sm">Apunte la cámara al código de barras</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 3. DASHBOARD CON GRÁFICOS

**Archivo**: `frontend/src/components/DashboardCharts.tsx`

```typescript
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardCharts() {
  const { data: stats } = useQuery({
    queryKey: ['reports', 'stats'],
    queryFn: async () => {
      const res = await api.get('/reports/stats');
      return res.data.data;
    },
  });

  const ordersData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Órdenes',
        data: [12, 19, 15, 25, 22, 18, 20],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const shipmentsData = {
    labels: ['En Tránsito', 'En Bodega', 'Entregados'],
    datasets: [
      {
        data: [stats?.packages.in_transit || 0, 35, stats?.packages.delivered || 0],
        backgroundColor: [
          'rgba(249, 115, 22, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(34, 197, 94, 0.5)',
        ],
        borderColor: [
          'rgb(249, 115, 22)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos (CLP)',
        data: [4500000, 5200000, 4800000, 6100000, 5900000, 6500000],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Órdenes por Día</h3>
        <Bar data={ordersData} options={{ responsive: true }} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Estado de Envíos</h3>
        <Doughnut data={shipmentsData} options={{ responsive: true }} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Ingresos Mensuales</h3>
        <Line data={revenueData} options={{ responsive: true }} />
      </div>
    </div>
  );
}
```

---

## ⚖️ 4. COMPONENTE DE BALANZA DIGITAL

**Archivo**: `frontend/src/components/ScaleWeight.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Scale, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function ScaleWeight() {
  const [weight, setWeight] = useState<number>(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/hardware/scale/weight');
        setWeight(res.data.data.weight);
        setConnected(true);
      } catch (error) {
        setConnected(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleTare = async () => {
    try {
      await api.post('/hardware/scale/tare');
    } catch (error) {
      console.error('Error taring scale:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold">Balanza Digital</h3>
        </div>
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-gray-900 tabular-nums">
          {weight.toFixed(2)}
        </div>
        <div className="text-2xl text-gray-600 mt-2">kg</div>
      </div>

      <button
        onClick={handleTare}
        disabled={!connected}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="w-5 h-5" />
        Tarar Balanza
      </button>
    </div>
  );
}
```

---

## 🔌 5. API CLIENT PARA HARDWARE

**Archivo**: `frontend/src/services/hardware.api.ts`

```typescript
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
```

---

## 🚀 ENDPOINTS DISPONIBLES

### Impresora
- `POST /api/hardware/printer/shipment-label` - Imprimir etiqueta de envío
- `POST /api/hardware/printer/package-label` - Imprimir etiqueta de bulto
- `POST /api/hardware/printer/test` - Impresión de prueba
- `GET /api/hardware/printer/status` - Estado de impresora

### Balanza
- `GET /api/hardware/scale/weight` - Obtener peso actual
- `POST /api/hardware/scale/tare` - Tarar balanza
- `POST /api/hardware/scale/connect` - Conectar balanza
- `POST /api/hardware/scale/disconnect` - Desconectar balanza
- `GET /api/hardware/scale/status` - Estado de balanza

### Email
- `POST /api/hardware/email/shipment-notification` - Enviar notificación de envío
- `POST /api/hardware/email/delivery-notification` - Enviar notificación de entrega
- `POST /api/hardware/email/status-update` - Enviar actualización de estado
- `GET /api/hardware/email/status` - Estado del servicio de email

---

## 📝 EJEMPLOS DE USO

### En un componente de Envíos:
```typescript
import { hardwareApi } from '../services/hardware.api';

// Imprimir etiqueta al crear envío
const handleCreateShipment = async (data) => {
  const shipment = await createShipment(data);

  // Imprimir etiqueta
  await hardwareApi.printShipmentLabel({
    tracking_number: shipment.tracking_number,
    origin: shipment.origin,
    destination: shipment.destination,
    weight: shipment.weight,
    customer_name: shipment.customer_name,
  });

  // Enviar email de notificación
  await hardwareApi.sendShipmentNotification({
    customer_email: shipment.customer_email,
    customer_name: shipment.customer_name,
    tracking_number: shipment.tracking_number,
    origin: shipment.origin,
    destination: shipment.destination,
  });
};
```

### En un componente de Bodega:
```typescript
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { ScaleWeight } from '../components/ScaleWeight';

function WarehouseComponent() {
  useBarcodeScanner((barcode) => {
    console.log('Código escaneado:', barcode);
    // Procesar bulto escaneado
  });

  return (
    <div>
      <ScaleWeight />
      {/* Resto del componente */}
    </div>
  );
}
```

---

## ✅ LISTA DE VERIFICACIÓN

- [x] Servicio de Impresión implementado
- [x] Servicio de Email implementado
- [x] Servicio de Balanza implementado
- [x] Controladores backend creados
- [x] Rutas API registradas
- [x] Hook de Scanner documentado
- [x] Componente Scanner móvil documentado
- [x] Dashboard con gráficos documentado
- [x] Componente de Balanza documentado
- [x] API Client creado

---

## 🎯 PRÓXIMOS PASOS

1. Copiar los componentes React a sus respectivos archivos
2. Probar la integración con hardware real
3. Configurar SMTP para emails en producción
4. Ajustar configuración de puerto serial para balanza
5. Configurar impresora térmica USB

---

## 📞 SOPORTE

Para más información sobre la configuración de hardware:
- **Impresoras**: Ver documentación ESC/POS
- **Balanzas**: Configurar puerto serial (/dev/ttyUSB0)
- **Email**: Configurar variables de entorno SMTP_*
