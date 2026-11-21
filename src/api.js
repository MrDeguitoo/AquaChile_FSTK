const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  // Don't set Content-Type for FormData
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  // ============================================
  // CANDIDATES
  // ============================================
  candidates: {
    list: () => fetchApi('/candidatos'),
    create: (formData) => fetchApi('/candidatos', {
      method: 'POST',
      body: formData,
    }),
    // Upload CV to Google Drive
    uploadCV: (candidateId, file) => {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('candidato', JSON.stringify({ id: candidateId }));
      return fetchApi('/drive/candidate-cv', {
        method: 'POST',
        body: formData,
      });
    },
  },

  // ============================================
  // SOLICITUDES (REQUESTS)
  // ============================================
  solicitudes: {
    list: () => fetchApi('/solicitudes'),
    create: (data) => fetchApi('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateStatus: (id, estado) => fetchApi(`/solicitudes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }),
  },

  // ============================================
  // USERS
  // ============================================
  users: {
    list: () => fetchApi('/usuarios'),
    create: (data) => fetchApi('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // ============================================
  // DASHBOARD
  // ============================================
  dashboard: {
    getStats: () => fetchApi('/dashboard/stats'),
  },

  // ============================================
  // EMAIL (RESEND)
  // ============================================
  email: {
    // Send generic email
    send: (data) => fetchApi('/email/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // Send candidate confirmation email
    sendCandidateConfirmation: (candidate) => fetchApi('/email/candidate-confirmation', {
      method: 'POST',
      body: JSON.stringify({ candidate }),
    }),

    // Send solicitud notification to analista
    sendSolicitudNotification: (solicitud, analista, candidato) => fetchApi('/email/solicitud-notification', {
      method: 'POST',
      body: JSON.stringify({ solicitud, analista, candidato }),
    }),

    // Send status update notification
    sendStatusUpdate: (solicitud, oldStatus, newStatus, candidato, analista) => fetchApi('/email/status-update', {
      method: 'POST',
      body: JSON.stringify({ solicitud, oldStatus, newStatus, candidato, analista }),
    }),

    // Send evaluation scheduled confirmation
    sendEvaluationScheduled: (solicitud, eventDetails, candidato, analista) => fetchApi('/email/evaluation-scheduled', {
      method: 'POST',
      body: JSON.stringify({ solicitud, eventDetails, candidato, analista }),
    }),
  },

  // ============================================
  // GOOGLE CALENDAR
  // ============================================
  calendar: {
    // Create generic event
    createEvent: (eventData) => fetchApi('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

    // Create evaluation event from solicitud data
    createEvaluationEvent: (data) => fetchApi('/calendar/evaluation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // List upcoming events
    listEvents: (params = {}) => {
      const query = new URLSearchParams();
      if (params.timeMin) query.append('timeMin', params.timeMin);
      if (params.timeMax) query.append('timeMax', params.timeMax);
      if (params.maxResults) query.append('maxResults', params.maxResults);
      if (params.calendarId) query.append('calendarId', params.calendarId);
      return fetchApi(`/calendar/events?${query.toString()}`);
    },

    // Get specific event
    getEvent: (id, calendarId) => {
      const query = calendarId ? `?calendarId=${calendarId}` : '';
      return fetchApi(`/calendar/events/${id}${query}`);
    },

    // Update event
    updateEvent: (id, data) => fetchApi(`/calendar/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    // Delete event
    deleteEvent: (id, calendarId) => {
      const query = calendarId ? `?calendarId=${calendarId}` : '';
      return fetchApi(`/calendar/events/${id}${query}`, {
        method: 'DELETE',
      });
    },
  },

  // ============================================
  // GOOGLE DRIVE
  // ============================================
  drive: {
    // Upload file
    uploadFile: (file, folderId) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId);
      return fetchApi('/drive/upload', {
        method: 'POST',
        body: formData,
      });
    },

    // Upload candidate CV
    uploadCandidateCV: (candidateId, file) => {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('candidato', JSON.stringify({ id: candidateId }));
      return fetchApi('/drive/candidate-cv', {
        method: 'POST',
        body: formData,
      });
    },

    // Get file link
    getFileLink: (fileId, anyoneWithLink = true) => {
      const query = anyoneWithLink ? '' : '?anyoneWithLink=false';
      return fetchApi(`/drive/files/${fileId}${query}`);
    },

    // Delete file
    deleteFile: (fileId) => fetchApi(`/drive/files/${fileId}`, {
      method: 'DELETE',
    }),

    // Create folder
    createFolder: (name, parentId) => fetchApi('/drive/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    }),

    // List files in folder
    listFiles: (folderId, maxResults) => {
      const query = maxResults ? `?maxResults=${maxResults}` : '';
      return fetchApi(`/drive/folders/${folderId}/files${query}`);
    },
  },

  // ============================================
  // HEALTH
  // ============================================
  health: {
    check: () => fetchApi('/health'),
  },
};

export default api;