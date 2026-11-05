import { useState } from 'react';
import { UserPlus, Paperclip, Loader2, AlertCircle } from 'lucide-react';

// Usar proxy de Vite en desarrollo (/api -> localhost:5000/api)
// En producción, configurar variable de entorno VITE_API_BASE
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// RUT chileno regex (formato: 12.345.678-9 o 12345678-9)
const RUT_REGEX = /^\d{1,2}\.?\d{3}\.?\d{3}[-][0-9kK]{1}$/;
// Email corporativo @aquachile.cl
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@aquachile\.cl$/;
const EXTENSIONES_CV = ['pdf', 'doc', 'docx'];

export default function FormCandidato({ onCandidatoCreated }) {
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [familiaCargo, setFamiliaCargo] = useState('Operaciones');
  const [cvFile, setCvFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!nombre.trim() || !rut.trim() || !email.trim() || !cargo.trim()) {
      setError('Por favor completa todos los campos obligatorios (incluyendo RUT).');
      return;
    }

    if (!RUT_REGEX.test(rut.trim())) {
      setError('Formato de RUT inválido. Use formato: 12.345.678-9');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Debe utilizar un correo corporativo institucional (@aquachile.cl).');
      return;
    }

    if (cvFile) {
      const fileExt = cvFile.name.split('.').pop().toLowerCase();
      if (!EXTENSIONES_CV.includes(fileExt)) {
        setError('Formato de CV no permitido. Sube un archivo .pdf, .doc o .docx');
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      formData.append('rut', rut.trim());
      formData.append('email', email.trim());
      formData.append('cargo', cargo.trim());
      formData.append('familia_cargo', familiaCargo);
      if (cvFile) {
        formData.append('cv', cvFile);
      }

      const res = await fetch(`${API_BASE}/candidatos`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear candidato');
      }

      // Limpiar formulario
      setNombre('');
      setRut('');
      setEmail('');
      setCargo('');
      setCvFile(null);
      setFileInputKey((k) => k + 1);

      // Notificar al padre para actualizar lista
      if (onCandidatoCreated) {
        onCandidatoCreated(data);
      }
    } catch (err) {
      console.error('Error al crear candidato:', err);
      setError(err.message || 'Error al guardar el candidato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
        <UserPlus className="w-5 h-5 text-blue-600" />
        <span>Registrar Nuevo Candidato</span>
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">RUT *</label>
          <input
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="12.345.678-9"
            maxLength={12}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nombre Completo *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. María González"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Correo Corporativo *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="mgonzalez@aquachile.cl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cargo al que Postula *</label>
          <input
            type="text"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. Operador de Planta"
          />
        </div>

        <div>
          <label htmlFor="familia-cargo" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Familia de Cargo</label>
          <select
            id="familia-cargo"
            value={familiaCargo}
            onChange={(e) => setFamiliaCargo(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="Operaciones">Operaciones / Producción</option>
            <option value="Mantenimiento">Mantenimiento & Logística</option>
            <option value="Calidad">Calidad & Medio Ambiente</option>
            <option value="Administración">Administración & RRHH</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cv-file" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Adjuntar Curriculum Vitae (CV) (.pdf, .doc, .docx)
        </label>
        <div className="flex items-center space-x-3">
          <input
            id="cv-file"
            data-testid="cv-file-input"
            key={fileInputKey}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files[0] || null)}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {cvFile && (
            <span className="text-xs text-green-600 font-medium flex items-center space-x-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{cvFile.name}</span>
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          'Guardar Candidato'
        )}
      </button>
    </form>
  );
}