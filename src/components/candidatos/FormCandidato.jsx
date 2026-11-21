import { useState, useEffect } from 'react';
import { UserPlus, Loader2, AlertCircle, Mail } from 'lucide-react';
import DriveFileUpload from '../../components/DriveFileUpload';
import api from '../../api';
import { cleanRUT, formatRUT, isValidRUT } from '../../utils/rut';
import { CARGOS_DISPONIBLES, getFamiliaForCargo, getPrimaryFamiliaForCargo, cargoHasMultipleFamilias } from '../../constants/cargos';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Email corporativo @aquachile.cl
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@aquachile\.cl$/;

export default function FormCandidato({ onCandidatoCreated }) {
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [familiaCargo, setFamiliaCargo] = useState('');

  // Auto-actualizar familia de cargo cuando cambia el cargo
  useEffect(() => {
    if (cargo) {
      const familias = getFamiliaForCargo(cargo);
      if (familias.length > 0) {
        setFamiliaCargo(familias[0]);
      }
    } else {
      setFamiliaCargo('');
    }
  }, [cargo]);
  const [cvFile, setCvFile] = useState(null);
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);
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

    if (!isValidRUT(rut)) {
      setError('RUT inválido. Verifique el número e intente nuevamente.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Debe utilizar un correo corporativo institucional (@aquachile.cl).');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      formData.append('rut', cleanRUT(rut));
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

      // Upload CV to Google Drive if provided
      if (cvFile) {
        try {
          await api.drive.uploadCandidateCV(data.id, cvFile);
        } catch (driveError) {
          console.warn('CV guardado localmente, error al subir a Drive:', driveError);
        }
      }

      // Send confirmation email if enabled
      if (sendConfirmationEmail) {
        try {
          await api.email.sendCandidateConfirmation({
            ...data,
            nombre: nombre.trim(),
            email: email.trim(),
            cargo: cargo.trim(),
            familiaCargo: familiaCargo,
          });
        } catch (emailError) {
          console.warn('Candidato creado, error al enviar email:', emailError);
        }
      }

      // Limpiar formulario
      setNombre('');
      setRut('');
      setEmail('');
      setCargo('');
      setCvFile(null);
      setSendConfirmationEmail(true);

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
            onChange={(e) => {
              const formatted = formatRUT(e.target.value);
              setRut(formatted);
            }}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="12345678-9"
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
          <label htmlFor="cargo" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cargo al que Postula *</label>
          <select
            id="cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione un cargo</option>
            {CARGOS_DISPONIBLES.map((cargoOption) => (
              <option key={cargoOption} value={cargoOption}>
                {cargoOption}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="familia-cargo" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Familia de Cargo
            {!cargo ? ' (seleccione un cargo primero)' : cargoHasMultipleFamilias(cargo) ? ' (seleccione una)' : ' (automática)'}
          </label>
          <select
            id="familia-cargo"
            value={familiaCargo}
            onChange={(e) => setFamiliaCargo(e.target.value)}
            className={`w-full p-2.5 rounded-lg text-sm ${
              !cargo || (!cargoHasMultipleFamilias(cargo) && cargo)
                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            }`}
            disabled={!cargo || !cargoHasMultipleFamilias(cargo)}
          >
            {!cargo ? (
              <option value="">Seleccione un cargo primero</option>
            ) : cargoHasMultipleFamilias(cargo) ? (
              getFamiliaForCargo(cargo).map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))
            ) : (
              getFamiliaForCargo(cargo).map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <DriveFileUpload
        onUpload={async (file) => {
          setCvFile(file);
          // Upload will be handled in handleSubmit
        }}
        onDelete={() => {
          setCvFile(null);
          setDriveFile(null);
        }}
        value={cvFile}
        label="Adjuntar Curriculum Vitae (CV) (.pdf, .doc, .docx)"
        uploadToDrive={false} // We'll upload in handleSubmit after candidate is created
        disabled={loading}
      />

      {/* Email confirmation option */}
      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
        <input
          type="checkbox"
          id="send-confirmation-email"
          checked={sendConfirmationEmail}
          onChange={(e) => setSendConfirmationEmail(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="send-confirmation-email" className="flex-1 cursor-pointer">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-800">Enviar email de confirmación al candidato</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">Se enviará un correo de bienvenida con los detalles de la postulación</p>
        </label>
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