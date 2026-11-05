import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import FormSolicitud from '../components/solicitudes/FormSolicitud';
import TablaSolicitudes from '../components/solicitudes/TablaSolicitudes';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Completado', 'Finalizada', 'Rechazado'];

function TablaSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-100">
        <div className="h-5 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="p-4">
        <div className="h-10 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar solicitudes</h3>
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

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingEstados, setLoadingEstados] = useState({});

  const fetchSolicitudes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/solicitudes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      // Mapear campos de BD a formato esperado por TablaSolicitudes
      const mapped = data.map(s => ({
        ...s,
        analista: s.analista || 'Sin asignar',
        ceco: s.unidad || 'Sin CECO',
        ubicacion: s.ubicacion || 'Sin ubicación',
        fecha: s.fecha_solicitud || 'Sin fecha',
        estado: s.estado || 'Pendiente',
      }));
      setSolicitudes(mapped);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      throw err;
    }
  }, []);

  const fetchCandidatos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/candidatos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mapped = data.map(c => ({
        ...c,
        nombre: c.nombre,
        correo: c.email,
      }));
      setCandidatos(mapped);
    } catch (err) {
      console.error('Error al cargar candidatos:', err);
    }
  }, []);

  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchSolicitudes(), fetchCandidatos(), fetchUsuarios()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchSolicitudes, fetchCandidatos, fetchUsuarios]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSolicitudCreated = useCallback((nueva) => {
    setSolicitudes(prev => [{
      ...nueva,
      analista: usuarios.find(u => u.id === nueva.analista_id)?.nombre || 'Sin asignar',
      ceco: nueva.unidad || 'Sin CECO',
      ubicacion: nueva.ubicacion || 'Sin ubicación',
      fecha: nueva.fecha_solicitud || new Date().toISOString().split('T')[0],
      estado: nueva.estado || 'Pendiente',
    }, ...prev]);
  }, [usuarios]);

  const handleEstadoChange = useCallback(async (solId, nuevoEstado) => {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) return;

    setLoadingEstados(prev => ({ ...prev, [solId]: true }));

    try {
      const res = await fetch(`${API_BASE}/solicitudes/${solId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar estado');
      }

      const updated = await res.json();
      setSolicitudes(prev =>
        prev.map(s =>
          s.id === solId ? { ...s, estado: updated.estado } : s
        )
      );
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert(`Error: ${err.message}`);
      // Revertir en la UI - recargar para asegurar consistencia
      await fetchSolicitudes();
    } finally {
      setLoadingEstados(prev => ({ ...prev, [solId]: false }));
    }
  }, [fetchSolicitudes]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Solicitudes</h1>
        <TablaSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Solicitudes</h1>
        <ErrorMessage message={error} onRetry={loadAll} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Solicitudes</h1>
        <p className="text-gray-600">
          Panel de solicitudes del proceso psicolaboral de AquaChile.
        </p>
      </div>
      <FormSolicitud
        onSolicitudCreated={handleSolicitudCreated}
        candidatos={candidatos}
        usuarios={usuarios}
      />
      <TablaSolicitudes
        solicitudes={solicitudes}
        candidatos={candidatos}
        onEstadoChange={handleEstadoChange}
        loadingEstados={loadingEstados}
      />
    </div>
  );
}