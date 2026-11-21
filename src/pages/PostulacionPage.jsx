import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Loader2, AlertCircle, Mail, User, Building2 } from 'lucide-react';
import DriveFileUpload from '../components/DriveFileUpload';
import api from '../api';
import { cleanRUT, formatRUT, isValidRUT } from '../utils/rut';
import { CARGOS_DISPONIBLES, getFamiliaForCargo, getPrimaryFamiliaForCargo, cargoHasMultipleFamilias } from '../constants/cargos';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Email personal (cualquier formato válido)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function PostulacionPage() {
  const navigate = useNavigate();
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
  const [driveFile, setDriveFile] = useState(null);
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

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
      setError('Por favor ingrese un correo electrónico válido.');
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

      // Mostrar éxito
      setSuccess(true);
      setNombre('');
      setRut('');
      setEmail('');
      setCargo('');
      setCvFile(null);
      setDriveFile(null);
      setSendConfirmationEmail(true);

    } catch (err) {
      console.error('Error al crear candidato:', err);
      setError(err.message || 'Error al guardar la postulación');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate('/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header con botón volver */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </button>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Building2 className="w-10 h-10 text-white" />
            <span className="text-2xl font-bold text-white">AquaChile</span>
          </div>
          <p className="text-center text-blue-200 opacity-80">Plataforma de Evaluación Psicolaboral</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-900 rounded-full px-4 py-2 mb-4">
              <Briefcase className="w-5 h-5" />
              <span className="font-semibold">Postulación a Cargos</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Postula a AquaChile</h1>
            <p className="text-gray-600">Completa tus datos y adjunta tu CV para iniciar el proceso de selección</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start space-x-3 animate-fade-in">
              <div className="w-6 h-6 flex-shrink-0 mt-0.5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">¡Postulación enviada correctamente!</p>
                <p className="text-sm">Hemos recibido tu información. Nuestro equipo de reclutamiento la revisará y te contactará pronto.</p>
                <p className="text-sm mt-2">Si habilitaste el envío de email, recibirás una confirmación en tu correo.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>RUT *</span>
                </label>
                <input
                  type="text"
                  id="rut"
                  value={rut}
                  onChange={(e) => {
                    const formatted = formatRUT(e.target.value);
                    setRut(formatted);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345678-9"
                  maxLength={12}
                  required
                  disabled={success}
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Nombre Completo *</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. María González"
                  required
                  disabled={success}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>Correo Electrónico Personal *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ejemplo@correo.com"
                  required
                  disabled={success}
                />
              </div>

              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>Cargo al que Postula *</span>
                </label>
                <select
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={success}
                >
                  <option value="">Seleccione un cargo</option>
                  {CARGOS_DISPONIBLES.map((cargoOption) => (
                    <option key={cargoOption} value={cargoOption}>
                      {cargoOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="familia-cargo" className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>
                  Familia de Cargo
                  {!cargo ? '(seleccione un cargo primero)' : cargoHasMultipleFamilias(cargo) ? '(seleccione una)' : '(automática)'}
                </span>
              </label>
              <select
                id="familia-cargo"
                value={familiaCargo}
                onChange={(e) => setFamiliaCargo(e.target.value)}
                className={`w-full p-3 rounded-lg text-sm ${
                  !cargo || (!cargoHasMultipleFamilias(cargo) && cargo)
                    ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                disabled={success || !cargo || !cargoHasMultipleFamilias(cargo)}
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

            <DriveFileUpload
              onUpload={async (file) => {
                setCvFile(file);
                setDriveFile(file);
              }}
              onDelete={() => {
                setCvFile(null);
                setDriveFile(null);
              }}
              value={driveFile}
              label="Adjuntar Curriculum Vitae (CV) (.pdf, .doc, .docx)"
              uploadToDrive={false}
              disabled={loading || success}
            />

            {/* Email confirmation option */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="send-confirmation-email"
                checked={sendConfirmationEmail}
                onChange={(e) => setSendConfirmationEmail(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                disabled={success}
              />
              <label htmlFor="send-confirmation-email" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Enviar email de confirmación</span>
                </div>
                <p className="text-xs text-gray-500 ml-7 mt-1">Se enviará un correo de bienvenida con los detalles de la postulación</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3.5 rounded-lg text-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando postulación...</span>
                </>
              ) : success ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Postulación Enviada</span>
                </>
              ) : (
                <>
                  <span>Enviar Postulación</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center space-x-1"
            >
              <span>¿Ya trabajas en AquaChile?</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}