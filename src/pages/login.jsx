import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('analista');
  const [email, setEmail] = useState('analista@aquachile.cl');
  const [password, setPassword] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (!email.includes('@aquachile.cl')) {
        throw new Error('Debe utilizar un correo corporativo institucional (@aquachile.cl)');
      }

      login({
        email,
        role,
        name: role === 'analista' ? 'Analista de Reclutamiento' : 'Psicólogo Evaluador',
      });

      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AquaChile MVP</h1>
          <p className="text-sm text-gray-500 mt-1">Plataforma de Evaluación Psicolaboral</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Acceso</label>
            <select
              value={role}
              onChange={(e) => {
                const newRole = e.target.value;
                setRole(newRole);
                setEmail(newRole === 'analista' ? 'analista@aquachile.cl' : 'psicologo@aquachile.cl');
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="analista">Analista de Reclutamiento</option>
              <option value="evaluador">Profesional Evaluador (Psicólogo/a)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}