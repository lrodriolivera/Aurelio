// =========================================
// Order Detail Page
// View and manage individual order details
// =========================================

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../services/orders.api';
import {
  Package,
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  DollarSign,
  FileText,
  Scale,
} from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  RECIBIDO: 'Recibido',
  EN_BODEGA_ORIGEN: 'En Bodega Origen',
  EN_TRANSITO_PUERTO: 'En Tránsito a Puerto',
  EN_BODEGA_PUERTO: 'En Bodega Puerto',
  EN_TRANSITO_DESTINO: 'En Tránsito a Destino',
  EN_BODEGA_DESTINO: 'En Bodega Destino',
  LISTO_RETIRO: 'Listo para Retiro',
  ENTREGADO: 'Entregado',
};

const STATUS_COLORS: Record<string, string> = {
  RECIBIDO: 'bg-gray-100 text-gray-800',
  EN_BODEGA_ORIGEN: 'bg-blue-100 text-blue-800',
  EN_TRANSITO_PUERTO: 'bg-yellow-100 text-yellow-800',
  EN_BODEGA_PUERTO: 'bg-purple-100 text-purple-800',
  EN_TRANSITO_DESTINO: 'bg-orange-100 text-orange-800',
  EN_BODEGA_DESTINO: 'bg-indigo-100 text-indigo-800',
  LISTO_RETIRO: 'bg-green-100 text-green-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg text-gray-600">Cargando detalles de la orden...</div>
      </div>
    );
  }

  if (!order?.data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <div className="text-lg text-gray-600">Orden no encontrada</div>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Volver a Órdenes
        </button>
      </div>
    );
  }

  const orderData = order.data;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Orden {orderData.order_number}</h1>
            <p className="text-gray-600">Detalles de la orden de transporte</p>
          </div>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            STATUS_COLORS[orderData.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {STATUS_LABELS[orderData.status] || orderData.status}
        </span>
      </div>

      {/* Main Information */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Información del Cliente</h2>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Razón Social</span>
              <p className="font-medium">{orderData.customer_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">RUT</span>
              <p className="font-medium">{orderData.customer_rut}</p>
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Ruta</h2>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Origen</span>
              <p className="font-medium">{orderData.origin}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Destino</span>
              <p className="font-medium">{orderData.destination}</p>
            </div>
          </div>
        </div>

        {/* Charges Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Costos</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor Declarado</span>
              <p className="font-medium">${Number(orderData.declared_value).toLocaleString('es-CL')}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Flete</span>
              <p className="font-medium">${Number(orderData.freight_charge).toLocaleString('es-CL')}</p>
            </div>
            {orderData.insurance_charge && Number(orderData.insurance_charge) > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Seguro</span>
                <p className="font-medium">${Number(orderData.insurance_charge).toLocaleString('es-CL')}</p>
              </div>
            )}
            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">Total</span>
              <p className="text-lg font-bold text-blue-600">
                ${Number(orderData.total_charge).toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Información Adicional</h2>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Fecha de Recepción</span>
              <p className="font-medium">
                {new Date(orderData.reception_date).toLocaleString('es-CL')}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Peso Total</span>
              <p className="font-medium">{Number(orderData.total_weight).toFixed(2)} kg</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Bultos</span>
              <p className="font-medium">{orderData.total_packages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Instructions */}
      {(orderData.special_instructions || orderData.notes) && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notas e Instrucciones</h2>
          </div>
          <div className="space-y-3">
            {orderData.special_instructions && (
              <div>
                <span className="text-sm font-medium text-gray-600">Instrucciones Especiales</span>
                <p className="mt-1 text-gray-800">{orderData.special_instructions}</p>
              </div>
            )}
            {orderData.notes && (
              <div>
                <span className="text-sm font-medium text-gray-600">Notas</span>
                <p className="mt-1 text-gray-800">{orderData.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Packages List */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">
            Bultos ({orderData.packages?.length || 0})
          </h2>
        </div>

        {orderData.packages && orderData.packages.length > 0 ? (
          <div className="space-y-3">
            {orderData.packages.map((pkg: any, index: number) => (
              <div
                key={pkg.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-semibold text-blue-600">
                        Bulto #{index + 1}
                      </span>
                      {pkg.package_number && (
                        <span className="text-sm text-gray-500">
                          ({pkg.package_number})
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          STATUS_COLORS[pkg.current_status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[pkg.current_status] || pkg.current_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-gray-600">Peso</span>
                        <p className="font-medium">{Number(pkg.weight).toFixed(2)} kg</p>
                      </div>
                      {pkg.length && (
                        <div>
                          <span className="text-gray-600">Dimensiones</span>
                          <p className="font-medium">
                            {pkg.length} × {pkg.width} × {pkg.height} cm
                          </p>
                        </div>
                      )}
                      {pkg.description && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Descripción</span>
                          <p className="font-medium">{pkg.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No hay bultos registrados para esta orden
          </div>
        )}
      </div>
    </div>
  );
}
