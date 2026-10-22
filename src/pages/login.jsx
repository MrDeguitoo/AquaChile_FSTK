import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Shield, Lock } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('Analista');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('userRole', role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AquaChile MVP</h1>
          <p className="text-sm text-gray-500 mt-1">Plataforma de Evaluación Psicolaboral</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona Perfil / Rol</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Analista')}
                className={`flex flex-col items-center p-3 rounded-xl border text-sm font-medium transition-all ${
                  role === 'Analista'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <UserCheck className="w-5 h-5 mb-1" />
                <span>Analista</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('Evaluador')}
                className={`flex flex-col items-center p-3 rounded-xl border text-sm font-medium transition-all ${
                  role === 'Evaluador'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5 mb-1" />
                <span>Evaluador</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              defaultValue={role === 'Analista' ? 'analista@aquachile.cl' : 'evaluador@aquachile.cl'}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              defaultValue="123456"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Ingresar al Sistema</span>
          </button>
        </form>
      </div>
    </div>
  );
}