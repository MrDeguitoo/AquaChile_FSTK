import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

describe('Contexto AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe guardar la sesión del usuario al hacer login', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({ name: 'Analista', role: 'analista' });
    });

    expect(result.current.user.name).toBe('Analista');
    expect(localStorage.getItem('aquachile_session')).toContain('Analista');
  });
});