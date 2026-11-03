import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-4">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 max-w-md mb-6">
        La ruta que intentas acceder no existe en el sistema de evaluaciones de AquaChile.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Volver al Dashboard</span>
      </Link>
    </div>
  );
}