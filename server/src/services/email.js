import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
// TEMPORAL: onboarding@resend.dev para testear sin dominio verificado
// NOTA: Solo permite enviar al email verificado de la cuenta Resend
const FROM_EMAIL = 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Send a generic email via Resend
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content (fallback)
 * @returns {Promise<Object>} Resend response
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome/confirmation email to a new candidate
 * @param {Object} candidate - Candidate data
 * @returns {Promise<Object>} Send result
 */
export async function sendCandidateConfirmation(candidate) {
  const { nombre, email, cargo, familiaCargo } = candidate;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">AquaChile</h1>
        <p style="color: #bfdbfe; margin: 10px 0 0; font-size: 16px;">Sistema de Evaluación Psicolaboral</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="color: #1e3a8a; margin-top: 0;">¡Bienvenido al proceso de evaluación, ${nombre}!</h2>

        <p>Hemos registrado tu postulación para el cargo de <strong>${cargo}</strong> en el área de <strong>${familiaCargo}</strong>.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detalles de tu postulación:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Nombre:</strong> ${nombre}</li>
            <li><strong>Cargo:</strong> ${cargo}</li>
            <li><strong>Familia de cargo:</strong> ${familiaCargo}</li>
            <li><strong>Correo:</strong> ${email}</li>
          </ul>
        </div>

        <p>Nuestro equipo de reclutamiento revisará tu perfil y te contactará pronto para coordinar los siguientes pasos del proceso de evaluación psicolaboral.</p>

        <p style="margin-top: 30px;">Si tienes alguna consulta, no dudes en contactarnos.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Este es un mensaje automático, por favor no responder directamente a este correo.<br>
          AquaChile - Sistema de Evaluación Psicolaboral
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Confirmación de postulación - AquaChile Evaluación Psicolaboral',
    html,
  });
}

/**
 * Send notification to analista when a new solicitud is created
 * @param {Object} solicitud - Solicitud data
 * @param {Object} analista - Analista data
 * @param {Object} candidato - Candidato data
 * @returns {Promise<Object>} Send result
 */
export async function sendSolicitudNotification(solicitud, analista, candidato) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">AquaChile</h1>
        <p style="color: #bfdbfe; margin: 10px 0 0; font-size: 16px;">Nueva Solicitud de Evaluación</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Hola ${analista.nombre},</h2>

        <p>Se ha creado una nueva solicitud de evaluación psicolaboral asignada a ti.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detalles de la solicitud:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Candidato:</strong> ${candidato.nombre} (${candidato.email})</li>
            <li><strong>Cargo postulado:</strong> ${solicitud.cargo_postulado}</li>
            <li><strong>Unidad/CECO:</strong> ${solicitud.unidad || 'No especificada'}</li>
            <li><strong>Ubicación:</strong> ${solicitud.ubicacion || 'No especificada'}</li>
            <li><strong>Fecha de solicitud:</strong> ${solicitud.fecha_solicitud}</li>
            <li><strong>Estado:</strong> ${solicitud.estado}</li>
          </ul>
          ${solicitud.observaciones ? `<p><strong>Observaciones:</strong> ${solicitud.observaciones}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}/solicitudes"
             style="background: #1e3a8a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Ver solicitud en el sistema
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Este es un mensaje automático del Sistema de Evaluación Psicolaboral de AquaChile.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: analista.email,
    subject: `Nueva solicitud de evaluación: ${candidato.nombre} - ${solicitud.cargo_postulado}`,
    html,
  });
}

/**
 * Send status change notification email
 * @param {Object} solicitud - Solicitud data
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {Object} candidato - Candidato data
 * @param {Object} analista - Analista data
 * @returns {Promise<Object>} Send result
 */
export async function sendStatusUpdateEmail(solicitud, oldStatus, newStatus, candidato, analista) {
  const statusColors = {
    'Pendiente': '#f59e0b',
    'En Proceso': '#3b82f6',
    'Completado': '#10b981',
    'Finalizada': '#6366f1',
    'Rechazado': '#ef4444',
  };

  const newStatusColor = statusColors[newStatus] || '#6b7280';
  const oldStatusColor = statusColors[oldStatus] || '#6b7280';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">AquaChile</h1>
        <p style="color: #bfdbfe; margin: 10px 0 0; font-size: 16px;">Actualización de Estado de Solicitud</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Actualización de estado</h2>

        <p>El estado de la solicitud de evaluación para <strong>${candidato.nombre}</strong> ha cambiado.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div style="background: ${oldStatusColor}20; color: ${oldStatusColor}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
              ${oldStatus}
            </div>
            <span style="color: #9ca3af; font-size: 18px;">→</span>
            <div style="background: ${newStatusColor}20; color: ${newStatusColor}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
              ${newStatus}
            </div>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detalles:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Candidato:</strong> ${candidato.nombre} (${candidato.email})</li>
            <li><strong>Cargo postulado:</strong> ${solicitud.cargo_postulado}</li>
            <li><strong>Analista:</strong> ${analista.nombre}</li>
            <li><strong>Unidad:</strong> ${solicitud.unidad || 'No especificada'}</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}/solicitudes"
             style="background: #1e3a8a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Ver detalles en el sistema
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Este es un mensaje automático del Sistema de Evaluación Psicolaboral de AquaChile.
        </p>
      </div>
    </body>
    </html>
  `;

  // Send to both analista and candidate (if candidate has email)
  const recipients = [analista.email];
  if (candidato.email && candidato.email !== analista.email) {
    recipients.push(candidato.email);
  }

  return sendEmail({
    to: recipients,
    subject: `Actualización de estado: ${candidato.nombre} - ${oldStatus} → ${newStatus}`,
    html,
  });
}

