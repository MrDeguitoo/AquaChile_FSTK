import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const mockUser = { name: 'Analista Test', email: 'analista@aquachile.cl', role: 'analista' };
const mockLogout = vi.fn();

const renderNavbar = (user = mockUser, logout = mockLogout) => {
  return render(
    <AuthContext.Provider value={{ user, logout, login: vi.fn(), loading: false }}>
      <Navbar />
    </AuthContext.Provider>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título de la empresa AquaChile', () => {
    renderNavbar();

    expect(screen.getByText('AquaChile')).toBeInTheDocument();
    expect(screen.getByText('Evaluaciones Psicolaborales')).toBeInTheDocument();
  });

  it('muestra el nombre y email del usuario', () => {
    renderNavbar();

    expect(screen.getByText('Analista Test')).toBeInTheDocument();
    expect(screen.getByText('analista@aquachile.cl')).toBeInTheDocument();
  });

  it('llama a logout al hacer clic en el botón de cerrar sesión', () => {
    renderNavbar();

    const logoutButton = screen.getByTitle('Cerrar Sesión');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('muestra botón de cerrar sesión con icono', () => {
    renderNavbar();

    const logoutButton = screen.getByTitle('Cerrar Sesión');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton.querySelector('svg')).toBeInTheDocument();
  });

  it('maneja usuario sin email', () => {
    const userWithoutEmail = { ...mockUser, email: undefined };
    renderNavbar(userWithoutEmail);

    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });
});