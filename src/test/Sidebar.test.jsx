import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const renderSidebar = (user, props = {}) => {
  return render(
    <AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn(), loading: false }}>
      <BrowserRouter>
        <Sidebar mobileOpen={false} closeMobile={vi.fn()} {...props} />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Sidebar', () => {
  it('contiene las opciones de navegación Dashboard, Candidatos y Solicitudes', () => {
    const user = { name: 'Test', email: 'test@aquachile.cl', role: 'analista' };
    renderSidebar(user);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Candidatos')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes')).toBeInTheDocument();
  });

  it('muestra badge de rol para analista', () => {
    const user = { name: 'Test', email: 'test@aquachile.cl', role: 'analista' };
    renderSidebar(user);

    expect(screen.getByText('Analista RRHH')).toBeInTheDocument();
    expect(screen.getByText('Perfil Actual')).toBeInTheDocument();
    // Verificar que hay un SVG (icono UserCheck)
    expect(screen.getByTestId('role-icon')).toBeInTheDocument();
  });

  it('muestra badge de rol para evaluador', () => {
    const user = { name: 'Test', email: 'test@aquachile.cl', role: 'evaluador' };
    renderSidebar(user);

    expect(screen.getByText('Psicólogo Evaluador')).toBeInTheDocument();
    expect(screen.getByTestId('role-icon')).toBeInTheDocument();
  });

  it('muestra badge genérico para rol desconocido', () => {
    const user = { name: 'Test', email: 'test@aquachile.cl', role: 'admin' };
    renderSidebar(user);

    // El label usa capitalize, así que "admin" -> "Administrador" (según getRoleConfig)
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByTestId('role-icon')).toBeInTheDocument();
  });

  it('renderiza enlaces con NavLink', () => {
    const user = { name: 'Test', email: 'test@aquachile.cl', role: 'analista' };
    renderSidebar(user);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const candidatosLink = screen.getByText('Candidatos').closest('a');
    const solicitudesLink = screen.getByText('Solicitudes').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/');
    expect(candidatosLink).toHaveAttribute('href', '/candidatos');
    expect(solicitudesLink).toHaveAttribute('href', '/solicitudes');
  });

  it('aplica clase mobile cuando mobileOpen es true', () => {
    const user = { name: 'Test', email: 'test@aquachile.cl', role: 'analista' };
    const { container } = renderSidebar(user, { mobileOpen: true });

    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('block');
  });
});