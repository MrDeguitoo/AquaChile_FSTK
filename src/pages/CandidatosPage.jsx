import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import FormCandidato from '../components/candidatos/FormCandidato';
import TablaCandidatos from '../components/candidatos/TablaCandidatos';

const API_BASE = 'http://localhost:5000/api';

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
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar candidatos</h3>
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

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState([]);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/candidatos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      // Mapear campos de BD a formato esperado por TablaCandidatos
      const mapped = data.map(c => ({
        ...c,
        nombre: c.nombre,
        correo: c.email,
        cargo: c.cargo,
        familiaCargo: c.familia_cargo,
        cvAdjunto: c.cv_url,
        estado: c.estado || 'Nuevo',
      }));
      setCandidatos(mapped);
    } catch (err) {
      console.error('Error al cargar candidatos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidatos();
  }, [fetchCandidatos]);

  const handleCandidatoCreated = useCallback((nuevo) => {
    setCandidatos(prev => [nuevo, ...prev]);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Candidatos</h1>
        <TablaSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Candidatos</h1>
        <ErrorMessage message={error} onRetry={fetchCandidatos} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Candidatos</h1>
      <FormCandidato onCandidatoCreated={handleCandidatoCreated} />
      <TablaCandidatos
        candidatos={candidatos}
        selectedCandidateId={selectedCandidateForInterview}
        onSelectCandidate={setSelectedCandidateForInterview}
      />
    </div>
  );
}