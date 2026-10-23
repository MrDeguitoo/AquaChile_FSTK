import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList } from 'lucide-react';

export default function Sidebar({ mobileOpen, closeMobile }) {
  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside
      className={`bg-white border-r border-gray-200 p-4 ${
        mobileOpen ? 'block' : 'hidden'
      } md:block`}
    >
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
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