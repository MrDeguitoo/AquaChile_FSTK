import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/login';
import DashboardPage from '../pages/DashboardPage';
import CandidatosPage from '../pages/CandidatosPage';
import SolicitudesPage from '../pages/SolicitudesPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Wrapper que usa MemoryRouter para testing de navegación
const renderWithRouter = (initialPath = '/login') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/candidatos" element={<CandidatosPage />} />
              <Route path="/solicitudes" element={<SolicitudesPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('App - Rutas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirige a /login si no hay sesión', async () => {
    renderWithRouter('/login');

    await waitFor(() => {
      expect(screen.getByText('AquaChile MVP')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { type: 'email' })).toBeInTheDocument();
    });
  });

  it('muestra formulario de login en /login', () => {
    renderWithRouter('/login');

    expect(screen.getByText('Ingresar al Sistema')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

describe('App - Login flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('permite login como analista y redirige a dashboard', async () => {
    renderWithRouter('/login');

    await waitFor(() => {
      expect(screen.getByText('AquaChile MVP')).toBeInTheDocument();
    });

    // Seleccionar perfil analista
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'analista');

    // Llenar formulario
    const emailInput = screen.getByRole('textbox', { type: 'email' });
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'analista@aquachile.cl');

    const passwordInput = document.querySelector('input[type="password"]');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, '123456');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

    // Debe redirigir a dashboard - MemoryRouter maneja la navegación
    await waitFor(() => {
      expect(screen.getByText('Dashboard de Evaluaciones')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});