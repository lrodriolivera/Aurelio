import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Truck } from 'lucide-react';
import authService from '../services/auth.service';
import { authStore } from '../store/authStore';
import { LoginCredentials } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authStore.getState().setAuth(data.user, data.token, data.refreshToken);
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary-100 p-4 rounded-full mb-4">
              <Truck className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema de Transporte
            </h1>
            <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="usuario@ejemplo.com"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Credenciales de prueba:</p>
            <p className="font-mono text-xs mt-1">admin@transport.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
