// =========================================
// Reports Page
// View Reports and Analytics
// =========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/reports.api';
import {
  BarChart3,
  Package,
  Truck,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';

type ReportType = 'general' | 'orders' | 'shipments' | 'deliveries';

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('general');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // General stats
  const { data: generalStats, isLoading: loadingGeneral } = useQuery({
    queryKey: ['reports', 'general'],
    queryFn: () => reportsApi.getGeneralStats(),
    enabled: reportType === 'general',
  });

  // Orders report
  const { data: ordersReport, isLoading: loadingOrders } = useQuery({
    queryKey: ['reports', 'orders', startDate, endDate],
    queryFn: () => reportsApi.getOrdersReport({ start_date: startDate, end_date: endDate }),
    enabled: reportType === 'orders',
  });

  // Shipments report
  const { data: shipmentsReport, isLoading: loadingShipments } = useQuery({
    queryKey: ['reports', 'shipments', startDate, endDate],
    queryFn: () => reportsApi.getShipmentsReport({ start_date: startDate, end_date: endDate }),
    enabled: reportType === 'shipments',
  });

  // Deliveries report
  const { data: deliveriesReport, isLoading: loadingDeliveries } = useQuery({
    queryKey: ['reports', 'deliveries', startDate, endDate],
    queryFn: () => reportsApi.getDeliveriesReport({ start_date: startDate, end_date: endDate }),
    enabled: reportType === 'deliveries',
  });

  const isLoading = loadingGeneral || loadingOrders || loadingShipments || loadingDeliveries;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visualiza reportes detallados y estadísticas del sistema
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setReportType('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'general'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Estadísticas Generales
        </button>
        <button
          onClick={() => setReportType('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'orders'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FileText className="h-5 w-5" />
          Reporte de Órdenes
        </button>
        <button
          onClick={() => setReportType('shipments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'shipments'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Truck className="h-5 w-5" />
          Reporte de Envíos
        </button>
        <button
          onClick={() => setReportType('deliveries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'deliveries'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Package className="h-5 w-5" />
          Reporte de Entregas
        </button>
      </div>

      {/* Date Range Filter (for non-general reports) */}
      {reportType !== 'general' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Rango de fechas:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Fecha inicio"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Fecha fin"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* General Stats */}
      {reportType === 'general' && generalStats && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Orders Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <FileText className="h-10 w-10 text-blue-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-600">Órdenes</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{generalStats.data.orders.total}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-gray-600">Hoy: {generalStats.data.orders.today}</p>
              <p className="text-gray-600">Esta semana: {generalStats.data.orders.this_week}</p>
              <p className="text-gray-600">Este mes: {generalStats.data.orders.this_month}</p>
            </div>
          </div>

          {/* Packages Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <Package className="h-10 w-10 text-purple-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-600">Bultos</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{generalStats.data.packages.total}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-gray-600">En tránsito: {generalStats.data.packages.in_transit}</p>
              <p className="text-gray-600">Entregados: {generalStats.data.packages.delivered}</p>
            </div>
          </div>

          {/* Shipments Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <Truck className="h-10 w-10 text-orange-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-600">Envíos</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{generalStats.data.shipments.total}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-gray-600">Activos: {generalStats.data.shipments.active}</p>
              <p className="text-gray-600">Completados: {generalStats.data.shipments.completed}</p>
            </div>
          </div>

          {/* Deliveries Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <Package className="h-10 w-10 text-green-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-600">Entregas</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{generalStats.data.deliveries.total}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-gray-600">Hoy: {generalStats.data.deliveries.today}</p>
              <p className="text-gray-600">Esta semana: {generalStats.data.deliveries.this_week}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Report */}
      {reportType === 'orders' && ordersReport && !isLoading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Órdenes</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{ordersReport.data.total_orders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Bultos</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{ordersReport.data.total_packages}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Peso Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{ordersReport.data.total_weight.toFixed(2)} kg</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">${ordersReport.data.total_revenue.toLocaleString()}</p>
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Estado</h3>
            <div className="space-y-3">
              {ordersReport.data.by_status.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Destination */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Destino</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bultos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ordersReport.data.by_destination.map((item: any) => (
                    <tr key={item.destination}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.destination}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.count}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.total_packages}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.total_weight.toFixed(2)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Clientes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bultos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ordersReport.data.by_customer.map((item: any) => (
                    <tr key={item.customer_rut}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.customer_rut}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.order_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.package_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.total_weight.toFixed(2)} kg</td>
                      <td className="px-4 py-3 text-sm text-gray-600">${item.total_revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Shipments Report */}
      {reportType === 'shipments' && shipmentsReport && !isLoading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Envíos</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{shipmentsReport.data.total_shipments}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Bultos</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{shipmentsReport.data.total_packages}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Peso Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{shipmentsReport.data.total_weight.toFixed(2)} kg</p>
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Estado</h3>
            <div className="space-y-3">
              {shipmentsReport.data.by_status.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Route */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Ruta</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Envíos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bultos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shipmentsReport.data.by_route.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.origin}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.destination}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.shipment_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.package_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Deliveries Report */}
      {reportType === 'deliveries' && deliveriesReport && !isLoading && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Entregas</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{deliveriesReport.data.total_deliveries}</p>
          </div>

          {/* By Type */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Tipo</h3>
            <div className="space-y-3">
              {deliveriesReport.data.by_type.map((item: any) => (
                <div key={item.delivery_type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {item.delivery_type === 'ENTREGA_DOMICILIO' ? 'Entrega a Domicilio' : 'Retiro en Sucursal'}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Destination */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Destino</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entregas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveriesReport.data.by_destination.map((item: any) => (
                    <tr key={item.destination}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.destination}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.delivery_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
