import { useState, useEffect, useCallback } from 'react';
import { FilePlus, Loader2, AlertCircle, UserCheck, Calendar, Mail, Bell } from 'lucide-react';
import CalendarPicker from '../../components/CalendarPicker';
import api from '../../api';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function FormSolicitud({ onSolicitudCreated, candidatos = [], usuarios = [] }) {
  const [candidatoId, setCandidatoId] = useState('');
  const [analistaId, setAnalistaId] = useState('');
  const [cargoPostulado, setCargoPostulado] = useState('');
  const [unidad, setUnidad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Calendar scheduling
  const [scheduleEvaluation, setScheduleEvaluation] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState(null);

  // Email notifications
  const [sendSolicitudEmail, setSendSolicitudEmail] = useState(true);
  const [sendEvaluationEmail, setSendEvaluationEmail] = useState(true);

  // Cargar candidatos y usuarios al montar
  const fetchCandidatos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/candidatos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Error cargando candidatos:', err);
      return [];
    }
  }, []);

  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (candidatos.length === 0) {
      fetchCandidatos();
    }
  }, [fetchCandidatos, candidatos.length]);

  useEffect(() => {
    if (usuarios.length === 0) {
      fetchUsuarios();
    }
  }, [fetchUsuarios, usuarios.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!candidatoId || !analistaId || !cargoPostulado.trim()) {
      setError('Por favor completa todos los campos obligatorios: Candidato, Analista y Cargo.');
      return;
    }

    // Validate calendar if scheduling
    if (scheduleEvaluation && !calendarEvent) {
      setError('Por favor programa la evaluación seleccionando fecha y hora');
      return;
    }

    setLoading(true);

    try {
      const solicitudData = {
        candidato_id: Number(candidatoId),
        analista_id: Number(analistaId),
        usuario_id: Number(analistaId),
        cargo_postulado: cargoPostulado.trim(),
        unidad: unidad.trim() || null,
        ubicacion: ubicacion.trim() || null,
        observaciones: observaciones.trim() || null,
      };

      // Add calendar event ID if scheduled
      if (scheduleEvaluation && calendarEvent) {
        solicitudData.calendar_event_id = calendarEvent.id;
      }

      const res = await fetch(`${API_BASE}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitudData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear solicitud');
      }

      // Create calendar event if scheduled
      if (scheduleEvaluation && calendarEvent) {
        try {
          const selectedCandidato = candidatos.find(c => c.id === Number(candidatoId));
          const selectedAnalista = usuarios.find(u => u.id === Number(analistaId));

          if (selectedCandidato && selectedAnalista) {
            const calendarResult = await api.calendar.createEvaluationEvent(
              data,
              selectedCandidato,
              selectedAnalista,
              selectedAnalista, // evaluador defaults to analista
              calendarEvent.start,
              calendarEvent.duration
            );

            if (calendarResult.success && calendarResult.event) {
              // Update solicitud with calendar event ID
              await fetch(`${API_BASE}/solicitudes/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calendar_event_id: calendarResult.event.id }),
              });

              // Send evaluation scheduled email
              if (sendEvaluationEmail) {
                try {
                  await api.email.sendEvaluationScheduled(
                    data,
                    calendarResult.event,
                    selectedCandidato,
                    selectedAnalista
                  );
                } catch (emailError) {
                  console.warn('Error sending evaluation scheduled email:', emailError);
                }
              }
            }
          }
        } catch (calendarError) {
          console.warn('Solicitud creada, error al programar en calendario:', calendarError);
        }
      }

      // Send solicitud notification email to analista
      if (sendSolicitudEmail) {
        try {
          const selectedCandidato = candidatos.find(c => c.id === Number(candidatoId));
          const selectedAnalista = usuarios.find(u => u.id === Number(analistaId));

          if (selectedCandidato && selectedAnalista) {
            await api.email.sendSolicitudNotification(data, selectedAnalista, selectedCandidato);
          }
        } catch (emailError) {
          console.warn('Solicitud creada, error al enviar notificación:', emailError);
        }
      }

      // Limpiar formulario
      setCandidatoId('');
      setAnalistaId('');
      setCargoPostulado('');
      setUnidad('');
      setUbicacion('');
      setObservaciones('');
      setScheduleEvaluation(false);
      setCalendarEvent(null);

      if (onSolicitudCreated) {
        onSolicitudCreated(data);
      }
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      setError(err.message || 'Error al guardar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Obtener candidatos para el select (desde props o fetch)
  const candidatosDisponibles = candidatos.length > 0
    ? candidatos.map(c => ({ id: c.id, nombre: c.nombre, correo: c.correo || c.email }))
    : [];

  const usuariosDisponibles = usuarios.length > 0
    ? usuarios
    : [];

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
        <FilePlus className="w-5 h-5 text-emerald-600" />
        <span>Crear Nueva Solicitud</span>
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="candidato" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Candidato *</label>
          <select
            id="candidato"
            value={candidatoId}
            onChange={(e) => setCandidatoId(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Seleccionar candidato...</option>
            {candidatosDisponibles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.correo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="analista" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Analista Asignado *</label>
          <select
            id="analista"
            value={analistaId}
            onChange={(e) => setAnalistaId(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Seleccionar analista...</option>
            {usuariosDisponibles
              .filter(u => u.rol === 'analista')
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} ({u.correo})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="cargo-postulado" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cargo Postulado *</label>
          <input
            id="cargo-postulado"
            type="text"
            value={cargoPostulado}
            onChange={(e) => setCargoPostulado(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="Ej. Jefe de Centro de Cultivo"
            required
          />
        </div>

        <div>
          <label htmlFor="unidad" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Unidad / CECO</label>
          <input
            id="unidad"
            type="text"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="Ej. CECO Planta Norte"
          />
        </div>

        <div>
          <label htmlFor="ubicacion" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Ubicación</label>
          <input
            id="ubicacion"
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="Ej. Puerto Montt"
          />
        </div>
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Observaciones</label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          placeholder="Notas adicionales sobre la solicitud..."
        />
      </div>

      {/* Calendar Scheduling */}
      <div className="space-y-4">
        <label className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={scheduleEvaluation}
            onChange={(e) => setScheduleEvaluation(e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-gray-800">Programar evaluación en Google Calendar</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">Crear evento de calendario y enviar invitaciones automáticamente</p>
          </div>
        </label>

        {scheduleEvaluation && (
          <CalendarPicker
            onSchedule={setCalendarEvent}
            disabled={loading}
            initialDuration={90}
          />
        )}
      </div>

      {/* Email Notifications */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-gray-800 flex items-center space-x-2">
          <Mail className="w-4 h-4 text-blue-600" />
          <span>Notificaciones por Email</span>
        </h4>
        <div className="space-y-2 ml-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sendSolicitudEmail}
              onChange={(e) => setSendSolicitudEmail(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              <Bell className="w-3.5 h-3.5 inline mr-1" />
              Notificar al analista asignado sobre la nueva solicitud
            </span>
          </label>
          {scheduleEvaluation && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEvaluationEmail}
                onChange={(e) => setSendEvaluationEmail(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Enviar confirmación de evaluación programada al candidato
              </span>
            </label>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creando solicitud...</span>
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4" />
            <span>Crear Solicitud</span>
          </>
        )}
      </button>
    </form>
  );
}