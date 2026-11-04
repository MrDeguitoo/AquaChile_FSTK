import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthProvider } from '../context/AuthContext';

describe('Componente Sidebar', () => {
  const mockUser = { name: 'Analista Test', email: 'analista@aquachile.cl', role: 'analista' };

  const wrapper = ({ children }) => (
    <AuthProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AuthProvider>
  );

  it('debe contener las opciones de navegación Dashboard, Candidatos y Solicitudes', () => {
    render(
      <Sidebar mobileOpen={false} closeMobile={() => {}} />,
      { wrapper }
    );

    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Candidatos')).toBeTruthy();
    expect(screen.getByText('Solicitudes')).toBeTruthy();
  });

  it('debe mostrar el badge de rol para analista', () => {
    render(
      <Sidebar mobileOpen={false} closeMobile={() => {}} />,
      { wrapper }
    );

    expect(screen.getByText('Analista RRHH')).toBeTruthy();
    expect(screen.getByText('Perfil Actual')).toBeTruthy();
  });

  it('debe mostrar el badge de rol para evaluador', () => {
    const evaluadorUser = { ...mockUser, role: 'evaluador' };

    // Mockear el contexto directamente para testear rol evaluador
    const { AuthContext } = require('../context/AuthContext');
    render(
      <AuthContext.Provider value={{ user: evaluadorUser, login: () => {}, logout: () => {}, loading: false }}>
        <BrowserRouter>
          <Sidebar mobileOpen={false} closeMobile={() => {}} />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Psicólogo Evaluador')).toBeTruthy();
  });
});