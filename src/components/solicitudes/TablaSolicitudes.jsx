const ESTADO_CLASES = {
  'Pendiente': 'bg-amber-100 text-amber-800',
  'En Proceso': 'bg-blue-100 text-blue-800',
  'Finalizada': 'bg-emerald-100 text-emerald-800',
  'Completado': 'bg-emerald-100 text-emerald-800',
  'Rechazado': 'bg-red-100 text-red-800',
};

const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Completado', 'Finalizada', 'Rechazado'];

export function EstadoBadge({ estado }) {
  const clases = ESTADO_CLASES[estado] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${clases}`}>
      {estado}
    </span>
  );
}

export function EstadoSelect({ estado, onChange, disabled }) {
  return (
    <select
      value={estado}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full p-1.5 text-xs border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {ESTADOS_VALIDOS.map((e) => (
        <option key={e} value={e}>{e}</option>
      ))}
    </select>
  );
}

export default function TablaSolicitudes({ solicitudes, candidatos = [], onEstadoChange, loadingEstados = {} }) {
  const nombreCandidato = (id) =>
    candidatos.find((c) => c.id === id)?.nombre ?? 'Sin asignar';

  const handleEstadoChange = (solId, nuevoEstado) => {
    if (onEstadoChange) {
      onEstadoChange(solId, nuevoEstado);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Listado de Solicitudes</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
          Total: {solicitudes.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b">
              <th className="p-3.5">Candidato</th>
              <th className="p-3.5">Analista</th>
              <th className="p-3.5">CECO</th>
              <th className="p-3.5">Ubicación</th>
              <th className="p-3.5">Fecha</th>
              <th className="p-3.5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {solicitudes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No hay solicitudes registradas.
                </td>
              </tr>
            )}
            {solicitudes.map((sol) => (
              <tr key={sol.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3.5 text-gray-900">{nombreCandidato(sol.candidato_id ?? sol.candidatoId)}</td>
                <td className="p-3.5 text-gray-700">{sol.analista}</td>
                <td className="p-3.5 text-gray-600">{sol.unidad ?? sol.ceco}</td>
                <td className="p-3.5 text-gray-600">{sol.ubicacion}</td>
                <td className="p-3.5 text-gray-500">{sol.fecha_solicitud ?? sol.fecha}</td>
                <td className="p-3.5 text-center w-36">
                  {loadingEstados[sol.id] ? (
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 animate-pulse">
                      Guardando...
                    </span>
                  ) : (
                    <EstadoSelect
                      estado={sol.estado}
                      onChange={(nuevoEstado) => handleEstadoChange(sol.id, nuevoEstado)}
                      disabled={loadingEstados[sol.id]}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}