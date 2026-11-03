import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ClipboardList, Shield, UserCheck } from 'lucide-react';

export default function Sidebar({ mobileOpen, closeMobile }) {
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside className={`bg-white border-r border-gray-200 p-4 ${mobileOpen ? 'block' : 'hidden'} md:block`}>
      {/* Badge de Rol */}
      <div className="mb-5 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center space-x-2.5">
        {user?.role === 'analista' ? (
          <UserCheck className="w-5 h-5 text-blue-700 flex-shrink-0" />
        ) : (
          <Shield className="w-5 h-5 text-emerald-700 flex-shrink-0" />
        )}
        <div className="overflow-hidden">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Perfil Actual</p>
          <p className="text-xs font-semibold text-gray-800 truncate capitalize">
            {user?.role === 'analista' ? 'Analista RRHH' : 'Psicólogo Evaluador'}
          </p>
        </div>
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
        Navegación Principal
      </p>

      <nav className="space-y-1">
        <NavLink to="/" onClick={closeMobile} className={linkClass}>
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/candidatos" onClick={closeMobile} className={linkClass}>
          <Users className="w-4 h-4" />
          <span>Candidatos</span>
        </NavLink>

        <NavLink to="/solicitudes" onClick={closeMobile} className={linkClass}>
          <ClipboardList className="w-4 h-4" />
          <span>Solicitudes</span>
        </NavLink>
      </nav>
    </aside>
  );
}