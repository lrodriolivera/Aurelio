// =========================================
// Freight Rates Page - Gestión de Tarifas
// =========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freightRatesApi, FreightRate, CreateFreightRateDto, UpdateFreightRateDto } from '../services/freightRates.api';
import toast from 'react-hot-toast';

export default function FreightRates() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<FreightRate | null>(null);
  const [deleteRateId, setDeleteRateId] = useState<string | null>(null);

  // Fetch freight rates
  const { data, isLoading } = useQuery({
    queryKey: ['freight-rates', page, search],
    queryFn: () => freightRatesApi.getAll({ page, limit: 10, search }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: freightRatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freight-rates'] });
      toast.success('Tarifa creada exitosamente');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear tarifa');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFreightRateDto }) =>
      freightRatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freight-rates'] });
      toast.success('Tarifa actualizada exitosamente');
      setIsModalOpen(false);
      setEditingRate(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar tarifa');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: freightRatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freight-rates'] });
      toast.success('Tarifa desactivada exitosamente');
      setDeleteRateId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al desactivar tarifa');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (editingRate) {
      const data: UpdateFreightRateDto = {
        route_name: formData.get('route_name') as string,
        origin: formData.get('origin') as string,
        destination: formData.get('destination') as string,
        rate_per_kg: parseFloat(formData.get('rate_per_kg') as string),
        min_charge: parseFloat(formData.get('min_charge') as string),
        effective_from: formData.get('effective_from') as string,
        effective_to: formData.get('effective_to') as string || undefined,
        is_active: formData.get('is_active') === 'true',
      };
      updateMutation.mutate({ id: editingRate.id, data });
    } else {
      const data: CreateFreightRateDto = {
        route_name: formData.get('route_name') as string,
        origin: formData.get('origin') as string,
        destination: formData.get('destination') as string,
        rate_per_kg: parseFloat(formData.get('rate_per_kg') as string),
        min_charge: parseFloat(formData.get('min_charge') as string),
        effective_from: formData.get('effective_from') as string,
        effective_to: formData.get('effective_to') as string || undefined,
      };
      createMutation.mutate(data);
    }
  };

  const openEditModal = (rate: FreightRate) => {
    setEditingRate(rate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRate(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarifas de Flete</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nueva Tarifa
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de ruta, origen o destino..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ruta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Origen - Destino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tarifa/Kg
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cargo Mín.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Vigencia
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
                  No se encontraron tarifas
                </td>
              </tr>
            ) : (
              data?.data.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {rate.route_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {rate.origin} → {rate.destination}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(rate.rate_per_kg)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(rate.min_charge)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(rate.effective_from)}
                    {rate.effective_to && ` - ${formatDate(rate.effective_to)}`}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${rate.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {rate.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(rate)}
                      className="mr-3 text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteRateId(rate.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Desactivar
                    </button>
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
            Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} tarifas)
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editingRate ? 'Editar Tarifa' : 'Nueva Tarifa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de Ruta *</label>
                <input
                  name="route_name"
                  type="text"
                  required
                  defaultValue={editingRate?.route_name}
                  placeholder="Ej: Santiago - Coyhaique"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Origen *</label>
                  <input
                    name="origin"
                    type="text"
                    required
                    defaultValue={editingRate?.origin}
                    placeholder="Santiago"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destino *</label>
                  <input
                    name="destination"
                    type="text"
                    required
                    defaultValue={editingRate?.destination}
                    placeholder="Coyhaique"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarifa por Kg (CLP) *</label>
                  <input
                    name="rate_per_kg"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingRate?.rate_per_kg}
                    placeholder="1500"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cargo Mínimo (CLP) *</label>
                  <input
                    name="min_charge"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingRate?.min_charge}
                    placeholder="5000"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vigente Desde *</label>
                  <input
                    name="effective_from"
                    type="date"
                    required
                    defaultValue={editingRate?.effective_from.split('T')[0]}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vigente Hasta</label>
                  <input
                    name="effective_to"
                    type="date"
                    defaultValue={editingRate?.effective_to?.split('T')[0]}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {editingRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    name="is_active"
                    defaultValue={editingRate.is_active ? 'true' : 'false'}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Guardando...'
                    : editingRate
                    ? 'Actualizar'
                    : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 max-w-md">
            <h2 className="mb-4 text-xl font-bold">Confirmar Desactivación</h2>
            <p className="mb-6 text-gray-600">
              ¿Está seguro de que desea desactivar esta tarifa?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteRateId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteRateId)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
