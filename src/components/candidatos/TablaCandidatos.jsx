import { Check, UserCheck } from 'lucide-react';

export default function TablaCandidatos({ candidatos, selectedCandidateId, onSelectCandidate }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Listado de Candidatos Registrados</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
          Total: {candidatos.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b">
              <th className="p-3.5">Nombre</th>
              <th className="p-3.5">Correo</th>
              <th className="p-3.5">Cargo</th>
              <th className="p-3.5">Familia</th>
              <th className="p-3.5 text-center">CV</th>
              <th className="p-3.5 text-center">Entrevista</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {candidatos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No hay candidatos registrados.
                </td>
              </tr>
            )}
            {candidatos.map((cand) => {
              const isSelected = selectedCandidateId === cand.id;
              return (
                <tr
                  key={cand.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-3.5 text-gray-900">{cand.nombre}</td>
                  <td className="p-3.5 text-gray-600">{cand.correo}</td>
                  <td className="p-3.5 text-gray-800">{cand.cargo}</td>
                  <td className="p-3.5 text-gray-500">{cand.familiaCargo}</td>
                  <td className="p-3.5 text-center">
                    {cand.cvAdjunto ? (
                      <span className="inline-flex items-center text-green-600" title={cand.cvAdjunto}>
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectCandidate(cand.id)}
                      aria-label={`Seleccionar para Entrevista a ${cand.nombre}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 mx-auto ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Seleccionado' : 'Seleccionar'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}