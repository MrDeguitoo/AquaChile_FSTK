import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

describe('Componente Navbar', () => {
  it('debe renderizar el título de la empresa AquaChile', () => {
    const mockUser = { name: 'Analista Test', email: 'analista@aquachile.cl' };

    render(
      <AuthContext.Provider value={{ user: mockUser, logout: () => {} }}>
        <Navbar />
      </AuthContext.Provider>
    );

    expect(screen.getByText('AquaChile')).toBeTruthy();
    expect(screen.getByText('Analista Test')).toBeTruthy();
  });
});