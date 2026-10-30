import { render, fireEvent, screen, cleanup } from '@testing-library/react';
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

describe('Componente TablaCandidatos', () => {
  afterEach(() => cleanup());

  it('debería mostrar a los candidatos y el total', () => {
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={null}
        onSelectCandidate={() => {}}
      />
    );

    expect(screen.getByText('Juan Pérez')).toBeTruthy();
    expect(screen.getByText('Carlos Rodríguez')).toBeTruthy();
    expect(screen.getByText('Total: 2')).toBeTruthy();
  });

  it('debería invocar onSelectCandidate con el id al hacer clic en Seleccionar para Entrevista', () => {
    const onSelect = jasmine.createSpy('onSelectCandidate');
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={null}
        onSelectCandidate={onSelect}
      />
    );

    fireEvent.click(screen.getByLabelText(/Seleccionar para Entrevista a Juan Pérez/i));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('debería marcar como Seleccionado solo al candidato elegido', () => {
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={2}
        onSelectCandidate={() => {}}
      />
    );

    expect(screen.getAllByText('Seleccionado').length).toBe(1);
    expect(screen.getAllByText('Seleccionar').length).toBe(1);
  });

  it('debería indicar si el candidato tiene CV adjunto o no', () => {
    render(
      <TablaCandidatos
        candidatos={candidatosPrueba}
        selectedCandidateId={null}
        onSelectCandidate={() => {}}
      />
    );

    expect(screen.getByTitle('juan_cv.pdf')).toBeTruthy();
    expect(screen.getAllByText('—').length).toBe(1);
  });

  it('debería mostrar un mensaje cuando no hay candidatos', () => {
    render(
      <TablaCandidatos
        candidatos={[]}
        selectedCandidateId={null}
        onSelectCandidate={() => {}}
      />
    );

    expect(screen.getByText(/No hay candidatos registrados/i)).toBeTruthy();
  });
});