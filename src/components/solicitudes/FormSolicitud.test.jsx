import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormSolicitud from './FormSolicitud';

const candidatosPrueba = [
  { id: 1, nombre: 'Juan Pérez', correo: 'juan@aquachile.cl' },
  { id: 2, nombre: 'María López', correo: 'maria@aquachile.cl' },
];

const usuariosPrueba = [
  { id: 1, nombre: 'Analista 1', correo: 'analista1@aquachile.cl', rol: 'analista' },
  { id: 2, nombre: 'Evaluador 1', correo: 'evaluador1@aquachile.cl', rol: 'evaluador' },
];

describe('FormSolicitud', () => {
  const mockOnSolicitudCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const fillForm = async ({
    candidatoId = '1',
    analistaId = '1',
    cargoPostulado = 'Jefe de Centro',
    unidad = 'CECO Planta Norte',
    ubicacion = 'Puerto Montt',
    observaciones = 'Observaciones de prueba',
  } = {}) => {
    const user = userEvent.setup();

    // Seleccionar candidato
    const candidatoSelect = screen.getByLabelText(/Candidato \*/i);
    await user.selectOptions(candidatoSelect, candidatoId);

    // Seleccionar analista
    const analistaSelect = screen.getByLabelText(/Analista Asignado \*/i);
    await user.selectOptions(analistaSelect, analistaId);

    // Llenar campos de texto
    await user.type(screen.getByPlaceholderText(/Jefe de Centro de Cultivo/i), cargoPostulado);
    await user.type(screen.getByPlaceholderText(/CECO Planta Norte/i), unidad);
    await user.type(screen.getByPlaceholderText(/Puerto Montt/i), ubicacion);
    await user.type(screen.getByPlaceholderText(/Notas adicionales/i), observaciones);
  };

  it('renderiza todos los campos del formulario correctamente', () => {
    render(
      <FormSolicitud
        onSolicitudCreated={mockOnSolicitudCreated}
        candidatos={candidatosPrueba}
        usuarios={usuariosPrueba}
      />
    );

    expect(screen.getByLabelText(/Candidato \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Analista Asignado \*/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Jefe de Centro de Cultivo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/CECO Planta Norte/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Puerto Montt/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Notas adicionales/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Solicitud/i })).toBeInTheDocument();
  });

  it('muestra solo analistas (rol analista) en el selector', () => {
    render(
      <FormSolicitud
        onSolicitudCreated={mockOnSolicitudCreated}
        candidatos={candidatosPrueba}
        usuarios={usuariosPrueba}
      />
    );

    const analistaSelect = screen.getByLabelText(/Analista Asignado \*/i);
    const options = analistaSelect.querySelectorAll('option');

    // Solo debe haber opción "Seleccionar analista..." + 1 analista
    expect(options).toHaveLength(2);
    expect(options[1].textContent).toContain('Analista 1');
    expect(options[1].textContent).not.toContain('Evaluador 1');
  });

  it('muestra error si faltan campos obligatorios', async () => {
    render(
      <FormSolicitud
        onSolicitudCreated={mockOnSolicitudCreated}
        candidatos={candidatosPrueba}
        usuarios={usuariosPrueba}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Crear Solicitud/i }));

    await waitFor(() => {
      expect(screen.getByText(/campos obligatorios/i)).toBeInTheDocument();
    });
    expect(mockOnSolicitudCreated).not.toHaveBeenCalled();
  });

  it('llama a la API y onSolicitudCreated cuando todo es válido', async () => {
    const mockResponse = {
      id: 1,
      candidato_id: 1,
      analista_id: 1,
      usuario_id: 1,
      cargo_postulado: 'Jefe de Centro',
      unidad: 'CECO Planta Norte',
      ubicacion: 'Puerto Montt',
      observaciones: 'Observaciones de prueba',
      estado: 'Pendiente',
      fecha_solicitud: '2026-09-15',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <FormSolicitud
        onSolicitudCreated={mockOnSolicitudCreated}
        candidatos={candidatosPrueba}
        usuarios={usuariosPrueba}
      />
    );

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /Crear Solicitud/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/solicitudes',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidato_id: 1,
            analista_id: 1,
            usuario_id: 1,
            cargo_postulado: 'Jefe de Centro',
            unidad: 'CECO Planta Norte',
            ubicacion: 'Puerto Montt',
            observaciones: 'Observaciones de prueba',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSolicitudCreated).toHaveBeenCalledWith(mockResponse);
    });
  });

  it('muestra error si la API falla', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error al crear solicitud' }),
    });

    render(
      <FormSolicitud
        onSolicitudCreated={mockOnSolicitudCreated}
        candidatos={candidatosPrueba}
        usuarios={usuariosPrueba}
      />
    );

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /Crear Solicitud/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error al crear solicitud/i)).toBeInTheDocument();
    });
    expect(mockOnSolicitudCreated).not.toHaveBeenCalled();
  });

  it('muestra estado de loading mientras envía', async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    global.fetch.mockReturnValueOnce(fetchPromise);

    render(
      <FormSolicitud
        onSolicitudCreated={mockOnSolicitudCreated}
        candidatos={candidatosPrueba}
        usuarios={usuariosPrueba}
      />
    );

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /Crear Solicitud/i }));

    expect(screen.getByRole('button', { name: /Creando solicitud/i })).toBeDisabled();

    resolveFetch({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Crear Solicitud/i })).not.toBeDisabled();
    });
  });

  it('limpia el formulario después de crear exitosamente', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, estado: 'Pendiente' }),
    });

    render(
      <FormSolicitud
        onSolicitudCreated={mockOnSolicitudCreated}
        candidatos={candidatosPrueba}
        usuarios={usuariosPrueba}
      />
    );

    await fillForm({
      cargoPostulado: 'Test Cargo',
      unidad: 'Test Unidad',
      ubicacion: 'Test Ubicacion',
      observaciones: 'Test Obs',
    });
    await userEvent.click(screen.getByRole('button', { name: /Crear Solicitud/i }));

    await waitFor(() => {
      expect(mockOnSolicitudCreated).toHaveBeenCalled();
    });

    // Verificar que los campos se limpiaron
    expect(screen.getByLabelText(/Candidato \*/i).value).toBe('');
    expect(screen.getByLabelText(/Analista Asignado \*/i).value).toBe('');
    expect(screen.getByPlaceholderText(/Jefe de Centro de Cultivo/i).value).toBe('');
    expect(screen.getByPlaceholderText(/CECO Planta Norte/i).value).toBe('');
    expect(screen.getByPlaceholderText(/Puerto Montt/i).value).toBe('');
    expect(screen.getByPlaceholderText(/Notas adicionales/i).value).toBe('');
  });
});