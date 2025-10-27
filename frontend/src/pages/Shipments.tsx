// =========================================
// Shipments List Page - Manage Shipments
// =========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi, CreateShipmentDto } from '../services/shipments.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { hardwareApi } from '../services/hardware.api';
import { Printer } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Preparando',
  DISPATCHED: 'Despachado',
  IN_TRANSIT: 'En Tránsito',
  DELIVERED: 'Entregado',
};

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-yellow-100 text-yellow-800',
  DISPATCHED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
};

export default function Shipments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch shipments
  const { data, isLoading } = useQuery({
    queryKey: ['shipments', page, search, statusFilter],
    queryFn: () =>
      shipmentsApi.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      }),
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['shipments-stats'],
    queryFn: shipmentsApi.getStats,
  });

  // Create shipment mutation
  const createMutation = useMutation({
    mutationFn: shipmentsApi.create,
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Envío creado exitosamente');

      // Send email notification (optional - don't block on error)
      try {
        await hardwareApi.sendShipmentNotification({
          customer_email: 'cliente@example.com', // TODO: Get from shipment data
          customer_name: response.data.carrier || 'Cliente',
          tracking_number: response.data.shipment_number,
          origin: 'Puerto Montt',
          destination: response.data.destination,
        });
        toast.success('Notificación enviada al cliente');
      } catch (error) {
        // Email is optional, don't show error to user
        console.log('Email notification failed:', error);
      }

      setIsModalOpen(false);
      navigate(`/shipments/${response.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear envío');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateShipmentDto = {
      destination: formData.get('destination') as string,
      carrier: formData.get('carrier') as string || undefined,
      vehicle_plate: formData.get('vehicle_plate') as string || undefined,
      driver_name: formData.get('driver_name') as string || undefined,
      driver_phone: formData.get('driver_phone') as string || undefined,
      estimated_departure: formData.get('estimated_departure') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    createMutation.mutate(data);
  };

  // Print shipment label
  const handlePrintLabel = async (shipment: any) => {
    try {
      await hardwareApi.printShipmentLabel({
        tracking_number: shipment.shipment_number,
        origin: 'Puerto Montt',
        destination: shipment.destination,
        weight: shipment.total_weight || 0,
        customer_name: shipment.carrier || 'N/A',
      });
      toast.success('✅ Etiqueta impresa correctamente');
    } catch (error) {
      toast.error('❌ Error al imprimir etiqueta');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Envíos</h1>
          <p className="text-gray-600">Administrar envíos y despachos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nuevo Envío
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Envíos</div>
            <div className="mt-1 text-2xl font-bold">{stats.data.total}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Hoy</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{stats.data.today}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Preparando</div>
            <div className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.data.by_status.PLANNING || 0}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Despachados</div>
            <div className="mt-1 text-2xl font-bold text-purple-600">
              {stats.data.by_status.DISPATCHED || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por número, destino o transportista..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                N° Envío
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Destino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Transportista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Órdenes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Bultos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron envíos
                </td>
              </tr>
            ) : (
              data?.data.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">
                    {shipment.shipment_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {shipment.destination}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {shipment.carrier || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {shipment.total_orders || 0}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    <span className="font-medium">{shipment.scanned_packages || 0}</span>
                    <span className="text-gray-500">/{shipment.total_packages || 0}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        STATUS_COLORS[shipment.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATUS_LABELS[shipment.status] || shipment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handlePrintLabel(shipment)}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        title="Imprimir etiqueta"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir
                      </button>
                      <button
                        onClick={() => navigate(`/shipments/${shipment.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} envíos)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Crear Nuevo Envío</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Destino *</label>
                  <select
                    name="destination"
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccione un destino</option>
                    <option value="Coyhaique">Coyhaique</option>
                    <option value="Puerto Montt">Puerto Montt</option>
                    <option value="Puerto Aysén">Puerto Aysén</option>
                    <option value="Balmaceda">Balmaceda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Transportista</label>
                  <input
                    name="carrier"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Patente Vehículo</label>
                  <input
                    name="vehicle_plate"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Conductor</label>
                  <input
                    name="driver_name"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono Conductor</label>
                  <input
                    name="driver_phone"
                    type="tel"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Fecha Estimada de Salida</label>
                  <input
                    name="estimated_departure"
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear Envío'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
