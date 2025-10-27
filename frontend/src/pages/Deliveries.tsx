// =========================================
// Deliveries Page
// Manage Package Deliveries and Pickups
// =========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi, CreateDeliveryDto } from '../services/deliveries.api';
import toast from 'react-hot-toast';
import {
  Package,
  Truck,
  User,
  MapPin,
  Phone,
  Home,
  CheckCircle,
  X,
  Camera,
} from 'lucide-react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import BarcodeScanner from '../components/BarcodeScanner';
import { hardwareApi } from '../services/hardware.api';

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  ENTREGA_DOMICILIO: 'Entrega a Domicilio',
  RETIRO_SUCURSAL: 'Retiro en Sucursal',
};

export default function Deliveries() {
  const queryClient = useQueryClient();
  const [selectedView, setSelectedView] = useState<'ready' | 'history'>('ready');
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [deliveryType, setDeliveryType] = useState<'ENTREGA_DOMICILIO' | 'RETIRO_SUCURSAL'>(
    'RETIRO_SUCURSAL'
  );
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // USB Barcode Scanner - search and open delivery modal
  useBarcodeScanner((barcode) => {
    const pkg = readyPackages?.data?.find(
      (p: any) => p.package_number === barcode || p.order_number === barcode
    );
    if (pkg) {
      handleDelivery(pkg);
      toast.success(`Paquete encontrado: ${barcode}`);
    } else {
      toast.error(`Paquete no encontrado: ${barcode}`);
    }
  });

  // Camera scanner handler
  const handleCameraScan = (barcode: string) => {
    setShowCameraScanner(false);
    const pkg = readyPackages?.data?.find(
      (p: any) => p.package_number === barcode || p.order_number === barcode
    );
    if (pkg) {
      handleDelivery(pkg);
      toast.success(`Paquete encontrado: ${barcode}`);
    } else {
      toast.error(`Paquete no encontrado: ${barcode}`);
    }
  };

  // Fetch ready packages
  const { data: readyPackages, isLoading: loadingReady } = useQuery({
    queryKey: ['deliveries-ready'],
    queryFn: () => deliveriesApi.getReadyPackages(),
    enabled: selectedView === 'ready',
  });

  // Fetch delivery history
  const {
    data: deliveryHistory,
    isLoading: loadingHistory,
  } = useQuery({
    queryKey: ['deliveries-history'],
    queryFn: () => deliveriesApi.getAll({ page: 1, limit: 50 }),
    enabled: selectedView === 'history',
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['deliveries-stats'],
    queryFn: deliveriesApi.getStats,
  });

  // Create delivery mutation
  const deliveryMutation = useMutation({
    mutationFn: deliveriesApi.create,
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['deliveries-ready'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries-history'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries-stats'] });
      toast.success('Entrega registrada exitosamente');

      // Send delivery notification email (optional)
      try {
        await hardwareApi.sendDeliveryNotification({
          customer_email: selectedPackage.customer_email || 'cliente@example.com',
          customer_name: selectedPackage.customer_name,
          tracking_number: selectedPackage.package_number,
          delivered_at: new Date().toISOString(),
          delivered_to: response.data.recipient_name || 'N/A',
          signature_url: undefined,
        });
        toast.success('Notificación de entrega enviada');
      } catch (error) {
        // Email is optional, don't show error
        console.log('Email notification failed:', error);
      }

      setIsDeliveryModalOpen(false);
      setSelectedPackage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al registrar entrega');
    },
  });

  const handleDelivery = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsDeliveryModalOpen(true);
  };

  const handleSubmitDelivery = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateDeliveryDto = {
      package_id: selectedPackage.package_id,
      delivery_type: deliveryType,
      recipient_name: formData.get('recipient_name') as string,
      recipient_rut: formData.get('recipient_rut') as string || undefined,
      recipient_phone: formData.get('recipient_phone') as string || undefined,
      delivery_address:
        deliveryType === 'ENTREGA_DOMICILIO'
          ? (formData.get('delivery_address') as string)
          : undefined,
      delivery_city:
        deliveryType === 'ENTREGA_DOMICILIO'
          ? (formData.get('delivery_city') as string)
          : undefined,
      delivery_notes: formData.get('delivery_notes') as string || undefined,
    };

    deliveryMutation.mutate(data);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Entregas</h1>
          <p className="text-gray-600">Registrar entregas y retiros de bultos</p>
        </div>
        <button
          onClick={() => setShowCameraScanner(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Escanear con Cámara
        </button>
      </div>

      {/* Scanner Info */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Usa el lector USB o el botón de cámara para escanear el código del paquete y abrir automáticamente el formulario de entrega
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Entregas</div>
            <div className="mt-1 text-2xl font-bold">{stats.data.total}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Hoy</div>
            <div className="mt-1 text-2xl font-bold text-green-600">{stats.data.today}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">A Domicilio Hoy</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {stats.data.by_type.ENTREGA_DOMICILIO || 0}
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="mb-4 flex gap-2 border-b">
        <button
          onClick={() => setSelectedView('ready')}
          className={`px-4 py-2 font-medium ${
            selectedView === 'ready'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Listos para Entrega ({readyPackages?.data?.length || 0})
        </button>
        <button
          onClick={() => setSelectedView('history')}
          className={`px-4 py-2 font-medium ${
            selectedView === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Historial
        </button>
      </div>

      {/* Ready Packages View */}
      {selectedView === 'ready' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          {loadingReady ? (
            <div className="p-6 text-center">Cargando...</div>
          ) : readyPackages?.data?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay bultos listos para entrega o retiro
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {readyPackages?.data?.map((pkg: any) => (
                <div key={pkg.package_id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-blue-600">{pkg.package_number}</h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            pkg.current_status === 'LISTO_RETIRO'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {pkg.current_status === 'LISTO_RETIRO'
                            ? 'Listo para Retiro'
                            : 'En Bodega Destino'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Orden:</span>{' '}
                          <span className="font-medium">{pkg.order_number}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cliente:</span>{' '}
                          <span className="font-medium">{pkg.customer_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Destino:</span>{' '}
                          <span className="font-medium">{pkg.destination}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Peso:</span>{' '}
                          <span className="font-medium">{Number(pkg.weight).toFixed(2)} kg</span>
                        </div>
                        {pkg.customer_phone && (
                          <div>
                            <span className="text-gray-600">Teléfono:</span>{' '}
                            <span className="font-medium">{pkg.customer_phone}</span>
                          </div>
                        )}
                      </div>

                      {pkg.description && (
                        <p className="mt-2 text-sm text-gray-600">{pkg.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelivery(pkg)}
                      className="ml-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Registrar Entrega
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History View */}
      {selectedView === 'history' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          {loadingHistory ? (
            <div className="p-6 text-center">Cargando...</div>
          ) : deliveryHistory?.data?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No hay entregas registradas</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deliveryHistory?.data?.map((delivery: any) => (
                <div key={delivery.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        {delivery.delivery_type === 'ENTREGA_DOMICILIO' ? (
                          <Home className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Truck className="h-5 w-5 text-green-600" />
                        )}
                        <h3 className="font-semibold">{delivery.package_number}</h3>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          {DELIVERY_TYPE_LABELS[delivery.delivery_type]}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Orden:</span>{' '}
                          <span className="font-medium">{delivery.order_number}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cliente:</span>{' '}
                          <span className="font-medium">{delivery.customer_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Receptor:</span>{' '}
                          <span className="font-medium">{delivery.recipient_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fecha:</span>{' '}
                          <span className="font-medium">
                            {new Date(delivery.delivered_at).toLocaleString('es-CL')}
                          </span>
                        </div>
                        {delivery.delivered_by_name && (
                          <div>
                            <span className="text-gray-600">Registrado por:</span>{' '}
                            <span className="font-medium">{delivery.delivered_by_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delivery Modal */}
      {isDeliveryModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Registrar Entrega</h2>
              <button
                onClick={() => {
                  setIsDeliveryModalOpen(false);
                  setSelectedPackage(null);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bulto:</span>{' '}
                  <span className="font-medium">{selectedPackage.package_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cliente:</span>{' '}
                  <span className="font-medium">{selectedPackage.customer_name}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Entrega *
                </label>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="RETIRO_SUCURSAL"
                      checked={deliveryType === 'RETIRO_SUCURSAL'}
                      onChange={(e) =>
                        setDeliveryType(e.target.value as 'ENTREGA_DOMICILIO' | 'RETIRO_SUCURSAL')
                      }
                      className="mr-2"
                    />
                    Retiro en Sucursal
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ENTREGA_DOMICILIO"
                      checked={deliveryType === 'ENTREGA_DOMICILIO'}
                      onChange={(e) =>
                        setDeliveryType(e.target.value as 'ENTREGA_DOMICILIO' | 'RETIRO_SUCURSAL')
                      }
                      className="mr-2"
                    />
                    Entrega a Domicilio
                  </label>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Receptor *
                  </label>
                  <input
                    name="recipient_name"
                    type="text"
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">RUT del Receptor</label>
                  <input
                    name="recipient_rut"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono del Receptor
                  </label>
                  <input
                    name="recipient_phone"
                    type="tel"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address fields for home delivery */}
              {deliveryType === 'ENTREGA_DOMICILIO' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Dirección *</label>
                    <input
                      name="delivery_address"
                      type="text"
                      required={deliveryType === 'ENTREGA_DOMICILIO'}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ciudad *</label>
                    <input
                      name="delivery_city"
                      type="text"
                      required={deliveryType === 'ENTREGA_DOMICILIO'}
                      defaultValue={selectedPackage.destination}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  name="delivery_notes"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeliveryModalOpen(false);
                    setSelectedPackage(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deliveryMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {deliveryMutation.isPending ? 'Registrando...' : 'Registrar Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
