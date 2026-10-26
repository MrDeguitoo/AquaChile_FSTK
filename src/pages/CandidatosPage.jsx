import FormCandidato from '../components/candidatos/FormCandidato';

export default function CandidatosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Candidatos</h1>
      <FormCandidato onAddCandidato={(c) => console.log('Nuevo candidato:', c)} />
    </div>
  );
}