import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/dashboard';
import CandidatosPage from './pages/CandidatosPage';
import SolicitudesPage from './pages/SolicitudesPage';
import LoginPage from './pages/login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/candidatos" element={<CandidatosPage />} />
          <Route path="/solicitudes" element={<SolicitudesPage />} />
          <Route path="*" element={<h2 className="text-xl font-bold p-4 text-red-600">404 - Página no encontrada</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}