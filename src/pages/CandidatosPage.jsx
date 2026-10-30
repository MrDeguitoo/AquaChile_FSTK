import { useState } from 'react';
import FormCandidato from '../components/candidatos/FormCandidato';
import TablaCandidatos from '../components/candidatos/TablaCandidatos';
import { candidatos as candidatosIniciales } from '../data';

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState(candidatosIniciales);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null);

  const handleAddCandidato = (nuevo) => {
    setCandidatos((prev) => [...prev, nuevo]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Candidatos</h1>
      <FormCandidato onAddCandidato={handleAddCandidato} />
      <TablaCandidatos
        candidatos={candidatos}
        selectedCandidateId={selectedCandidateForInterview}
        onSelectCandidate={setSelectedCandidateForInterview}
      />
    </div>
  );
}