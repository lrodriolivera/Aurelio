import { useState, useEffect } from 'react';
import { Scale, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function ScaleWeight() {
  const [weight, setWeight] = useState<number>(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/hardware/scale/weight');
        setWeight(res.data.data.weight);
        setConnected(true);
      } catch (error) {
        setConnected(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleTare = async () => {
    try {
      await api.post('/hardware/scale/tare');
    } catch (error) {
      console.error('Error taring scale:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold">Balanza Digital</h3>
        </div>
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-gray-900 tabular-nums">
          {weight.toFixed(2)}
        </div>
        <div className="text-2xl text-gray-600 mt-2">kg</div>
      </div>

      <button
        onClick={handleTare}
        disabled={!connected}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="w-5 h-5" />
        Tarar Balanza
      </button>
    </div>
  );
}
