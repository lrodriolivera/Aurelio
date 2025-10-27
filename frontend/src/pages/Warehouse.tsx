import { useState } from 'react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import BarcodeScanner from '../components/BarcodeScanner';
import ScaleWeight from '../components/ScaleWeight';
import { hardwareApi } from '../services/hardware.api';
import { Camera, Printer, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Warehouse() {
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [scannedPackage, setScannedPackage] = useState<any>(null);
  const [weight, setWeight] = useState(0);

  // ========================================
  // 1. LECTOR DE CÓDIGOS USB (AUTOMÁTICO)
  // ========================================
  useBarcodeScanner(async (barcode) => {
    console.log('📦 Código escaneado con USB:', barcode);
    toast.success(`Código: ${barcode}`);

    // Simular búsqueda de paquete
    setScannedPackage({
      package_number: barcode,
      order_number: 'OR-2025-001',
      description: 'Paquete de prueba',
      weight: 15.5,
    });

    // Obtener peso actual de la balanza
    try {
      const res = await hardwareApi.getWeight();
      setWeight(res.data.data.weight);
    } catch (error) {
      console.log('Balanza no disponible');
    }
  });

  // ========================================
  // 2. LECTOR DE CÓDIGOS CON CÁMARA
  // ========================================
  const handleCameraScan = async (barcode: string) => {
    console.log('📷 Código escaneado con cámara:', barcode);
    toast.success(`Código: ${barcode}`);
    setShowCameraScanner(false);

    setScannedPackage({
      package_number: barcode,
      order_number: 'OR-2025-001',
      description: 'Paquete escaneado con cámara',
      weight: 12.3,
    });
  };

  // ========================================
  // 3. IMPRIMIR ETIQUETA
  // ========================================
  const handlePrintLabel = async () => {
    if (!scannedPackage) {
      toast.error('No hay paquete seleccionado');
      return;
    }

    try {
      await hardwareApi.printPackageLabel({
        package_number: scannedPackage.package_number,
        order_number: scannedPackage.order_number,
        sequence: 1,
        total: 1,
        description: scannedPackage.description,
        weight: weight || scannedPackage.weight,
      });

      toast.success('✅ Etiqueta impresa correctamente');
    } catch (error) {
      toast.error('❌ Error al imprimir etiqueta');
    }
  };

  // ========================================
  // 4. TARAR BALANZA
  // ========================================
  const handleTare = async () => {
    try {
      await hardwareApi.tareScale();
      setWeight(0);
      toast.success('✅ Balanza tarada');
    } catch (error) {
      toast.error('❌ Error al tarar balanza');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Bodega</h1>

        <button
          onClick={() => setShowCameraScanner(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Camera className="w-5 h-5" />
          Escanear con Cámara
        </button>
      </div>

      {/* INSTRUCCIONES */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          💡 <strong>Instrucciones:</strong> Conecta tu lector de códigos USB o usa el botón de cámara para escanear paquetes
        </p>
      </div>

      {/* GRID CON INFORMACIÓN Y BALANZA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* INFORMACIÓN DEL PAQUETE ESCANEADO */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Paquete Escaneado</h2>
          </div>

          {scannedPackage ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Número de Paquete</label>
                <p className="text-lg font-bold">{scannedPackage.package_number}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Orden</label>
                <p className="text-lg">{scannedPackage.order_number}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Descripción</label>
                <p className="text-lg">{scannedPackage.description}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Peso en Balanza</label>
                <p className="text-2xl font-bold text-green-600">{weight.toFixed(2)} kg</p>
              </div>

              <button
                onClick={handlePrintLabel}
                className="w-full mt-4 bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700"
              >
                <Printer className="w-5 h-5" />
                Imprimir Etiqueta
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Escanea un código de barras para comenzar</p>
            </div>
          )}
        </div>

        {/* BALANZA DIGITAL */}
        <div>
          <ScaleWeight />
        </div>
      </div>

      {/* MODAL DE SCANNER CON CÁMARA */}
      {showCameraScanner && (
        <BarcodeScanner
          onScan={handleCameraScan}
          onClose={() => setShowCameraScanner(false)}
        />
      )}
    </div>
  );
}
