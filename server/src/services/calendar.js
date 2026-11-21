import { google } from 'googleapis';

// const SCOPES = ['https://www.googleapis.com/auth/calendar']; // Defined inline where used

let authClient = null;

/**
 * Get authenticated Google OAuth2 client
 * @returns {Promise<OAuth2Client>} Authenticated client
 */
export async function getAuthClient() {
  if (authClient) {
    return authClient;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  // Test the connection by getting a new access token
  try {
    await oauth2Client.getAccessToken();
    authClient = oauth2Client;
    return authClient;
  } catch (error) {
    console.error('Failed to authenticate with Google Calendar:', error);
    throw new Error(`Google Calendar authentication failed: ${error.message}`);
  }
}

/**
 * Create a calendar event for an evaluation
 * @param {Object} eventData - Event details
 * @param {string} eventData.summary - Event title
 * @param {string} eventData.description - Event description
 * @param {string|Date} eventData.start - Start time (ISO string or Date)
 * @param {string|Date} eventData.end - End time (ISO string or Date)
 * @param {string[]} [eventData.attendees] - Attendee emails
 * @param {string} [eventData.location] - Event location
 * @param {string} [eventData.calendarId='primary'] - Calendar ID
 * @returns {Promise<Object>} Created event
 */
export async function createEvent({
  summary,
  description,
  start,
  end,
  attendees = [],
  location,
  calendarId = 'primary',
}) {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary,
    description,
    location,
    start: {
      dateTime: new Date(start).toISOString(),
      timeZone: 'America/Santiago',
    },
    end: {
      dateTime: new Date(end).toISOString(),
      timeZone: 'America/Santiago',
    },
    attendees: attendees.map(email => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId,
      resource: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });
    return { success: true, event: response.data };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing calendar event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @param {string} [calendarId='primary'] - Calendar ID
 * @returns {Promise<Object>} Updated event
 */
export async function updateEvent(eventId, updates, calendarId = 'primary') {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    // First get the existing event
    const existing = await calendar.events.get({ calendarId, eventId });
    const updatedEvent = { ...existing.data, ...updates };

    // Convert dates if provided
    if (updates.start) {
      updatedEvent.start = {
        dateTime: new Date(updates.start).toISOString(),
        timeZone: 'America/Santiago',
      };
    }
    if (updates.end) {
      updatedEvent.end = {
        dateTime: new Date(updates.end).toISOString(),
        timeZone: 'America/Santiago',
      };
    }
    if (updates.attendees) {
      updatedEvent.attendees = updates.attendees.map(email => ({ email }));
    }

    const response = await calendar.events.update({
      calendarId,
      eventId,
      resource: updatedEvent,
      sendUpdates: 'all',
    });
    return { success: true, event: response.data };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a calendar event
 * @param {string} eventId - Event ID
 * @param {string} [calendarId='primary'] - Calendar ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteEvent(eventId, calendarId = 'primary') {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all',
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List upcoming calendar events
 * @param {Object} options - Query options
 * @param {string|Date} [options.timeMin] - Minimum time (default: now)
 * @param {string|Date} [options.timeMax] - Maximum time
 * @param {number} [options.maxResults=50] - Maximum results
 * @param {string} [options.calendarId='primary'] - Calendar ID
 * @returns {Promise<Object>} List of events
 */
export async function listEvents({
  timeMin = new Date().toISOString(),
  timeMax,
  maxResults = 50,
  calendarId = 'primary',
} = {}) {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return { success: true, events: response.data.items || [] };
  } catch (error) {
    console.error('Error listing calendar events:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific calendar event
 * @param {string} eventId - Event ID
 * @param {string} [calendarId='primary'] - Calendar ID
 * @returns {Promise<Object>} Event data
 */
export async function getEvent(eventId, calendarId = 'primary') {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const response = await calendar.events.get({ calendarId, eventId });
    return { success: true, event: response.data };
  } catch (error) {
    console.error('Error getting calendar event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create evaluation event from solicitud data
 * @param {Object} solicitud - Solicitud data
 * @param {Object} candidato - Candidato data
 * @param {Object} analista - Analista data
 * @param {Object} evaluador - Evaluador data (optional, defaults to analista)
 * @param {Date} startDate - Start date/time
 * @param {number} durationMinutes - Duration in minutes (default: 90)
 * @returns {Promise<Object>} Created event
 */
export async function createEvaluationEvent(solicitud, candidato, analista, evaluador = analista, startDate, durationMinutes = 90) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const summary = `Evaluación Psicolaboral: ${candidato.nombre} - ${solicitud.cargo_postulado}`;
  const description = `
Evaluación psicolaboral para AquaChile.

Candidato: ${candidato.nombre} (${candidato.email})
RUT: ${candidato.rut || 'No especificado'}
Cargo postulado: ${solicitud.cargo_postulado}
Unidad/CECO: ${solicitud.unidad || 'No especificada'}
Ubicación: ${solicitud.ubicacion || 'No especificada'}

Analista a cargo: ${analista.nombre} (${analista.email})
Evaluador: ${evaluador.nombre} (${evaluador.email})

Observaciones de la solicitud:
${solicitud.observaciones || 'Ninguna'}

---
Sistema de Evaluación Psicolaboral - AquaChile
  `.trim();

  const attendees = [candidato.email, analista.email];
  if (evaluador.email !== analista.email) {
    attendees.push(evaluador.email);
  }

  return createEvent({
    summary,
    description,
    start,
    end,
    attendees,
    location: solicitud.ubicacion,
  });
}

export default {
  getAuthClient,
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  getEvent,
  createEvaluationEvent,
};