import { useCallback } from 'react';

/**
 * Hook for sending email notifications from components
 */
export function useEmailNotifications(api) {
  const sendEmail = useCallback(async (type, ...args) => {
    switch (type) {
      case 'candidateConfirmation':
        return api.email.sendCandidateConfirmation(args[0]);
      case 'solicitudNotification':
        return api.email.sendSolicitudNotification(args[0], args[1], args[2]);
      case 'statusUpdate':
        return api.email.sendStatusUpdate(args[0], args[1], args[2], args[3], args[4]);
      case 'evaluationScheduled':
        return api.email.sendEvaluationScheduled(args[0], args[1], args[2], args[3]);
      default:
        throw new Error(`Tipo de email desconocido: ${type}`);
    }
  }, [api]);

  return { sendEmail };
}