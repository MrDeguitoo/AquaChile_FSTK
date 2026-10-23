import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="md:hidden bg-white border-b px-4 py-2 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Menú de Navegación</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <Sidebar mobileOpen={mobileMenuOpen} closeMobile={() => setMobileMenuOpen(false)} />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}