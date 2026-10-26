import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import CandidatosPage from './pages/CandidatosPage';
import SolicitudesPage from './pages/SolicitudesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path = "/login" element = {<LoginPage/>} />

          <Route element = {<ProtectedRoute/>}>
            <Route element = {<AppLayout/>}>
              <Route path = "/" element = {<DashboardPage/>} />
              <Route path = "/candidatos" element = {<CandidatosPage/>} />
              <Route path = "/solicitudes" element = {<SolicitudesPage/>} />

              <Route path = "*" element = {<NotFoundPage/>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}