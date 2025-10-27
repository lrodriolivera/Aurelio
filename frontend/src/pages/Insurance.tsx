// =========================================
// Insurance Page - Gestión de Seguros
// =========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insuranceApi, InsuranceConfig, CreateInsuranceConfigDto, UpdateInsuranceConfigDto } from '../services/insurance.api';
import toast from 'react-hot-toast';

export default function Insurance() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<InsuranceConfig | null>(null);
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);

  // Fetch insurance configs
  const { data, isLoading } = useQuery({
    queryKey: ['insurance', page, search],
    queryFn: () => insuranceApi.getAll({ page, limit: 10, search }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: insuranceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
      toast.success('Configuración de seguro creada exitosamente');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear configuración');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInsuranceConfigDto }) =>
      insuranceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
      toast.success('Configuración actualizada exitosamente');
      setIsModalOpen(false);
      setEditingConfig(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar configuración');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: insuranceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
      toast.success('Configuración eliminada exitosamente');
      setDeleteConfigId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar configuración');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Convert percentage to decimal (e.g., 1.5% -> 0.015)
    const ratePercentage = parseFloat(formData.get('rate_percentage') as string);
    const rateDecimal = ratePercentage / 100;

    if (editingConfig) {
      const data: UpdateInsuranceConfigDto = {
        name: formData.get('name') as string,
        rate: rateDecimal,
        min_value: parseFloat(formData.get('min_value') as string),
        is_active: formData.get('is_active') === 'true',
      };
      updateMutation.mutate({ id: editingConfig.id, data });
    } else {
      const data: CreateInsuranceConfigDto = {
        name: formData.get('name') as string,
        rate: rateDecimal,
        min_value: parseFloat(formData.get('min_value') as string),
      };
      createMutation.mutate(data);
    }
  };

  const openEditModal = (config: InsuranceConfig) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatPercentage = (decimal: number) => {
    return (decimal * 100).toFixed(2) + '%';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuración de Seguros</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nueva Configuración
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
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
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tasa de Seguro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Valor Mínimo
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
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron configuraciones
                </td>
              </tr>
            ) : (
              data?.data.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {config.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatPercentage(config.rate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(config.min_value)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {config.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(config)}
                      className="mr-3 text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    {!config.is_active && (
                      <button
                        onClick={() => setDeleteConfigId(config.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
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
            Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} configuraciones)
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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingConfig?.name}
                  placeholder="Ej: Seguro Estándar 2025"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tasa de Seguro (%) *</label>
                <input
                  name="rate_percentage"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editingConfig ? (editingConfig.rate * 100) : ''}
                  placeholder="1.5"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Porcentaje del valor declarado. Ej: 1.5% = $15 por cada $1000
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Mínimo Asegurable (CLP) *</label>
                <input
                  name="min_value"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editingConfig?.min_value}
                  placeholder="50000"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Valor mínimo del paquete para aplicar seguro
                </p>
              </div>

              {editingConfig && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    name="is_active"
                    defaultValue={editingConfig.is_active ? 'true' : 'false'}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="true">Activa (desactiva todas las demás)</option>
                    <option value="false">Inactiva</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Solo puede haber una configuración activa a la vez
                  </p>
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
                    : editingConfig
                    ? 'Actualizar'
                    : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfigId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 max-w-md">
            <h2 className="mb-4 text-xl font-bold">Confirmar Eliminación</h2>
            <p className="mb-6 text-gray-600">
              ¿Está seguro de que desea eliminar esta configuración de seguro?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfigId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfigId)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
