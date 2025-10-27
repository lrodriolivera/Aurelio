// =========================================
// Shipment Detail Page
// =========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi } from '../services/shipments.api';
import { ordersApi } from '../services/orders.api';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, Truck, Scan } from 'lucide-react';

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [packageNumber, setPackageNumber] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Fetch shipment details
  const { data, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => shipmentsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch available orders (same destination, not dispatched yet)
  const { data: ordersData } = useQuery({
    queryKey: ['orders-available', data?.data.destination],
    queryFn: () =>
      ordersApi.getAll({
        page: 1,
        limit: 100,
        status: 'EN_BODEGA_ORIGEN',
      }),
    enabled: !!data?.data.destination && isAddOrderModalOpen,
  });

  // Add order mutation
  const addOrderMutation = useMutation({
    mutationFn: (orderId: string) => shipmentsApi.addOrder(id!, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
      toast.success('Orden agregada al envío');
      setIsAddOrderModalOpen(false);
      setSelectedOrderId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al agregar orden');
    },
  });

  // Remove order mutation
  const removeOrderMutation = useMutation({
    mutationFn: (orderId: string) => shipmentsApi.removeOrder(id!, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
      toast.success('Orden removida del envío');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al remover orden');
    },
  });

  // Scan package mutation
  const scanMutation = useMutation({
    mutationFn: (pkgNumber: string) =>
      shipmentsApi.scanPackage(id!, pkgNumber, data?.data.destination || 'Bodega'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
      toast.success('Bulto escaneado exitosamente');
      setPackageNumber('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al escanear bulto');
    },
  });

  // Dispatch shipment mutation
  const dispatchMutation = useMutation({
    mutationFn: () => shipmentsApi.dispatch(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Envío despachado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al despachar envío');
    },
  });

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!data?.data) {
    return <div className="p-6">Envío no encontrado</div>;
  }

  const shipment = data.data;
  const totalPackages = shipment.orders?.reduce((sum, order) => sum + (order.packages?.length || 0), 0) || 0;
  const scannedPackages = shipment.orders?.reduce(
    (sum, order) => sum + (order.packages?.filter((p) => p.label_printed).length || 0),
    0
  ) || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/shipments')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver a Envíos
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{shipment.shipment_number}</h1>
            <p className="text-gray-600">Destino: {shipment.destination}</p>
          </div>
          <div className="flex gap-3">
            {shipment.status === 'PLANNING' && (
              <>
                <button
                  onClick={() => setIsAddOrderModalOpen(true)}
                  className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                >
                  Agregar Orden
                </button>
                <button
                  onClick={() => setIsScanModalOpen(true)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Escanear Bultos
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Está seguro de despachar este envío?')) {
                      dispatchMutation.mutate();
                    }
                  }}
                  disabled={!shipment.orders || shipment.orders.length === 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Despachar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Shipment Info */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Estado</div>
          <div className="mt-1 text-lg font-semibold">{shipment.status}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Órdenes</div>
          <div className="mt-1 text-lg font-semibold">{shipment.orders?.length || 0}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Bultos Escaneados</div>
          <div className="mt-1 text-lg font-semibold">
            {scannedPackages} / {totalPackages}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Transportista</div>
          <div className="mt-1 text-lg font-semibold">{shipment.carrier || '-'}</div>
        </div>
      </div>

      {/* Orders List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Órdenes en este Envío</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {shipment.orders && shipment.orders.length > 0 ? (
            shipment.orders.map((order) => {
              const scanned = order.packages?.filter((p) => p.label_printed).length || 0;
              const total = order.packages?.length || 0;
              return (
                <div key={order.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-4">
                        <h3 className="font-semibold text-blue-600">{order.order_number}</h3>
                        <span className="text-sm text-gray-600">
                          {order.customer_name} ({order.customer_rut})
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Bultos:</span>{' '}
                          <span className="font-medium">{total}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Escaneados:</span>{' '}
                          <span className={`font-medium ${scanned === total ? 'text-green-600' : 'text-yellow-600'}`}>
                            {scanned}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Peso:</span>{' '}
                          <span className="font-medium">{Number(order.total_weight).toFixed(2)} kg</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor:</span>{' '}
                          <span className="font-medium">
                            ${Number(order.total_charge).toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                      {/* Packages */}
                      {order.packages && order.packages.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.packages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className={`rounded px-2 py-1 text-xs ${
                                pkg.label_printed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {pkg.package_number}
                              {pkg.label_printed && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {shipment.status === 'PLANNING' && (
                      <button
                        onClick={() => removeOrderMutation.mutate(order.id)}
                        disabled={removeOrderMutation.isPending}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-500">
              No hay órdenes en este envío. Agregue órdenes para comenzar.
            </div>
          )}
        </div>
      </div>

      {/* Add Order Modal */}
      {isAddOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Agregar Orden al Envío</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Seleccionar Orden</label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Seleccione una orden</option>
                {ordersData?.data
                  .filter((order) => order.destination === shipment.destination)
                  .map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.customer_name} ({order.total_packages} bultos,{' '}
                      {Number(order.total_weight).toFixed(2)} kg)
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAddOrderModalOpen(false);
                  setSelectedOrderId('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => selectedOrderId && addOrderMutation.mutate(selectedOrderId)}
                disabled={!selectedOrderId || addOrderMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {addOrderMutation.isPending ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Modal */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Scan className="h-6 w-6" />
              Escanear Bulto
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Número de Bulto</label>
              <input
                type="text"
                value={packageNumber}
                onChange={(e) => setPackageNumber(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && packageNumber) {
                    scanMutation.mutate(packageNumber);
                  }
                }}
                placeholder="Escanee o ingrese el código"
                autoFocus
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Escanee el código QR o ingrese manualmente el número de bulto
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsScanModalOpen(false);
                  setPackageNumber('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => packageNumber && scanMutation.mutate(packageNumber)}
                disabled={!packageNumber || scanMutation.isPending}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {scanMutation.isPending ? 'Escaneando...' : 'Escanear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
