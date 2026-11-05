import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  it('provee login, logout, user y loading en el contexto', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
  });

  it('guarda la sesión del usuario al hacer login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Esperar a que la inicialización termine
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login({ name: 'Analista', role: 'analista', email: 'analista@aquachile.cl' });
    });

    expect(result.current.user.name).toBe('Analista');
    expect(result.current.user.role).toBe('analista');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'aquachile_session',
      JSON.stringify({ name: 'Analista', role: 'analista', email: 'analista@aquachile.cl' })
    );
  });

  it('limpia la sesión al hacer logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login({ name: 'Analista', role: 'analista' });
    });

    expect(result.current.user).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('aquachile_session');
  });

  it('restaura la sesión desde localStorage al montar', async () => {
    const savedUser = { name: 'Usuario Guardado', role: 'evaluador', email: 'eval@aquachile.cl' };
    localStorage.getItem.mockReturnValue(JSON.stringify(savedUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(savedUser);
  });

  it('maneja localStorage corrupto limpiándolo', async () => {
    localStorage.getItem.mockReturnValue('invalid-json{');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('aquachile_session');
    consoleSpy.mockRestore();
  });

  it('inicializa user como null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // El user debería ser null (o el valor restaurado de localStorage)
    // En este test sin localStorage mockeado, será null después de la inicialización
    expect(result.current.user).toBeNull();
  });
});