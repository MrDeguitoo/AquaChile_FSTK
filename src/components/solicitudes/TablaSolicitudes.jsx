const ESTADO_CLASES = {
  'Pendiente': 'bg-amber-100 text-amber-800',
  'En Proceso': 'bg-blue-100 text-blue-800',
  'Finalizada': 'bg-emerald-100 text-emerald-800',
  'Completada': 'bg-emerald-100 text-emerald-800',
  'Completado': 'bg-emerald-100 text-emerald-800',
};

export function EstadoBadge({ estado }) {
  const clases = ESTADO_CLASES[estado] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${clases}`}>
      {estado}
    </span>
  );
}

export default function TablaSolicitudes({ solicitudes, candidatos = [] }) {
  const nombreCandidato = (id) =>
    candidatos.find((c) => c.id === id)?.nombre ?? 'Sin asignar';

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
                <td className="p-3.5 text-gray-900">{nombreCandidato(sol.candidatoId)}</td>
                <td className="p-3.5 text-gray-700">{sol.analista}</td>
                <td className="p-3.5 text-gray-600">{sol.ceco}</td>
                <td className="p-3.5 text-gray-600">{sol.ubicacion}</td>
                <td className="p-3.5 text-gray-500">{sol.fecha}</td>
                <td className="p-3.5 text-center">
                  <EstadoBadge estado={sol.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}