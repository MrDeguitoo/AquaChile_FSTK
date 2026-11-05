import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TablaSolicitudes, { EstadoBadge, EstadoSelect } from './TablaSolicitudes';

const solicitudesPrueba = [
  {
    id: 1,
    candidato_id: 1,
    analista: 'Dra. Ana Vargas',
    unidad: 'CECO Planta Norte',
    ubicacion: 'Puerto Montt',
    fecha_solicitud: '2026-09-15',
    estado: 'Pendiente',
  },
  {
    id: 2,
    candidato_id: 2,
    analista: 'Dr. Luis Fernández',
    unidad: 'CECO Planta Sur',
    ubicacion: 'Puerto Varas',
    fecha_solicitud: '2026-09-16',
    estado: 'En Proceso',
  },
  {
    id: 3,
    candidato_id: 3,
    analista: 'Dra. Elena Morales',
    unidad: 'CECO Oficina Central',
    ubicacion: 'Santiago',
    fecha_solicitud: '2026-09-17',
    estado: 'Completado',
  },
];

const candidatosPrueba = [
  { id: 1, nombre: 'Juan Pérez', correo: 'juan@aquachile.cl' },
  { id: 2, nombre: 'María López', correo: 'maria@aquachile.cl' },
  { id: 3, nombre: 'Carlos Rodríguez', correo: 'carlos@aquachile.cl' },
];

describe('TablaSolicitudes', () => {
  const mockOnEstadoChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra las solicitudes y el total', () => {
    render(
      <TablaSolicitudes
        solicitudes={solicitudesPrueba}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
    expect(screen.getByText('Total: 3')).toBeInTheDocument();
  });

  it('muestra los datos correctos en cada columna', () => {
    render(
      <TablaSolicitudes
        solicitudes={solicitudesPrueba}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    // Verificar columnas
    expect(screen.getByText('Dra. Ana Vargas')).toBeInTheDocument();
    expect(screen.getByText('CECO Planta Norte')).toBeInTheDocument();
    expect(screen.getByText('Puerto Montt')).toBeInTheDocument();
    expect(screen.getByText('2026-09-15')).toBeInTheDocument();
  });

  it('muestra select de estado para cada solicitud', () => {
    render(
      <TablaSolicitudes
        solicitudes={solicitudesPrueba}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    // Debe haber 3 selects (uno por solicitud)
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3);

    // Verificar valores actuales
    expect(selects[0]).toHaveValue('Pendiente');
    expect(selects[1]).toHaveValue('En Proceso');
    expect(selects[2]).toHaveValue('Completado');
  });

  it('invoca onEstadoChange al cambiar el estado de una solicitud', async () => {
    const user = userEvent.setup();

    render(
      <TablaSolicitudes
        solicitudes={solicitudesPrueba}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'En Proceso');

    expect(mockOnEstadoChange).toHaveBeenCalledTimes(1);
    expect(mockOnEstadoChange).toHaveBeenCalledWith(1, 'En Proceso');
  });

  it('no invoca onEstadoChange y muestra "Guardando..." cuando está en loading', async () => {
    render(
      <TablaSolicitudes
        solicitudes={solicitudesPrueba}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
        loadingEstados={{ 1: true }}
      />
    );

    // Debe mostrar "Guardando..." en lugar del select
    expect(screen.getByText('Guardando...')).toBeInTheDocument();

    // No debe haber select para la solicitud en loading
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2); // Solo 2 selects (solicitudes 2 y 3)

    // onEstadoChange no debe ser llamado
    expect(mockOnEstadoChange).not.toHaveBeenCalled();
  });

  it('muestra "Guardando..." mientras está en loading', () => {
    render(
      <TablaSolicitudes
        solicitudes={solicitudesPrueba}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
        loadingEstados={{ 1: true }}
      />
    );

    expect(screen.getByText('Guardando...')).toBeInTheDocument();
  });

  it('usa campos alternativos (candidatoId, ceco, fecha) si no vienen los de BD', () => {
    const solicitudesLegacy = [
      {
        id: 1,
        candidatoId: 1,
        analista: 'Analista Legacy',
        ceco: 'CECO Legacy',
        ubicacion: 'Ubicacion Legacy',
        fecha: '2026-01-01',
        estado: 'Pendiente',
      },
    ];

    render(
      <TablaSolicitudes
        solicitudes={solicitudesLegacy}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    expect(screen.getByText('Analista Legacy')).toBeInTheDocument();
    expect(screen.getByText('CECO Legacy')).toBeInTheDocument();
    expect(screen.getByText('Ubicacion Legacy')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
  });

  it('muestra "Sin asignar" si el candidato no existe en la lista', () => {
    const solicitudesSinCandidato = [
      {
        id: 1,
        candidato_id: 999,
        analista: 'Analista Test',
        unidad: 'CECO Test',
        ubicacion: 'Ubicacion Test',
        fecha_solicitud: '2026-09-15',
        estado: 'Pendiente',
      },
    ];

    render(
      <TablaSolicitudes
        solicitudes={solicitudesSinCandidato}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    expect(screen.getByText('Sin asignar')).toBeInTheDocument();
  });

  it('muestra un mensaje cuando no hay solicitudes', () => {
    render(
      <TablaSolicitudes
        solicitudes={[]}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    expect(screen.getByText(/No hay solicitudes registradas/i)).toBeInTheDocument();
  });

  it('muestra todos los estados válidos en el select', () => {
    render(
      <TablaSolicitudes
        solicitudes={solicitudesPrueba}
        candidatos={candidatosPrueba}
        onEstadoChange={mockOnEstadoChange}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const options = selects[0].querySelectorAll('option');

    const estadosEsperados = ['Pendiente', 'En Proceso', 'Completado', 'Finalizada', 'Rechazado'];
    expect(options).toHaveLength(estadosEsperados.length);

    estadosEsperados.forEach((estado, index) => {
      expect(options[index].value).toBe(estado);
      expect(options[index].textContent).toBe(estado);
    });
  });
});

describe('EstadoBadge', () => {
  it('renderiza el badge con el estado correcto', () => {
    render(<EstadoBadge estado="Pendiente" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('aplica clases CSS correctas según el estado', () => {
    const { container } = render(<EstadoBadge estado="En Proceso" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  it('usa clases por defecto para estado desconocido', () => {
    const { container } = render(<EstadoBadge estado="Desconocido" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-700');
  });
});

describe('EstadoSelect', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza select con estado actual', () => {
    render(<EstadoSelect estado="Pendiente" onChange={mockOnChange} disabled={false} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('Pendiente');
  });

  it('llama onChange al cambiar el valor', async () => {
    const user = userEvent.setup();
    render(<EstadoSelect estado="Pendiente" onChange={mockOnChange} disabled={false} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'En Proceso');

    expect(mockOnChange).toHaveBeenCalledWith('En Proceso');
  });

  it('está deshabilitado cuando disabled=true', () => {
    render(<EstadoSelect estado="Pendiente" onChange={mockOnChange} disabled={true} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });
});