import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { authStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderReception from './pages/OrderReception';
import OrderDetail from './pages/OrderDetail';
import Shipments from './pages/Shipments';
import ShipmentDetail from './pages/ShipmentDetail';
import Tracking from './pages/Tracking';
import Deliveries from './pages/Deliveries';
import Reports from './pages/Reports';
import Users from './pages/Users';
import FreightRates from './pages/FreightRates';
import Insurance from './pages/Insurance';
import Warehouse from './pages/Warehouse';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/new" element={<OrderReception />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="shipments/:id" element={<ShipmentDetail />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="users" element={<Users />} />
            <Route path="freight-rates" element={<FreightRates />} />
            <Route path="insurance" element={<Insurance />} />
            <Route path="warehouse" element={<Warehouse />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
