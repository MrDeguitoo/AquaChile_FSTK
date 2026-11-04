import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('Componente Sidebar', () => {
  it('debe contener las opciones de navegación Dashboard, Candidatos y Solicitudes', () => {
    render(
      <BrowserRouter>
        <Sidebar mobileOpen={false} closeMobile={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Candidatos')).toBeTruthy();
    expect(screen.getByText('Solicitudes')).toBeTruthy();
  });
});