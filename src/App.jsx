import { useState } from 'react';
import { candidatos, solicitudes } from './data';
import './App.css';

function App() {
  // State for the list of candidates
  const [candidatesList, setCandidatesList] = useState(candidatos);

  // Form state for new candidate registration
  const [candidateFormState, setCandidateFormState] = useState({
    nombre: '',
    correo: '',
    cargo: '',
    familiaCargo: '',
    cvFile: null, // File object
    cvFileName: '' // For display
  });

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCandidateFormState(prev => ({
      ...prev,
      cvFile: file,
      cvFileName: file ? file.name : ''
    }));
  };

  // Handle candidate form submission
  const handleCandidateSubmit = (e) => {
    e.preventDefault();
    // Basic validation: required fields
    if (!candidateFormState.nombre || !candidateFormState.correo || !candidateFormState.cargo || !candidateFormState.familiaCargo) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    // Create new candidate object
    const newCandidate = {
      id: Date.now(), // Simple ID generation (not for production)
      nombre: candidateFormState.nombre,
      correo: candidateFormState.correo,
      cargo: candidateFormState.cargo,
      familiaCargo: candidateFormState.familiaCargo,
      cv: candidateFormState.cvFile ? candidateFormState.cvFile.name : ''
    };
    // Add to the list
    setCandidatesList(prev => [...prev, newCandidate]);
    // Reset form
    setCandidateFormState({
      nombre: '',
      correo: '',
      cargo: '',
      familiaCargo: '',
      cvFile: null,
      cvFileName: ''
    });
    // Reset file input value (needed to allow same file selection again)
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };


  return (
    <>
      {/* Header / Title */}
      <header className="app-header">
        <h1>Sistema de Evaluación Psicolaboral - AquaChile</h1>
        <p>Gestión de candidatos y solicitudes de evaluación</p>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Candidate Registration Form */}
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

        {/* Dashboard Section */}
        <section className="dashboard">
          <h2>Dashboard</h2>
          <div className="dashboard-grid">
            {/* Candidates List */}
            <div className="dashboard-panel">
              <h3>Lista de Candidatos Registrados</h3>
              {candidatesList.length === 0 ? (
                <p>No hay candidatos registrados.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Cargo</th>
                      <th>Familia de Cargo</th>
                      <th>CV Adjunto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidatesList.map(candidato => (
                      <tr key={candidato.id}>
                        <td>{candidato.nombre}</td>
                        <td>{candidato.correo}</td>
                        <td>{candidato.cargo}</td>
                        <td>{candidato.familiaCargo}</td>
                        <td>
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
              )}
            </div>

            {/* Requests List */}
            <div className="dashboard-panel">
              <h3>Lista de Solicitudes de Evaluación</h3>
              {solicitudes.length === 0 ? (
                <p>No hay solicitudes de evaluación.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Candidato</th>
                      <th>Analista</th>
                      <th>CECO</th>
                      <th>Ubicación</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map(solicitud => {
                      const candidato = candidatesList.find(c => c.id === solicitud.candidatoId);
                      return (
                        <tr key={solicitud.id}>
                          <td>{candidato ? candidato.nombre : 'Desconocido'}</td>
                          <td>{solicitud.analista}</td>
                          <td>{solicitud.ceco}</td>
                          <td>{solicitud.ubicacion}</td>
                          <td>{solicitud.fecha}</td>
                          <td>
                            <span className={`status-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                              {solicitud.estado}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer (optional) */}
      <footer className="app-footer">
        <p>© 2026 AquaChile - Sistema de Evaluación Psicolaboral</p>
      </footer>
    </>
  );
}

export default App;