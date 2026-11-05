import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormCandidato from './FormCandidato';

describe('FormCandidato', () => {
  const mockOnCandidatoCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const fillForm = async ({
    nombre = 'Juan Pérez',
    rut = '12.345.678-9',
    email = 'juan@aquachile.cl',
    cargo = 'Analista',
    familiaCargo = 'Operaciones',
    cvFile = null,
  } = {}) => {
    await userEvent.type(screen.getByPlaceholderText(/12\.345\.678-9/i), rut);
    await userEvent.type(screen.getByPlaceholderText(/María González/i), nombre);
    await userEvent.type(screen.getByPlaceholderText(/mgonzalez@aquachile\.cl/i), email);
    await userEvent.type(screen.getByPlaceholderText(/Operador de Planta/i), cargo);
    // El select no tiene role combobox ni name, usar el texto del label para encontrarlo
    const select = screen.getByLabelText(/Familia de Cargo/i);
    await userEvent.selectOptions(select, familiaCargo);

    if (cvFile) {
      // El input file no tiene label asociado, buscar por accept attribute
      const fileInput = screen.getByTestId('cv-file-input');
      await userEvent.upload(fileInput, cvFile);
    }
  };

  it('renderiza todos los campos del formulario correctamente', () => {
    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    expect(screen.getByPlaceholderText(/12\.345\.678-9/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/María González/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mgonzalez@aquachile\.cl/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Operador de Planta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Familia de Cargo/i)).toBeInTheDocument();
    expect(screen.getByTestId('cv-file-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Candidato/i })).toBeInTheDocument();
  });

  it('muestra error si faltan campos obligatorios', async () => {
    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(screen.getByText(/campos obligatorios/i)).toBeInTheDocument();
    });
    expect(mockOnCandidatoCreated).not.toHaveBeenCalled();
  });

  it('muestra error si el formato de RUT es inválido', async () => {
    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm({ rut: 'rut-invalido' });
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(screen.getByText(/Formato de RUT inválido/i)).toBeInTheDocument();
    });
    expect(mockOnCandidatoCreated).not.toHaveBeenCalled();
  });

  it('muestra error si el correo no es @aquachile.cl', async () => {
    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm({ email: 'correo@gmail.com' });
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(screen.getByText(/correo corporativo institucional/i)).toBeInTheDocument();
    });
    expect(mockOnCandidatoCreated).not.toHaveBeenCalled();
  });

  it('rechaza un CV con extensión no permitida', async () => {
    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm();
    const invalidFile = new File(['contenido'], 'cv.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('cv-file-input');
    // userEvent.upload no dispara onChange correctamente en jsdom para file inputs
    // Crear un FileList simulado usando Object.defineProperty
    const fileList = {
      0: invalidFile,
      length: 1,
      item: (index) => fileList[index],
    };
    fireEvent.change(fileInput, { target: { files: fileList } });
    // Pequeña espera para que el estado se actualice
    await waitFor(() => expect(fileInput.files).toHaveLength(1));
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(screen.getByText(/Formato de CV no permitido/i)).toBeInTheDocument();
    });
    expect(mockOnCandidatoCreated).not.toHaveBeenCalled();
  });

  it('llama a la API y onCandidatoCreated cuando todo es válido', async () => {
    const mockResponse = {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@aquachile.cl',
      rut: '12.345.678-9',
      cargo: 'Analista',
      familia_cargo: 'Operaciones',
      cv_url: 'cv-123.pdf',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm({
      cvFile: new File(['contenido'], 'cv.pdf', { type: 'application/pdf' }),
    });
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/candidatos',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    await waitFor(() => {
      expect(mockOnCandidatoCreated).toHaveBeenCalledWith(mockResponse);
    });
  });

  it('muestra error si la API falla', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'El RUT ya está registrado' }),
    });

    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm({
      cvFile: new File(['contenido'], 'cv.pdf', { type: 'application/pdf' }),
    });
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(screen.getByText(/El RUT ya está registrado/i)).toBeInTheDocument();
    });
    expect(mockOnCandidatoCreated).not.toHaveBeenCalled();
  });

  it('muestra estado de loading mientras envía', async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    global.fetch.mockReturnValueOnce(fetchPromise);

    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm({
      cvFile: new File(['contenido'], 'cv.pdf', { type: 'application/pdf' }),
    });
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    expect(screen.getByRole('button', { name: /Guardando/i })).toBeDisabled();

    resolveFetch({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar Candidato/i })).not.toBeDisabled();
    });
  });
});