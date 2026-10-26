import { useState } from 'react';
import { UserPlus, Paperclip } from 'lucide-react';

export default function FormCandidato({ onAddCandidato }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [cargo, setCargo] = useState('');
  const [familiaCargo, setFamiliaCargo] = useState('Operaciones');
  const [cvFile, setCvFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !correo || !cargo) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    const nuevoCandidato = {
      id: Date.now(),
      nombre,
      correo,
      cargo,
      familiaCargo,
      cvAdjunto: cvFile ? cvFile.name : null,
      estado: 'Nuevo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    onAddCandidato(nuevoCandidato);
    setNombre('');
    setCorreo('');
    setCargo('');
    setCvFile(null);
    setFileInputKey((k) => k + 1); // limpia el input de archivo
    setError('');
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

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Correo Electrónico *</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="mgonzalez@ejemplo.com"
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
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Familia de Cargo</label>
          <select
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
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Adjuntar Curriculum Vitae (CV) (.pdf, .doc, .docx)
        </label>
        <div className="flex items-center space-x-3">
          <input
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
        className="w-full md:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition-colors"
      >
        Guardar Candidato
      </button>
    </form>
  );
}