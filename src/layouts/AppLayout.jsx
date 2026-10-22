import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <Sidebar />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}