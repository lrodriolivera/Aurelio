import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardCharts() {
  const { data: stats } = useQuery({
    queryKey: ['reports', 'stats'],
    queryFn: async () => {
      const res = await api.get('/reports/stats');
      return res.data.data;
    },
  });

  const ordersData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Órdenes',
        data: [12, 19, 15, 25, 22, 18, 20],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const shipmentsData = {
    labels: ['En Tránsito', 'En Bodega', 'Entregados'],
    datasets: [
      {
        data: [stats?.packages.in_transit || 0, 35, stats?.packages.delivered || 0],
        backgroundColor: [
          'rgba(249, 115, 22, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(34, 197, 94, 0.5)',
        ],
        borderColor: [
          'rgb(249, 115, 22)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos (CLP)',
        data: [4500000, 5200000, 4800000, 6100000, 5900000, 6500000],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Órdenes por Día</h3>
        <Bar data={ordersData} options={{ responsive: true }} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Estado de Envíos</h3>
        <Doughnut data={shipmentsData} options={{ responsive: true }} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Ingresos Mensuales</h3>
        <Line data={revenueData} options={{ responsive: true }} />
      </div>
    </div>
  );
}
