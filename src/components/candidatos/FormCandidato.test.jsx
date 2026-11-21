// Mock import.meta.env before importing the component using vi.hoisted
const { mockImportMeta } = vi.hoisted(() => {
  return {
    mockImportMeta: {
      meta: {
        env: {
          VITE_API_BASE: '/api',
        },
      },
    },
  };
});

vi.stubGlobal('import', mockImportMeta);

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
    rut = '12345678-5',
    email = 'juan@aquachile.cl',
    cargo = 'Operador de Planta',
    familiaCargo = 'Operaciones / Producción',
    cvFile = null,
  } = {}) => {
    await userEvent.type(screen.getByPlaceholderText(/12345678-9/i), rut);
    await userEvent.type(screen.getByPlaceholderText(/María González/i), nombre);
    await userEvent.type(screen.getByPlaceholderText(/mgonzalez@aquachile\.cl/i), email);
    // Cargo ahora es un select
    const cargoSelect = screen.getByLabelText(/Cargo al que Postula/i);
    await userEvent.selectOptions(cargoSelect, cargo);
    // Familia de Cargo ahora es automática (se actualiza sola al cambiar el cargo)
    // Solo seleccionar manualmente si el cargo tiene múltiples familias (no es el caso de Operador de Planta)
    if (cargo === 'Analista de Logística' || cargo === 'Ingeniero de Procesos' || cargo === 'Enfermero/a Ocupacional' || cargo === 'Prevencionista de Riesgos') {
      const select = screen.getByLabelText(/Familia de Cargo/i);
      await userEvent.selectOptions(select, familiaCargo);
    }

    if (cvFile) {
      // El input file está dentro del componente DriveFileUpload, buscar por tipo
      const fileInput = screen.getByLabelText(/Adjuntar Curriculum Vitae/i).closest('div').querySelector('input[type="file"]');
      if (fileInput) {
        const fileList = {
          0: cvFile,
          length: 1,
          item: (index) => fileList[index],
        };
        fireEvent.change(fileInput, { target: { files: fileList } });
        await waitFor(() => expect(fileInput.files).toHaveLength(1));
      }
    }
  };

  it('renderiza todos los campos del formulario correctamente', () => {
    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    expect(screen.getByPlaceholderText(/12345678-9/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/María González/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mgonzalez@aquachile\.cl/i)).toBeInTheDocument();
    // Cargo ahora es un select
    expect(screen.getByLabelText(/Cargo al que Postula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Familia de Cargo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adjuntar Curriculum Vitae/i)).toBeInTheDocument();
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

    // 12345678-9 tiene dígito verificador incorrecto (debe ser 5)
    await fillForm({ rut: '12345678-9' });
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(screen.getByText(/RUT inválido/i)).toBeInTheDocument();
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
    const fileInput = screen.getByLabelText(/Adjuntar Curriculum Vitae/i).closest('div').querySelector('input[type="file"]');
    const fileList = {
      0: invalidFile,
      length: 1,
      item: (index) => fileList[index],
    };
    fireEvent.change(fileInput, { target: { files: fileList } });
    await waitFor(() => expect(fileInput.files).toHaveLength(1));
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(screen.getByText(/Formato no permitido/i)).toBeInTheDocument();
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

    // Mock 3 calls: create candidate, upload to Drive, send email
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockResponse }) // create candidate
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }) // upload to Drive
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }); // send email

    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm(); // No cvFile to simplify
    await userEvent.click(screen.getByRole('button', { name: /Guardar Candidato/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // candidate + email (no drive upload without cvFile)
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

    await fillForm(); // No cvFile
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
    // Mock 2 calls: 1. create candidate, 2. send email (no drive upload without cvFile)
    global.fetch
      .mockReturnValueOnce(fetchPromise) // create candidate
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }); // send email

    render(<FormCandidato onCandidatoCreated={mockOnCandidatoCreated} />);

    await fillForm(); // No cvFile
    const submitButton = screen.getByRole('button', { name: /Guardar Candidato/i });
    await userEvent.click(submitButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    resolveFetch({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar Candidato/i })).not.toBeDisabled();
    });
  });
});