// =========================================
// Tracking Page
// Track Orders and Packages
// =========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackingApi, OrderTracking, PackageTracking } from '../services/tracking.api';
import { Search, Package, MapPin, Clock, CheckCircle, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATE_LABELS: Record<string, string> = {
  RECIBIDO: 'Recibido en origen',
  EN_BODEGA_ORIGEN: 'En bodega origen',
  EN_TRANSITO_PUERTO: 'En tránsito a puerto',
  EN_PUERTO: 'En puerto',
  EN_TRANSITO_DESTINO: 'En tránsito a destino',
  EN_BODEGA_DESTINO: 'En bodega destino',
  LISTO_RETIRO: 'Listo para retiro',
  ENTREGADO: 'Entregado',
};

const STATE_COLORS: Record<string, string> = {
  RECIBIDO: 'bg-blue-100 text-blue-800',
  EN_BODEGA_ORIGEN: 'bg-indigo-100 text-indigo-800',
  EN_TRANSITO_PUERTO: 'bg-purple-100 text-purple-800',
  EN_PUERTO: 'bg-yellow-100 text-yellow-800',
  EN_TRANSITO_DESTINO: 'bg-orange-100 text-orange-800',
  EN_BODEGA_DESTINO: 'bg-green-100 text-green-800',
  LISTO_RETIRO: 'bg-teal-100 text-teal-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
};

export default function Tracking() {
  const [searchNumber, setSearchNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tracking', trackingNumber],
    queryFn: () => trackingApi.track(trackingNumber),
    enabled: !!trackingNumber,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNumber.trim()) {
      toast.error('Ingrese un número de seguimiento');
      return;
    }
    setTrackingNumber(searchNumber.trim());
  };

  const renderTimeline = (states: any[]) => {
    return (
      <div className="relative">
        {states.map((state, index) => (
          <div key={state.id} className="flex gap-4 pb-8">
            {/* Timeline line and dot */}
            <div className="relative flex flex-col items-center">
              <div
                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${
                  index === 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {index === 0 ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <Circle className="h-3 w-3 text-white" />
                )}
              </div>
              {index < states.length - 1 && (
                <div className="absolute top-10 h-full w-0.5 bg-gray-300" />
              )}
            </div>

            {/* Event details */}
            <div className="flex-1 pb-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        STATE_COLORS[state.state] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATE_LABELS[state.state] || state.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {new Date(state.changed_at).toLocaleString('es-CL')}
                  </div>
                </div>
                {state.location && (
                  <div className="mb-1 flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4" />
                    {state.location}
                  </div>
                )}
                {state.description && (
                  <p className="text-sm text-gray-600">{state.description}</p>
                )}
                {state.changed_by_name && (
                  <p className="mt-2 text-xs text-gray-500">
                    Registrado por: {state.changed_by_name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPackage = (pkg: PackageTracking, showTimeline: boolean = false) => {
    return (
      <div key={pkg.package_id} className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">{pkg.package_number}</h3>
            </div>
            <p className="mt-1 text-sm text-gray-600">{pkg.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Peso</div>
            <div className="text-lg font-semibold">{Number(pkg.weight).toFixed(2)} kg</div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Estado Actual</div>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                STATE_COLORS[pkg.current_status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {STATE_LABELS[pkg.current_status] || pkg.current_status}
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-600">Ubicación Actual</div>
            <div className="mt-1 font-medium">{pkg.current_location || '-'}</div>
          </div>
        </div>

        {showTimeline && pkg.states && pkg.states.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-4 font-semibold">Historial de Estados</h4>
            {renderTimeline(pkg.states)}
          </div>
        )}
      </div>
    );
  };

  const renderOrder = (order: OrderTracking) => {
    return (
      <div>
        {/* Order Header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{order.order_number}</h2>
              <p className="text-gray-600">
                {order.customer_name} - {order.customer_rut}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Estado</div>
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Origen</div>
              <div className="font-medium">{order.origin}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Destino</div>
              <div className="font-medium">{order.destination}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Bultos</div>
              <div className="font-medium">{order.total_packages}</div>
            </div>
          </div>

          {order.customer_phone && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm text-gray-600">Teléfono de contacto</div>
              <div className="font-medium">{order.customer_phone}</div>
            </div>
          )}
        </div>

        {/* Packages */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bultos ({order.packages.length})</h3>
          {order.packages.map((pkg) => renderPackage(pkg, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Seguimiento de Envíos</h1>
        <p className="text-gray-600">
          Rastrea tus órdenes y bultos ingresando el número de seguimiento
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow">
        <form onSubmit={handleSearch}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Número de Orden o Bulto
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  placeholder="Ej: OR-202510-000006 o OR-202510-000006-P001"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          No se encontró información para el número de seguimiento ingresado. Verifica que el
          número esté correcto.
        </div>
      )}

      {/* Results */}
      {data && (
        <div>
          {data.data.order && !data.data.package && renderOrder(data.data.order)}
          {data.data.package && data.data.order && (
            <div>
              {/* Show highlighted package first */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold">Bulto Consultado</h3>
                {renderPackage(data.data.package, true)}
              </div>

              {/* Show order details */}
              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold">Información de la Orden</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Orden:</span>{' '}
                    <span className="font-medium">{data.data.order.order_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cliente:</span>{' '}
                    <span className="font-medium">{data.data.order.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Origen:</span>{' '}
                    <span className="font-medium">{data.data.order.origin}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Destino:</span>{' '}
                    <span className="font-medium">{data.data.order.destination}</span>
                  </div>
                </div>
              </div>

              {/* Show other packages in the order */}
              {data.data.order.packages.length > 1 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Otros Bultos de esta Orden ({data.data.order.packages.length - 1})
                  </h3>
                  <div className="space-y-4">
                    {data.data.order.packages
                      .filter((p: PackageTracking) => p.package_id !== data.data.package.package_id)
                      .map((pkg: PackageTracking) => renderPackage(pkg, false))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!trackingNumber && !isLoading && !error && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Ingresa un número de seguimiento
          </h3>
          <p className="text-gray-600">
            Utiliza el formulario de arriba para buscar información sobre tu envío
          </p>
        </div>
      )}
    </div>
  );
}
