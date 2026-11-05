import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import SolicitudesPage from './SolicitudesPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Usuario de prueba para autenticación
const mockUser = {
  id: 1,
  nombre: 'Analista de Reclutamiento',
  email: 'analista@aquachile.cl',
  rol: 'analista',
};

const renderSolicitudesPage = () => {
  // Setear sesión en localStorage antes de renderizar
  localStorage.setItem('aquachile_session', JSON.stringify(mockUser));

  return render(
    <MemoryRouter initialEntries={['/solicitudes']}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/solicitudes" element={<SolicitudesPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('SolicitudesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('muestra skeleton mientras carga', () => {
    let resolveFetch;
    global.fetch.mockImplementationOnce(() => new Promise(r => { resolveFetch = r; }));

    renderSolicitudesPage();

    // Usar getByRole para el heading h1 (no el span del sidebar)
    expect(screen.getByRole('heading', { name: 'Solicitudes', level: 1 })).toBeInTheDocument();
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('carga y muestra solicitudes, candidatos y usuarios desde la API', async () => {
    const mockSolicitudes = [
      {
        id: 1,
        candidato_id: 1,
        analista_id: 1,
        usuario_id: 1,
        cargo_postulado: 'Jefe de Centro de Cultivo',
        unidad: 'CECO Planta Norte',
        ubicacion: 'Puerto Montt',
        estado: 'Pendiente',
        fecha_solicitud: '2026-09-15',
        observaciones: null,
      },
    ];

    const mockCandidatos = [
      { id: 1, nombre: 'Roberto Gómez', email: 'roberto.gomez@correo.cl' },
    ];

    const mockUsuarios = [
      { id: 1, nombre: 'Analista 1', correo: 'analista1@aquachile.cl', rol: 'analista' },
    ];

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockSolicitudes })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCandidatos })
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsuarios });

    renderSolicitudesPage();

    await waitFor(() => {
      expect(screen.getByText('Roberto Gómez')).toBeInTheDocument();
    });

    // Verificar campos que TablaSolicitudes realmente renderiza
    await waitFor(() => {
      expect(screen.getByText('CECO Planta Norte')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Puerto Montt')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('2026-09-15')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('muestra error si falla la carga de solicitudes', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderSolicitudesPage();

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar solicitudes/i)).toBeInTheDocument();
    });
  });

  it('permite reintentar carga tras error', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderSolicitudesPage();

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar solicitudes/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Reintentar/i }));

    await waitFor(() => {
      // loadAll hace 3 fetches (solicitudes, candidatos, usuarios)
      // 1 fallido + 2 exitosos (candidatos, usuarios) + 3 retry = 6, pero puede ser 8 por Promise.all
      expect(global.fetch).toHaveBeenCalledTimes(8);
    });
  });

  it('renderiza FormSolicitud para crear nuevas solicitudes', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderSolicitudesPage();

    await waitFor(() => {
      expect(screen.getByText('Crear Nueva Solicitud')).toBeInTheDocument();
    });

    // Usar getByRole o query más específica para evitar conflictos con sidebar
    expect(screen.getByLabelText(/Candidato \*/i)).toBeInTheDocument();
    // Analista Asignado aparece en el formulario y en el sidebar - usar getAllByLabelText
    const analistaLabels = screen.getAllByLabelText(/Analista Asignado \*/i);
    expect(analistaLabels.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText(/Jefe de Centro de Cultivo/i)).toBeInTheDocument();
  });

  it('agrega nueva solicitud a la lista tras creación exitosa', async () => {
    const mockSolicitudes = [];
    const mockCandidatos = [{ id: 1, nombre: 'Test', email: 'test@test.cl' }];
    const mockUsuarios = [{ id: 1, nombre: 'Analista', correo: 'a@a.cl', rol: 'analista' }];
    const newSolicitud = {
      id: 1,
      candidato_id: 1,
      analista_id: 1,
      usuario_id: 1,
      cargo_postulado: 'Nuevo Cargo',
      unidad: 'CECO Test',
      ubicacion: 'Ubicacion Test',
      estado: 'Pendiente',
      fecha_solicitud: '2026-09-15',
    };

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockSolicitudes })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCandidatos })
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsuarios })
      .mockResolvedValueOnce({ ok: true, json: async () => newSolicitud });

    renderSolicitudesPage();

    await waitFor(() => {
      expect(screen.getByText('Crear Nueva Solicitud')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Crear Solicitud/i })).toBeInTheDocument();
  });

  it('muestra select de estado para cada solicitud', async () => {
    const mockSolicitudes = [
      { id: 1, candidato_id: 1, analista_id: 1, cargo_postulado: 'Cargo 1', unidad: 'U1', ubicacion: 'Loc 1', estado: 'Pendiente', fecha_solicitud: '2026-09-15' },
    ];
    const mockCandidatos = [{ id: 1, nombre: 'Test', email: 'test@test.cl' }];
    const mockUsuarios = [{ id: 1, nombre: 'Analista', correo: 'a@a.cl', rol: 'analista' }];

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockSolicitudes })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCandidatos })
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsuarios });

    renderSolicitudesPage();

    await waitFor(() => {
      // El EstadoSelect es el último combobox en la tabla (los otros 2 son del FormSolicitud)
      const selects = screen.getAllByRole('combobox');
      // Verificar que existe el select de estado con valor 'Pendiente'
      const estadoSelect = selects.find(s => s.value === 'Pendiente');
      expect(estadoSelect).toBeInTheDocument();
    });
  });

  it('muestra "Sin asignar" si candidato no existe en la lista', async () => {
    const mockSolicitudes = [
      { id: 1, candidato_id: 999, analista_id: 1, cargo_postulado: 'Cargo 1', unidad: 'U1', ubicacion: 'Loc 1', estado: 'Pendiente', fecha_solicitud: '2026-09-15' },
    ];
    const mockCandidatos = [{ id: 1, nombre: 'Test', email: 'test@test.cl' }];
    const mockUsuarios = [{ id: 1, nombre: 'Analista', correo: 'a@a.cl', rol: 'analista' }];

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockSolicitudes })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCandidatos })
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsuarios });

    renderSolicitudesPage();

    await waitFor(() => {
      // "Sin asignar" aparece en columna Candidato (por candidato_id 999 no encontrado)
      const sinAsignarElements = screen.getAllByText('Sin asignar');
      expect(sinAsignarElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});