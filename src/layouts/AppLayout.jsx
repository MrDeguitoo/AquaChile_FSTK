import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Navbar provisional */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-xl tracking-wide">AquaChile</span>
          <span className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded-md">MVP Psicolaboral</span>
        </div>
        <div className="text-sm">
          <span className="text-blue-200">Rol: </span>
          <span className="font-semibold">Analista de Reclutamiento</span>
        </div>
      </header>

      {/* Cuerpo principal: Sidebar + Contenido (<Outlet />) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar provisional */}
        <aside className="bg-white border-r border-gray-200 p-4 hidden md:block">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Navegación</p>
          <nav className="space-y-1 text-sm font-medium text-gray-700">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg cursor-pointer">
              Dashboard
            </div>
            <div className="p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              Candidatos
            </div>
            <div className="p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              Solicitudes
            </div>
          </nav>
        </aside>

        {/* Zona de contenido dinámico donde React Router renderiza las páginas */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}