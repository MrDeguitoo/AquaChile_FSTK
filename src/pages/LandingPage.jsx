import { useNavigate } from 'react-router-dom';
import { Briefcase, UserCheck, ArrowRight, Building2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const goToPostulacion = () => navigate('/postular');
  const goToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-10 h-10 text-white" />
            <span className="text-2xl font-bold text-white">AquaChile</span>
          </div>
          <div className="text-sm text-blue-100 opacity-80">
            Plataforma de Evaluación Psicolaboral
          </div>
        </div>
      </header>

      {/* Main Split Section */}
      <main className="flex-1 flex">
        {/* Left Side: ¿Trabajas? - Postular a cargos */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
              <Briefcase className="w-6 h-6 text-blue-300" />
              <span className="text-xl font-semibold text-white">¿Trabajas?</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Quieres trabajar en AquaChile?
            </h2>
            <p className="text-blue-100 text-lg mb-8 opacity-90">
              Postula a las vacantes disponibles y forma parte de nuestro equipo.
              Completa tu información y adjunta tu CV para iniciar el proceso de selección.
            </p>
            <button
              onClick={goToPostulacion}
              className="w-full bg-white text-blue-900 hover:bg-blue-50 text-lg font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Postular a un Cargo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-6 text-blue-200 text-sm opacity-70">
              Para candidatos externos e internos que buscan nuevas oportunidades
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-full bg-white/20" />

        {/* Right Side: Trabajas - Login empleados */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
              <UserCheck className="w-6 h-6 text-green-300" />
              <span className="text-xl font-semibold text-white">Trabajas</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Ya eres parte de AquaChile?
            </h2>
            <p className="text-blue-100 text-lg mb-8 opacity-90">
              Accede al sistema de evaluación psicolaboral con tus credenciales corporativas.
              Panel de control, gestión de candidatos y solicitudes de evaluación.
            </p>
            <button
              onClick={goToLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-6 text-blue-200 text-sm opacity-70">
              Para Analistas de Reclutamiento y Profesionales Evaluadores
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-blue-200 text-sm opacity-60">
          © 2025 AquaChile. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}