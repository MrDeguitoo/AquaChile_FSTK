import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import CandidatosPage from './pages/CandidatosPage';
import SolicitudesPage from './pages/SolicitudesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/candidatos" element={<CandidatosPage />} />
              <Route path="/solicitudes" element={<SolicitudesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<h2 className="p-6 text-red-600 font-bold">404 - Página no encontrada</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}