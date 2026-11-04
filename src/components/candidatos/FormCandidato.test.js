import { render, fireEvent, screen, cleanup, waitFor } from '@testing-library/react';
import FormCandidato from './FormCandidato';

// Mock fetch global
global.fetch = jest.fn();

function llenarFormulario({ nombre = 'Juan Pérez', rut = '12.345.678-9', email = 'juan@aquachile.cl', cargo = 'Analista' } = {}) {
  fireEvent.change(screen.getByPlaceholderText(/12\.345\.678-9/i), { target: { value: rut } });
  fireEvent.change(screen.getByPlaceholderText(/María González/i), { target: { value: nombre } });
  fireEvent.change(screen.getByPlaceholderText(/mgonzalez@aquachile\.cl/i), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/Operador de Planta/i), { target: { value: cargo } });
}

describe('Componente FormCandidato', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('debería renderizar los campos del formulario correctamente', () => {
    render(<FormCandidato onCandidatoCreated={() => {}} />);
    expect(screen.getByPlaceholderText(/12\.345\.678-9/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/María González/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/mgonzalez@aquachile\.cl/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Operador de Planta/i)).toBeTruthy();
  });

  it('debería mostrar error si faltan campos obligatorios', async () => {
    const onAdd = jest.fn();
    render(<FormCandidato onCandidatoCreated={onAdd} />);

    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    await waitFor(() => {
      expect(screen.getByText(/campos obligatorios/i)).toBeTruthy();
    });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('debería mostrar mensaje de error si el formato del RUT es inválido', async () => {
    const onAdd = jest.fn();
    render(<FormCandidato onCandidatoCreated={onAdd} />);

    llenarFormulario({ rut: 'rut-invalido' });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    await waitFor(() => {
      expect(screen.getByText(/Formato de RUT inválido/i)).toBeTruthy();
    });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('debería mostrar mensaje de error si el correo no es @aquachile.cl', async () => {
    const onAdd = jest.fn();
    render(<FormCandidato onCandidatoCreated={onAdd} />);

    llenarFormulario({ email: 'correo@gmail.com' });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    await waitFor(() => {
      expect(screen.getByText(/correo corporativo institucional/i)).toBeTruthy();
    });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('debería rechazar un CV con extensión no permitida', async () => {
    const onAdd = jest.fn();
    const { container } = render(<FormCandidato onCandidatoCreated={onAdd} />);

    llenarFormulario();
    const inputArchivo = container.querySelector('input[type="file"]');
    const archivo = new File(['contenido'], 'cv.txt', { type: 'text/plain' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    await waitFor(() => {
      expect(screen.getByText(/Formato de CV no permitido/i)).toBeTruthy();
    });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('debería llamar a la API y onCandidatoCreated con los datos correctos cuando todo es válido', async () => {
    const onAdd = jest.fn();
    const mockResponse = {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@aquachile.cl',
      rut: '12.345.678-9',
      cargo: 'Analista',
      familia_cargo: 'Operaciones',
      cv_url: 'juan_cv.pdf',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { container } = render(<FormCandidato onCandidatoCreated={onAdd} />);

    llenarFormulario();
    const inputArchivo = container.querySelector('input[type="file"]');
    const archivo = new File(['contenido'], 'juan_cv.pdf', { type: 'application/pdf' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Verificar que se llamó a onCandidatoCreated con la respuesta de la API
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(mockResponse);
    });
  });

  it('debería mostrar error si la API falla', async () => {
    const onAdd = jest.fn();
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'El RUT ya está registrado' }),
    });

    const { container } = render(<FormCandidato onCandidatoCreated={onAdd} />);

    llenarFormulario();
    const inputArchivo = container.querySelector('input[type="file"]');
    const archivo = new File(['contenido'], 'juan_cv.pdf', { type: 'application/pdf' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });
    fireEvent.click(screen.getByText(/Guardar Candidato/i));

    await waitFor(() => {
      expect(screen.getByText(/El RUT ya está registrado/i)).toBeTruthy();
    });
    expect(onAdd).not.toHaveBeenCalled();
  });
});