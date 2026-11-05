import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import NotFoundPage from './NotFoundPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Usuario de prueba para autenticación
const mockUser = {
  id: 1,
  nombre: 'Analista de Reclutamiento',
  email: 'analista@aquachile.cl',
  rol: 'analista',
};

const renderNotFoundPage = () => {
  // Setear sesión en localStorage antes de renderizar
  localStorage.setItem('aquachile_session', JSON.stringify(mockUser));

  return render(
    <MemoryRouter initialEntries={['/ruta-inexistente']}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza mensaje de página no encontrada', () => {
    renderNotFoundPage();

    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByText(/La ruta que intentas acceder no existe/i)).toBeInTheDocument();
  });

  it('muestra icono de alerta (contenedor amber)', () => {
    renderNotFoundPage();

    // Verificar el contenedor amber que envuelve el icono
    const alertContainer = document.querySelector('.bg-amber-50');
    expect(alertContainer).toBeInTheDocument();
  });

  it('tiene enlace para volver al Dashboard', () => {
    renderNotFoundPage();

    // El Link de react-router-dom se renderiza como <a>
    const link = screen.getByRole('link', { name: /Volver al Dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('tiene estilos de centrado y contenedor principal', () => {
    renderNotFoundPage();

    const container = screen.getByText('Página no encontrada').closest('div');
    expect(container).toHaveClass('min-h-[60vh]');
  });
});