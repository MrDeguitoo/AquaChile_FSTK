import { useState, useCallback, useMemo } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

// Default minimum date - computed once at module load
const DEFAULT_MIN_DATE = new Date();

/**
 * Calendar Picker Component for scheduling evaluations
 * Allows selecting date, time, duration, and timezone
 */
export default function CalendarPicker({
  onSchedule,
  disabled = false,
  initialDate,
  initialDuration = 90,
  minDate,
  className = '',
}) {
  const effectiveMinDate = useMemo(() => minDate || DEFAULT_MIN_DATE, [minDate]);
  const [date, setDate] = useState(initialDate || '');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(initialDuration);
  const [timezone, setTimezone] = useState('America/Santiago');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !time) {
      setError('Por favor selecciona fecha y hora');
      return;
    }

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

    // Validate minimum date
    if (startDateTime < new Date()) {
      setError('La fecha no puede ser anterior a hoy');
      return;
    }

    setLoading(true);

    try {
      if (onSchedule) {
        await onSchedule({
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          duration,
          timezone,
        });
      }
    } catch (err) {
      setError(err.message || 'Error al programar la evaluación');
    } finally {
      setLoading(false);
    }
  }, [date, time, duration, timezone, onSchedule]);

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-emerald-600" />
        <span>Programar Evaluación</span>
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eval-date" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Fecha *</label>
          <input
            id="eval-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={effectiveMinDate.toISOString().split('T')[0]}
            disabled={disabled}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            required
          />
          {date && (
            <p className="text-xs text-gray-500 mt-1">{formatDate(date)}</p>
          )}
        </div>

        <div>
          <label htmlFor="eval-time" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Hora *</label>
          <input
            id="eval-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={disabled}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            required
          />
          <p className="text-xs text-gray-500 mt-1">{formatTime(time)}</p>
        </div>

        <div>
          <label htmlFor="eval-duration" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Duración (minutos)</label>
          <select
            id="eval-duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            disabled={disabled}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          >
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>60 minutos (1 hora)</option>
            <option value={90}>90 minutos (1.5 horas)</option>
            <option value={120}>120 minutos (2 horas)</option>
            <option value={180}>180 minutos (3 horas)</option>
          </select>
        </div>

        <div>
          <label htmlFor="eval-timezone" className="block text-xs font-semibold text-gray-600 uppercase mb-1">Zona Horaria</label>
          <select
            id="eval-timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={disabled}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          >
            <option value="America/Santiago">Chile Continental (UTC-3/UTC-4)</option>
            <option value="Pacific/Easter">Isla de Pascua (UTC-5/UTC-6)</option>
            <option value="America/Punta_Arenas">Magallanes (UTC-3)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800 mb-2">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Resumen de la programación</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <div>
            <span className="font-medium">Inicio:</span> {date ? `${formatDate(date)} a las ${formatTime(time)}` : 'Por definir'}
          </div>
          <div>
            <span className="font-medium">Fin estimado:</span> {date ? formatTime(new Date(new Date(`${date}T${time}`).getTime() + duration * 60 * 1000).toTimeString().slice(0, 5)) : 'Por definir'}
          </div>
          <div>
            <span className="font-medium">Duración:</span> {duration} minutos
          </div>
          <div>
            <span className="font-medium">Zona horaria:</span> {timezone}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || loading || !date || !time}
        className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Programando...</span>
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4" />
            <span>Programar Evaluación</span>
          </>
        )}
      </button>
    </form>
  );
}