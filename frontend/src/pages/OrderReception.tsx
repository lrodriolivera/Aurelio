// =========================================
// Order Reception Page - Create Orders
// =========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, Package, CreateOrderDto } from '../services/orders.api';
import { customersApi } from '../services/customers.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import BarcodeScanner from '../components/BarcodeScanner';
import ScaleWeight from '../components/ScaleWeight';
import { hardwareApi } from '../services/hardware.api';
import { Camera, Scale } from 'lucide-react';

export default function OrderReception() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [declaredValue, setDeclaredValue] = useState('');
  const [destination, setDestination] = useState('Coyhaique');
  const [origin, setOrigin] = useState('Santiago');
  const [notes, setNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [packages, setPackages] = useState<Package[]>([
    { weight: 0, description: '' },
  ]);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);

  // USB Barcode Scanner - automatically fills description when scanning
  useBarcodeScanner((barcode) => {
    toast.success(`Código escaneado: ${barcode}`);
    updatePackage(currentPackageIndex, 'description', barcode);
  });

  // Get weight from digital scale
  const handleGetWeightFromScale = async (index: number) => {
    try {
      const res = await hardwareApi.getWeight();
      const weight = res.data.data.weight;
      updatePackage(index, 'weight', weight);
      toast.success(`Peso obtenido: ${weight} kg`);
    } catch (error) {
      toast.error('No se pudo obtener el peso de la balanza');
    }
  };

  // Camera scanner handler
  const handleCameraScan = (barcode: string) => {
    toast.success(`Código escaneado: ${barcode}`);
    updatePackage(currentPackageIndex, 'description', barcode);
    setShowCameraScanner(false);
  };

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers', 1, ''],
    queryFn: () => customersApi.getAll({ page: 1, limit: 100 }),
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Orden creada exitosamente');
      navigate('/orders');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear orden');
    },
  });

  const addPackage = () => {
    setPackages([...packages, { weight: 0, description: '' }]);
  };

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const updatePackage = (index: number, field: keyof Package, value: any) => {
    const newPackages = [...packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setPackages(newPackages);
  };

  const calculateTotalWeight = () => {
    return packages.reduce((sum, pkg) => sum + (Number(pkg.weight) || 0), 0);
  };

  const estimateFreight = () => {
    const totalWeight = calculateTotalWeight();
    const freightCharge = totalWeight * 500; // $500 per kg
    const minCharge = 5000;
    return Math.max(freightCharge, minCharge);
  };

  const estimateInsurance = () => {
    const value = Number(declaredValue) || 0;
    if (value >= 1000000) {
      return value * 0.02; // 2%
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedCustomerId) {
      toast.error('Debe seleccionar un cliente');
      return;
    }

    if (!declaredValue || Number(declaredValue) <= 0) {
      toast.error('El valor declarado debe ser mayor a 0');
      return;
    }

    if (packages.some((pkg) => !pkg.weight || pkg.weight <= 0)) {
      toast.error('Todos los bultos deben tener un peso mayor a 0');
      return;
    }

    const orderData: CreateOrderDto = {
      customer_id: selectedCustomerId,
      declared_value: Number(declaredValue),
      destination,
      origin,
      notes: notes || undefined,
      special_instructions: specialInstructions || undefined,
      packages: packages.map((pkg) => ({
        weight: Number(pkg.weight),
        description: pkg.description || undefined,
        length: pkg.length ? Number(pkg.length) : undefined,
        width: pkg.width ? Number(pkg.width) : undefined,
        height: pkg.height ? Number(pkg.height) : undefined,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recepción de Órdenes</h1>
          <p className="text-gray-600">Crear una nueva orden de transporte</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCameraScanner(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Escanear con Cámara
        </button>
      </div>

      {/* Hardware Info */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Conecta tu lector USB o usa el botón de cámara para escanear códigos de barras automáticamente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Route Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Información General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Cliente *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Seleccione un cliente</option>
                {customersData?.data.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.business_name} ({customer.rut})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Origen *</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Destino *</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Valor Declarado (CLP) *
              </label>
              <input
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                required
                min="0"
                step="1000"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bultos</h2>
            <button
              type="button"
              onClick={addPackage}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              + Agregar Bulto
            </button>
          </div>

          <div className="space-y-4">
            {packages.map((pkg, index) => (
              <div key={index} className="rounded-lg border border-gray-300 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Bulto #{index + 1}</h3>
                  {packages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePackage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <input
                      type="text"
                      value={pkg.description || ''}
                      onChange={(e) => updatePackage(index, 'description', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peso (kg) *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={pkg.weight || ''}
                        onChange={(e) => updatePackage(index, 'weight', e.target.value)}
                        required
                        min="0.1"
                        step="0.1"
                        className="mt-1 flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPackageIndex(index);
                          handleGetWeightFromScale(index);
                        }}
                        className="mt-1 rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700 flex items-center gap-1"
                        title="Obtener peso de la balanza"
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Largo (cm)</label>
                    <input
                      type="number"
                      value={pkg.length || ''}
                      onChange={(e) => updatePackage(index, 'length', e.target.value)}
                      min="0"
                      step="1"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ancho (cm)</label>
                    <input
                      type="number"
                      value={pkg.width || ''}
                      onChange={(e) => updatePackage(index, 'width', e.target.value)}
                      min="0"
                      step="1"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alto (cm)</label>
                    <input
                      type="number"
                      value={pkg.height || ''}
                      onChange={(e) => updatePackage(index, 'height', e.target.value)}
                      min="0"
                      step="1"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Información Adicional</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instrucciones Especiales
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Estimated Charges */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Estimación de Costos</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Peso Total:</span>
              <span className="font-medium">{calculateTotalWeight().toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Flete Estimado:</span>
              <span className="font-medium">
                ${estimateFreight().toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Seguro Estimado:</span>
              <span className="font-medium">
                ${estimateInsurance().toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 text-lg">
              <span className="font-semibold">Total Estimado:</span>
              <span className="font-bold text-blue-600">
                ${(estimateFreight() + estimateInsurance()).toLocaleString('es-CL')}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            * Los valores finales pueden variar según tarifas vigentes y seguros adicionales
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createOrderMutation.isPending ? 'Creando...' : 'Crear Orden'}
          </button>
        </div>
      </form>

      {/* Digital Scale Widget */}
      <div className="mt-6">
        <ScaleWeight />
      </div>

      {/* Camera Scanner Modal */}
      {showCameraScanner && (
        <BarcodeScanner
          onScan={handleCameraScan}
          onClose={() => setShowCameraScanner(false)}
        />
      )}
    </div>
  );
}
