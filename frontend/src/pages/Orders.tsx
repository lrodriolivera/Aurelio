// =========================================
// Orders List Page
// =========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../services/orders.api';
import { useNavigate } from 'react-router-dom';

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

export default function Orders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter],
    queryFn: () =>
      ordersApi.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      }),
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['orders-stats'],
    queryFn: ordersApi.getStats,
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Órdenes de Transporte</h1>
          <p className="text-gray-600">Gestión de órdenes de transporte</p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nueva Orden
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Órdenes</div>
            <div className="mt-1 text-2xl font-bold">{stats.data.total}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Hoy</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{stats.data.today}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">En Tránsito</div>
            <div className="mt-1 text-2xl font-bold text-yellow-600">
              {(stats.data.by_status.EN_TRANSITO_PUERTO || 0) +
                (stats.data.by_status.EN_TRANSITO_DESTINO || 0)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Listo Retiro</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {stats.data.by_status.LISTO_RETIRO || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por número de orden, cliente..."
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
                N° Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Origen - Destino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Bultos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Peso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total
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
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron órdenes
                </td>
              </tr>
            ) : (
              data?.data.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-gray-500">{order.customer_rut}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.origin} → {order.destination}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {order.total_packages}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {Number(order.total_weight).toFixed(2)} kg
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ${Number(order.total_charge).toLocaleString('es-CL')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {data.pagination.page} de {data.pagination.totalPages}
            {data.pagination.total && ` (${data.pagination.total} órdenes)`}
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
              disabled={page >= (data.pagination.totalPages || 0)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
