import { useState } from 'react';
import TablaSolicitudes from '../components/solicitudes/TablaSolicitudes';
import { solicitudes as solicitudesIniciales, candidatos } from '../data';

export default function SolicitudesPage() {
  const [solicitudes] = useState(solicitudesIniciales);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Solicitudes</h1>
        <p className="text-gray-600">
          Panel de solicitudes del proceso psicolaboral de AquaChile.
        </p>
      </div>
      <TablaSolicitudes solicitudes={solicitudes} candidatos={candidatos} />
    </div>
  );
}