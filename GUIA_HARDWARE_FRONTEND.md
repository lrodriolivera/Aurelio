# 🔧 GUÍA RÁPIDA: USO DE HARDWARE EXTERNO EN EL FRONTEND

## 📍 ACCESO A LA PÁGINA DE DEMO

Visita: **http://localhost:5173/warehouse**

Esta página integra TODOS los componentes de hardware en un solo lugar.

---

## 1. 📷 LECTOR DE CÓDIGOS DE BARRAS

### Opción A: Lector USB (Automático)

```tsx
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';

function MyComponent() {
  // Este hook detecta automáticamente cuando un lector USB escanea algo
  useBarcodeScanner((barcode) => {
    console.log('Código escaneado:', barcode);
    // Aquí puedes buscar el paquete, producto, etc.
  });

  return <div>Escanea un código...</div>;
}
```

**Características:**
- ✅ Funciona automáticamente sin botones
- ✅ Compatible con lectores USB que emulan teclado
- ✅ No requiere configuración adicional

### Opción B: Scanner con Cámara (Móvil/Desktop)

```tsx
import { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';

function MyComponent() {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (barcode: string) => {
    console.log('Código:', barcode);
    setShowScanner(false);
  };

  return (
    <>
      <button onClick={() => setShowScanner(true)}>
        📷 Escanear con Cámara
      </button>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
```

**Características:**
- ✅ Usa la cámara del dispositivo
- ✅ Compatible con móviles y computadoras
- ✅ Interfaz de pantalla completa

---

## 2. ⚖️ BALANZA DIGITAL

### Opción A: Componente Visual Completo

```tsx
import ScaleWeight from '../components/ScaleWeight';

function MyPage() {
  return (
    <div>
      <h1>Pesaje de Paquetes</h1>
      <ScaleWeight />
      {/* Muestra el peso en tiempo real con botón de tarar */}
    </div>
  );
}
```

### Opción B: Obtener Peso Programáticamente

```tsx
import { hardwareApi } from '../services/hardware.api';
import { useState, useEffect } from 'react';

function MyPage() {
  const [weight, setWeight] = useState(0);

  // Obtener peso automáticamente cada segundo
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await hardwareApi.getWeight();
        setWeight(res.data.data.weight);
      } catch (error) {
        console.log('Balanza desconectada');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>Peso actual: {weight} kg</p>
    </div>
  );
}
```

### Funciones Disponibles:

```tsx
// Obtener peso una vez
const res = await hardwareApi.getWeight();
console.log('Peso:', res.data.data.weight);

// Tarar balanza (poner en cero)
await hardwareApi.tareScale();

// Conectar a puerto específico
await hardwareApi.connectScale('/dev/ttyUSB0');

// Desconectar
await hardwareApi.disconnectScale();

// Ver estado
const status = await hardwareApi.getScaleStatus();
console.log('Estado:', status.data.data);
```

---

## 3. 🖨️ IMPRESORA TÉRMICA

### Imprimir Etiqueta de Envío

```tsx
import { hardwareApi } from '../services/hardware.api';
import toast from 'react-hot-toast';

async function printShipmentLabel(shipment: any) {
  try {
    await hardwareApi.printShipmentLabel({
      tracking_number: shipment.tracking_number,
      origin: shipment.origin,
      destination: shipment.destination,
      weight: shipment.weight,
      customer_name: shipment.customer_name,
    });

    toast.success('✅ Etiqueta impresa');
  } catch (error) {
    toast.error('❌ Error al imprimir');
  }
}
```

### Imprimir Etiqueta de Bulto/Paquete

```tsx
async function printPackageLabel(pkg: any) {
  await hardwareApi.printPackageLabel({
    package_number: pkg.package_number,
    order_number: pkg.order_number,
    sequence: 1,
    total: 3,
    description: pkg.description,
    weight: pkg.weight,
  });
}
```

### Prueba de Impresión

```tsx
await hardwareApi.testPrinter();
```

### Ver Estado de Impresora

```tsx
const status = await hardwareApi.getPrinterStatus();
console.log('Impresora:', status.data.data);
```

---

## 4. 📧 NOTIFICACIONES POR EMAIL

### Enviar Notificación de Envío Creado

```tsx
await hardwareApi.sendShipmentNotification({
  customer_email: 'cliente@example.com',
  customer_name: 'Juan Pérez',
  tracking_number: 'SH-2025-001',
  origin: 'Santiago',
  destination: 'Valparaíso',
});
```

### Enviar Notificación de Entrega

```tsx
await hardwareApi.sendDeliveryNotification({
  customer_email: 'cliente@example.com',
  customer_name: 'Juan Pérez',
  tracking_number: 'SH-2025-001',
  delivered_at: new Date().toISOString(),
  delivered_to: 'Recepción',
  signature_url: 'https://...',
});
```

### Enviar Actualización de Estado

```tsx
await hardwareApi.sendStatusUpdate({
  email: 'cliente@example.com',
  tracking: 'SH-2025-001',
  status: 'En Tránsito',
  location: 'Bodega Puerto',
});
```

