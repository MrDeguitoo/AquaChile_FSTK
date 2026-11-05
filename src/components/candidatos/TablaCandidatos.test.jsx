import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TablaCandidatos from './TablaCandidatos';

const candidatosPrueba = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    correo: 'juan@aquachile.cl',
    cargo: 'Operario de Planta',
    familiaCargo: 'Operaciones',
    cvAdjunto: 'juan_cv.pdf',
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez',
    correo: 'carlos@aquachile.cl',
    cargo: 'Analista de Calidad',
    familiaCargo: 'Calidad',
    cvAdjunto: null,
  },
];

describe('TablaCandidatos', () => {
  const mockOnSelectCandidate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra a los candidatos y el total', () => {
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={null}
        onSelectCandidate={mockOnSelectCandidate}
      />
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
    expect(screen.getByText('Total: 2')).toBeInTheDocument();
  });

  it('invoca onSelectCandidate con el id al hacer clic en Seleccionar para Entrevista', async () => {
    const user = userEvent.setup();
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={null}
        onSelectCandidate={mockOnSelectCandidate}
      />
    );

    await user.click(screen.getByLabelText(/Seleccionar para Entrevista a Juan Pérez/i));

    expect(mockOnSelectCandidate).toHaveBeenCalledTimes(1);
    expect(mockOnSelectCandidate).toHaveBeenCalledWith(1);
  });

  it('marca como Seleccionado solo al candidato elegido', () => {
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={2}
        onSelectCandidate={mockOnSelectCandidate}
      />
    );

    expect(screen.getAllByText('Seleccionado')).toHaveLength(1);
    expect(screen.getAllByText('Seleccionar')).toHaveLength(1);
  });

  it('indica si el candidato tiene CV adjunto o no', () => {
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={null}
        onSelectCandidate={mockOnSelectCandidate}
      />
    );

    // El primero tiene CV (icono Check con title)
    expect(screen.getByTitle('juan_cv.pdf')).toBeInTheDocument();
    // El segundo no tiene CV (guion)
    expect(screen.getAllByText('—')).toHaveLength(1);
  });

  it('muestra un mensaje cuando no hay candidatos', () => {
    render(
      <TablaCandidatos
        candidatos={[]}
        selectedCandidateId={null}
        onSelectCandidate={mockOnSelectCandidate}
      />
    );

    expect(screen.getByText(/No hay candidatos registrados/i)).toBeInTheDocument();
  });

  it('aplica clase de seleccionado visualmente al candidato activo', () => {
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={1}
        onSelectCandidate={mockOnSelectCandidate}
      />
    );

    const row = screen.getByText('Juan Pérez').closest('tr');
    expect(row).toHaveClass('bg-blue-50/80');
  });
});