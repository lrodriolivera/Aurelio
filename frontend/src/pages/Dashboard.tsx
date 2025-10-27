import { useQuery } from '@tanstack/react-query';
import { Package, Truck, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { authStore } from '../store/authStore';
import DashboardCharts from '../components/DashboardCharts';

export default function Dashboard() {
  const user = authStore((state) => state.user);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.first_name} {user?.last_name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Órdenes Hoy"
          value="12"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="En Tránsito"
          value="45"
          icon={Truck}
          color="green"
        />
        <StatCard
          title="Pendientes"
          value="8"
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Valor Embarcado"
          value="$24.5M"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Dashboard Charts */}
      <div className="mb-8">
        <DashboardCharts />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Órdenes Recientes
        </h2>
        <div className="text-gray-600 text-center py-8">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p>No hay órdenes recientes</p>
          <p className="text-sm mt-1">Comienza creando una nueva orden de recepción</p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
