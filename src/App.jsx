import { useState } from 'react';
import { candidatos, solicitudes } from './data';
import './App.css';

function App() {
  const [candidatesList, setCandidatesList] = useState(candidatos);

  const [candidateFormState, setCandidateFormState] = useState({
    nombre: '',
    correo: '',
    cargo: '',
    familiaCargo: '',
    cvFile: null,
    cvFileName: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCandidateFormState(prev => ({
      ...prev,
      cvFile: file,
      cvFileName: file ? file.name : ''
    }));
  };

  const handleCandidateSubmit = (e) => {
    e.preventDefault();
    if (!candidateFormState.nombre || !candidateFormState.correo || !candidateFormState.cargo || !candidateFormState.familiaCargo) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const newCandidate = {
      id: Date.now(),
      nombre: candidateFormState.nombre,
      correo: candidateFormState.correo,
      cargo: candidateFormState.cargo,
      familiaCargo: candidateFormState.familiaCargo,
      cv: candidateFormState.cvFile ? candidateFormState.cvFile.name : ''
    };
    setCandidatesList(prev => [...prev, newCandidate]);
    setCandidateFormState({
      nombre: '',
      correo: '',
      cargo: '',
      familiaCargo: '',
      cvFile: null,
      cvFileName: ''
    });
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };


  return (
    <>
      <header className="app-header">
        <h1>Sistema de Evaluación Psicolaboral - AquaChile</h1>
        <p>Gestión de candidatos y solicitudes de evaluación</p>
      </header>

      <main className="app-main">

        <section className="candidate-registration">
          <h2>Registro de Nuevo Candidato</h2>
          <form onSubmit={handleCandidateSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo:</label>
              <input
                type="text"
                id="nombre"
                value={candidateFormState.nombre}
                onChange={(e) => setCandidateFormState(prev => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="correo">Correo electrónico:</label>
              <input
                type="email"
                id="correo"
                value={candidateFormState.correo}
                onChange={(e) => setCandidateFormState(prev => ({ ...prev, correo: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cargo">Cargo al que postula:</label>
              <input
                type="text"
                id="cargo"
                value={candidateFormState.cargo}
                onChange={(e) => setCandidateFormState(prev => ({ ...prev, cargo: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="familiaCargo">Familia del cargo:</label>
              <input
                type="text"
                id="familiaCargo"
                value={candidateFormState.familiaCargo}
                onChange={(e) => setCandidateFormState(prev => ({ ...prev, familiaCargo: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cv">Adjuntar Currículum Vitae (CV):</label>
              <input
                type="file"
                id="cv"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {candidateFormState.cvFileName && (
                <span className="cv-file-name">Archivo seleccionado: {candidateFormState.cvFileName}</span>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Registrar Postulante
              </button>
              <button
                type="button"
                onClick={() => setCandidateFormState({
                  nombre: '',
                  correo: '',
                  cargo: '',
                  familiaCargo: '',
                  cvFile: null,
                  cvFileName: ''
                })}
                className="reset-btn"
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Lista de Candidatos Registrados</h3>
              {candidatesList.length === 0 ? (
                <p className="text-gray-500">No hay candidatos registrados.</p>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Correo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cargo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Familia de Cargo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CV Adjunto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {candidatesList.map(candidato => (
                        <tr key={candidato.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{candidato.nombre}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{candidato.correo}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{candidato.cargo}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{candidato.familiaCargo}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">
                            {candidato.cv ? (
                              <span className="cv-indicator">✓</span>
                            ) : (
                              <span className="cv-indicator">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Lista de Solicitudes de Evaluación</h3>
              {solicitudes.length === 0 ? (
                <p className="text-gray-500">No hay solicitudes de evaluación.</p>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidato</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Analista</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CECO</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ubicación</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {solicitudes.map(solicitud => {
                        const candidato = candidatesList.find(c => c.id === solicitud.candidatoId);
                        return (
                          <tr key={solicitud.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{candidato ? candidato.nombre : 'Desconocido'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{solicitud.analista}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{solicitud.ceco}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{solicitud.ubicacion}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">{solicitud.fecha}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-xs">
                              <span className={`status-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                                {solicitud.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2026 AquaChile - Sistema de Evaluación Psicolaboral</p>
      </footer>
    </>
  );
}

export default App;