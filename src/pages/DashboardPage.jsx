import { useState, useEffect, useCallback } from 'react';
import { Users, Clock, AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between animate-pulse">
      <div>
        <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el dashboard</h3>
      <p className="text-red-600 text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reintentar</span>
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCandidatos: 0,
    pendientes: 0,
    enProceso: 0,
    completadas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error al cargar métricas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Evaluaciones</h1>
          <p className="text-gray-600 text-sm">Resumen general del proceso psicolaboral de AquaChile.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Evaluaciones</h1>
          <p className="text-gray-600 text-sm">Resumen general del proceso psicolaboral de AquaChile.</p>
        </div>
        <DashboardError message={error} onRetry={fetchStats} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de Evaluaciones</h1>
        <p className="text-gray-600 text-sm">Resumen general del proceso psicolaboral de AquaChile.</p>
      </div>

      {/* Grid de Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Candidatos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCandidatos}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendientes</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendientes}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En Proceso</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.enProceso}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completadas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completadas}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}