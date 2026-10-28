import { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCandidatos: 0,
    pendientes: 0,
    enProceso: 0,
    completadas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar estadísticas desde la API
  useEffect(() => {
    fetch(`${API_BASE}/dashboard/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar métricas:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

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