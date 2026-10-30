import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import FormCandidato from './FormCandidato';

function llenarFormulario({ nombre = 'Juan Pérez', correo = 'juan@aquachile.cl', cargo = 'Analista' } = {}) {
  fireEvent.change(screen.getByPlaceholderText(/María González/i), { target: { value: nombre } });
  fireEvent.change(screen.getByPlaceholderText(/mgonzalez@ejemplo.com/i), { target: { value: correo } });
  fireEvent.change(screen.getByPlaceholderText(/Operador de Planta/i), { target: { value: cargo } });
}

describe('Componente FormCandidato', () => {
  afterEach(() => cleanup());

  it('debería renderizar los campos del formulario correctamente', () => {
    render(<FormCandidato onAddCandidato={() => {}} />);
    expect(screen.getByPlaceholderText(/María González/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/mgonzalez@ejemplo.com/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Operador de Planta/i)).toBeTruthy();
  });

  it('debería mostrar error si faltan campos obligatorios', () => {
    const onAdd = jasmine.createSpy('onAddCandidato');
    render(<FormCandidato onAddCandidato={onAdd} />);

    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    expect(screen.getByText(/campos obligatorios/i)).toBeTruthy();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('debería mostrar mensaje de error si el formato del correo es inválido', () => {
    const onAdd = jasmine.createSpy('onAddCandidato');
    render(<FormCandidato onAddCandidato={onAdd} />);

    llenarFormulario({ correo: 'correo-invalido' });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    expect(screen.getByText(/formato válido/i)).toBeTruthy();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('debería rechazar un CV con extensión no permitida', () => {
    const onAdd = jasmine.createSpy('onAddCandidato');
    const { container } = render(<FormCandidato onAddCandidato={onAdd} />);

    llenarFormulario();
    const inputArchivo = container.querySelector('input[type="file"]');
    const archivo = new File(['contenido'], 'cv.txt', { type: 'text/plain' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    expect(screen.getByText(/Formato de CV no permitido/i)).toBeTruthy();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('debería llamar a onAddCandidato con los datos correctos cuando todo es válido', () => {
    const onAdd = jasmine.createSpy('onAddCandidato');
    const { container } = render(<FormCandidato onAddCandidato={onAdd} />);

    llenarFormulario();
    const inputArchivo = container.querySelector('input[type="file"]');
    const archivo = new File(['contenido'], 'juan_cv.pdf', { type: 'application/pdf' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nombre: 'Juan Pérez',
        correo: 'juan@aquachile.cl',
        cargo: 'Analista',
        cvAdjunto: 'juan_cv.pdf',
        estado: 'Nuevo',
      })
    );
  });
});