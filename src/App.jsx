import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/login';
import PostulacionPage from './pages/PostulacionPage';
import DashboardPage from './pages/DashboardPage';
import CandidatosPage from './pages/CandidatosPage';
import SolicitudesPage from './pages/SolicitudesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/postular" element={<PostulacionPage />} />

          {/* Rutas protegidas dentro del marco con Navbar y Sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/candidatos" element={<CandidatosPage />} />
              <Route path="/solicitudes" element={<SolicitudesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}