---

## 5. 📊 DASHBOARD CON GRÁFICOS

```tsx
import DashboardCharts from '../components/DashboardCharts';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Muestra 3 gráficos automáticamente:
          - Órdenes por día (barras)
          - Estado de envíos (dona)
          - Ingresos mensuales (línea)
      */}
      <DashboardCharts />
    </div>
  );
}
```

---

## 💡 EJEMPLO COMPLETO: WORKFLOW DE BODEGA

```tsx
import { useState } from 'react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import ScaleWeight from '../components/ScaleWeight';
import { hardwareApi } from '../services/hardware.api';
import toast from 'react-hot-toast';

export default function WarehouseWorkflow() {
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [weight, setWeight] = useState(0);

  // 1. Detectar scanner USB automáticamente
  useBarcodeScanner(async (barcode) => {
    // Buscar paquete
    const pkg = await searchPackage(barcode);
    setCurrentPackage(pkg);

    // Obtener peso
    const res = await hardwareApi.getWeight();
    setWeight(res.data.data.weight);

    toast.success(`Paquete ${barcode} escaneado`);
  });

  // 2. Procesar paquete
  const handleProcess = async () => {
    if (!currentPackage) return;

    // Imprimir etiqueta
    await hardwareApi.printPackageLabel({
      package_number: currentPackage.package_number,
      order_number: currentPackage.order_number,
      sequence: 1,
      total: 1,
      description: currentPackage.description,
      weight: weight,
    });

    // Enviar notificación
    await hardwareApi.sendShipmentNotification({
      customer_email: currentPackage.customer_email,
      customer_name: currentPackage.customer_name,
      tracking_number: currentPackage.tracking_number,
      origin: 'Bodega',
      destination: currentPackage.destination,
    });

    toast.success('✅ Paquete procesado completamente');
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h2>Paquete Actual</h2>
        {currentPackage && (
          <>
            <p>Número: {currentPackage.package_number}</p>
            <p>Peso: {weight} kg</p>
            <button onClick={handleProcess}>
              Procesar Paquete
            </button>
          </>
        )}
      </div>

      <ScaleWeight />
    </div>
  );
}
```

---

## 🔧 CONFIGURACIÓN DE HARDWARE REAL

### Backend - Habilitar Hardware Físico

#### 1. Impresora Térmica
```typescript
// backend/src/services/printer.service.ts
private simulationMode: boolean = false; // Cambiar a false
```

#### 2. Balanza Digital
```typescript
// backend/src/services/scale.service.ts
private simulationMode: boolean = false; // Cambiar a false

// Conectar al puerto correcto
await scaleService.connect('/dev/ttyUSB0'); // Linux
await scaleService.connect('COM3'); // Windows
```

#### 3. Email (SMTP)
```bash
# backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM=noreply@tuempresa.com
```

---

## 🎯 CASOS DE USO COMUNES

### 1. Recepción de Paquetes
- Scanner USB → Leer código de barras
- Balanza → Obtener peso
- Impresora → Imprimir etiqueta
- Email → Notificar cliente

### 2. Despacho de Envíos
- Scanner → Verificar paquetes
- Impresora → Imprimir manifiesto
- Email → Notificar transportista

### 3. Entrega Final
- Scanner → Confirmar entrega
- Email → Notificar cliente
- Sistema → Actualizar estado

---

## 📱 COMPATIBILIDAD

| Hardware | USB | Serial | Bluetooth | WiFi |
|----------|-----|--------|-----------|------|
| **Scanner de Códigos** | ✅ | ❌ | ⚠️ | ⚠️ |
| **Balanza Digital** | ⚠️ | ✅ | ❌ | ⚠️ |
| **Impresora Térmica** | ✅ | ✅ | ⚠️ | ✅ |
| **Scanner de Cámara** | ✅ | N/A | N/A | N/A |

✅ Soportado | ⚠️ Requiere configuración adicional | ❌ No soportado

---

## 🆘 TROUBLESHOOTING

### Scanner no funciona
1. Verificar que emula teclado (HID)
2. Probar escaneando en un editor de texto
3. Verificar configuración de sufijo (Enter)

### Balanza no conecta
1. Verificar puerto: `ls /dev/ttyUSB*` (Linux)
2. Verificar permisos: `sudo chmod 666 /dev/ttyUSB0`
3. Probar con: `screen /dev/ttyUSB0 9600`

### Impresora no imprime
1. Verificar conexión USB
2. Verificar drivers ESC/POS
3. Probar impresión de prueba

### Email no envía
1. Verificar credenciales SMTP
2. Habilitar "Aplicaciones menos seguras" (Gmail)
3. Usar contraseña de aplicación (Gmail)

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [Manual de ESC/POS](https://reference.epson-biz.com/modules/ref_escpos/)
- [ZXing Documentation](https://github.com/zxing-js/library)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [Nodemailer Guide](https://nodemailer.com/about/)

---

**✨ ¡LISTO PARA USAR!**

Accede a http://localhost:5173/warehouse para ver todos los componentes en acción.
