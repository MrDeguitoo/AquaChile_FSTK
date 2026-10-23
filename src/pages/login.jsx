import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('analista');
  const [email, setEmail] = useState('analista@aquachile.cl');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      email,
      role,
      name: role === 'analista' ? 'Analista de Reclutamiento' : 'Psicólogo Evaluador',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">AquaChile</h1>
          <p className="text-sm text-gray-500">Evaluaciones Psicolaborales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Acceso</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setEmail(e.target.value === 'analista' ? 'analista@aquachile.cl' : 'psicologo@aquachile.cl');
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

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Ingresar al Sistema</span>
          </button>
        </form>
      </div>
    </div>
  );
}