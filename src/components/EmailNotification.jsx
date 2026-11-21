import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Email Notification Preferences Component
 * Allows configuring which emails to send for different events
 */
export default function EmailNotification({
  onSendEmail,
  defaultOptions = {},
  className = '',
}) {
  const [options, setOptions] = useState({
    sendCandidateConfirmation: true,
    sendSolicitudNotification: true,
    sendStatusUpdate: true,
    sendEvaluationScheduled: true,
    ...defaultOptions,
  });
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState({});

  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendEmails = async (emailData) => {
    setSending(true);
    setResults({});

    const emailPromises = [];

    if (options.sendCandidateConfirmation && emailData.candidate) {
      emailPromises.push(
        onSendEmail('candidateConfirmation', emailData.candidate)
          .then(result => ({ type: 'candidateConfirmation', success: true, data: result }))
          .catch(error => ({ type: 'candidateConfirmation', success: false, error: error.message }))
      );
    }

    if (options.sendSolicitudNotification && emailData.solicitud && emailData.analista && emailData.candidato) {
      emailPromises.push(
        onSendEmail('solicitudNotification', emailData.solicitud, emailData.analista, emailData.candidato)
          .then(result => ({ type: 'solicitudNotification', success: true, data: result }))
          .catch(error => ({ type: 'solicitudNotification', success: false, error: error.message }))
      );
    }

    if (options.sendStatusUpdate && emailData.solicitud && emailData.oldStatus && emailData.newStatus && emailData.candidato && emailData.analista) {
      emailPromises.push(
        onSendEmail('statusUpdate', emailData.solicitud, emailData.oldStatus, emailData.newStatus, emailData.candidato, emailData.analista)
          .then(result => ({ type: 'statusUpdate', success: true, data: result }))
          .catch(error => ({ type: 'statusUpdate', success: false, error: error.message }))
      );
    }

    if (options.sendEvaluationScheduled && emailData.solicitud && emailData.eventDetails && emailData.candidato && emailData.analista) {
      emailPromises.push(
        onSendEmail('evaluationScheduled', emailData.solicitud, emailData.eventDetails, emailData.candidato, emailData.analista)
          .then(result => ({ type: 'evaluationScheduled', success: true, data: result }))
          .catch(error => ({ type: 'evaluationScheduled', success: false, error: error.message }))
      );
    }

    try {
      const results = await Promise.allSettled(emailPromises);
      const formattedResults = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          formattedResults[result.value.type] = result.value;
        } else {
          formattedResults[`error_${index}`] = { success: false, error: result.reason?.message || 'Error desconocido' };
        }
      });
      setResults(formattedResults);
    } finally {
      setSending(false);
    }
  };

  const notificationTypes = [
    {
      key: 'sendCandidateConfirmation',
      label: 'Confirmación de postulación',
      description: 'Enviar email de bienvenida al candidato al registrarse',
      icon: '📧',
    },
    {
      key: 'sendSolicitudNotification',
      label: 'Notificación de nueva solicitud',
      description: 'Avisar al analista cuando se le asigne una nueva solicitud',
      icon: '🔔',
    },
    {
      key: 'sendStatusUpdate',
      label: 'Actualización de estado',
      description: 'Notificar cambios de estado (analista y candidato)',
      icon: '🔄',
    },
    {
      key: 'sendEvaluationScheduled',
      label: 'Evaluación programada',
      description: 'Confirmar cita de evaluación al candidato',
      icon: '📅',
    },
  ];

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
        <Mail className="w-5 h-5 text-blue-600" />
        <span>Notificaciones por Email</span>
      </h3>

      <p className="text-sm text-gray-600">
        Configura qué notificaciones automáticas enviar por correo electrónico (vía Resend)
      </p>

      <div className="space-y-3">
        {notificationTypes.map(({ key, label, description, icon }) => (
          <label key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggleOption(key)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </label>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800">Resultados del último envío:</h4>
          {Object.entries(results).map(([type, result]) => (
            <div key={type} className={`p-3 rounded-lg text-sm ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="font-medium capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-xs opacity-75">
                  {result.success ? 'Enviado correctamente' : `Error: ${result.error}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {onSendEmail && (
        <button
          type="button"
          onClick={() => handleSendEmails({})}
          disabled={sending}
          className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              <span>Enviar emails seleccionados</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}