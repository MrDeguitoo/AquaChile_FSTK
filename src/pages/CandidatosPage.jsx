import { useEffect, useState } from 'react';
import FormCandidato from '../components/candidatos/FormCandidato';
import TablaCandidatos from '../components/candidatos/TablaCandidatos';
import { getCandidatos, crearCandidato } from '../services/api';

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState([]);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCandidatos()
      .then(setCandidatos)
      .catch(() =>
        setError('No se pudo cargar la lista de candidatos. Verifica que la API esté corriendo.')
      )
      .finally(() => setLoading(false));
  }, []);

  const handleAddCandidato = async (nuevo) => {
    try {
      const creado = await crearCandidato(nuevo);
      setCandidatos((prev) => [creado, ...prev]);
      setError('');
    } catch (err) {
      setError(`No se pudo guardar el candidato. ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Candidatos</h1>

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      <FormCandidato onAddCandidato={handleAddCandidato} />

      {loading ? (
        <p className="text-sm text-gray-500">Cargando candidatos...</p>
      ) : (
        <TablaCandidatos
          candidatos={candidatos}
          selectedCandidateId={selectedCandidateForInterview}
          onSelectCandidate={setSelectedCandidateForInterview}
        />
      )}
    </div>
  );
}