/**
 * Send evaluation scheduled confirmation email
 * @param {Object} solicitud - Solicitud data
 * @param {Object} eventDetails - Calendar event details
 * @param {Object} candidato - Candidato data
 * @param {Object} analista - Analista data
 * @returns {Promise<Object>} Send result
 */
export async function sendEvaluationScheduledEmail(solicitud, eventDetails, candidato, analista) {
  const { start, end, location, description, htmlLink } = eventDetails;
  const startDate = new Date(start).toLocaleString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const endDate = new Date(end).toLocaleString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">AquaChile</h1>
        <p style="color: #bfdbfe; margin: 10px 0 0; font-size: 16px;">Evaluación Psicolaboral Programada</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Hola ${candidato.nombre},</h2>

        <p>Tu evaluación psicolaboral ha sido programada. Aquí están los detalles:</p>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detalles de la evaluación:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Cargo postulado:</strong> ${solicitud.cargo_postulado}</li>
            <li><strong>Fecha y hora:</strong> ${startDate} - ${endDate}</li>
            <li><strong>Ubicación:</strong> ${location || 'Por confirmar'}</li>
            <li><strong>Evaluador:</strong> ${analista.nombre}</li>
            ${description ? `<li><strong>Descripción:</strong> ${description}</li>` : ''}
          </ul>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Importante:</strong> Por favor llega 10 minutos antes de la hora programada. Trae tu documento de identidad y cualquier documentación relevante.</p>
        </div>

        ${htmlLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${htmlLink}"
             style="background: #1e3a8a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Ver en Google Calendar
          </a>
        </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Este es un mensaje automático del Sistema de Evaluación Psicolaboral de AquaChile.<br>
          Si necesitas reagendar, contacta a tu analista: ${analista.email}
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: candidato.email,
    subject: `Evaluación programada: ${solicitud.cargo_postulado} - ${startDate}`,
    html,
  });
}

export default {
  sendEmail,
  sendCandidateConfirmation,
  sendSolicitudNotification,
  sendStatusUpdateEmail,
  sendEvaluationScheduledEmail,
};