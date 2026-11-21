import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Service modules will be loaded dynamically after dotenv.config()
// We'll initialize them lazily when first needed
let emailService, calendarService, driveService;

async function loadServices() {
  if (!emailService) {
    emailService = await import('./services/email.js');
    calendarService = await import('./services/calendar.js');
    driveService = await import('./services/drive.js');
  }
  return { emailService, calendarService, driveService };
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido. Solo se aceptan archivos .pdf, .doc y .docx'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Pool de conexiones PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aquachile_db',
  password: process.env.DB_PASSWORD || 'aquachile_secure_pass',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

// Helper para extraer mensaje de error (incluye AggregateError de pg-pool)
function getErrorMessage(error) {
  if (!error) return 'Error desconocido';
  if (error.message) return error.message;
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0]?.message || error.errors[0]?.toString() || 'Error de base de datos';
  }
  return error.toString();
}

// Middleware para manejar errores de multer (DEBE ir antes de las rutas)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Archivo demasiado grande. Máximo 5 MB' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ============================================
// ENDPOINTS DEL DASHBOARD
// ============================================

// GET /api/dashboard/stats - Estadísticas para el dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalCandidatosResult = await pool.query('SELECT COUNT(*) FROM candidatos');
    const pendientesResult = await pool.query("SELECT COUNT(*) FROM solicitudes WHERE estado = 'Pendiente'");
    const enProcesoResult = await pool.query("SELECT COUNT(*) FROM solicitudes WHERE estado = 'En Proceso'");
    const completadasResult = await pool.query("SELECT COUNT(*) FROM solicitudes WHERE estado = 'Completado' OR estado = 'Finalizada'");

    res.json({
      totalCandidatos: parseInt(totalCandidatosResult.rows[0].count),
      pendientes: parseInt(pendientesResult.rows[0].count),
      enProceso: parseInt(enProcesoResult.rows[0].count),
      completadas: parseInt(completadasResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    const message = getErrorMessage(error);
    res.status(500).json({ error: message });
  }
});

// ============================================
// ENDPOINTS CANDIDATOS
// ============================================

// GET /api/candidatos - Listar todos los candidatos
app.get('/api/candidatos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidatos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener candidatos:', error);
    const message = getErrorMessage(error);
    res.status(500).json({ error: message });
  }
});

// Wrapper para manejar errores de multer en fileFilter (que no pasan por error middleware)
const handleMulterUpload = (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Archivo demasiado grande. Máximo 5 MB' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// POST /api/candidatos - Crear nuevo candidato
app.post('/api/candidatos', handleMulterUpload, async (req, res) => {
  try {
    const { nombre, email, cargo, familia_cargo, rut } = req.body;
    const cv_adjunto = req.file ? req.file.filename : null;

    // Validar rut obligatorio
    if (!rut || !rut.trim()) {
      return res.status(400).json({ error: 'El RUT es obligatorio' });
    }

    const result = await pool.query(
      `INSERT INTO candidatos (rut, nombre, email, cargo, familia_cargo, cv_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [rut.trim(), nombre, email, cargo, familia_cargo, cv_adjunto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear candidato:', error);
    // Manejar error de duplicado de RUT o email
    if (error.code === '23505') {
      const field = error.constraint?.includes('rut') ? 'RUT' : 'email';
      return res.status(409).json({ error: `El ${field} ya está registrado` });
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

// ============================================
// ENDPOINTS SOLICITUDES
// ============================================

// GET /api/solicitudes - Listar todas las solicitudes
app.get('/api/solicitudes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.candidato_id,
        s.analista_id,
        s.usuario_id,
        s.cargo_postulado,
        s.unidad,
        s.ubicacion,
        s.estado,
        s.fecha_solicitud,
        s.observaciones,
        c.nombre as candidato_nombre,
        c.email as candidato_correo
      FROM solicitudes s
      LEFT JOIN candidatos c ON s.candidato_id = c.id
      ORDER BY s.fecha_solicitud DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    const message = getErrorMessage(error);
    res.status(500).json({ error: message });
  }
});

// PUT /api/solicitudes/:id - Actualizar estado de solicitud
app.put('/api/solicitudes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Estados válidos según schema.sql CHECK constraint
    const validEstados = ['Pendiente', 'En Proceso', 'Completado', 'Finalizada', 'Rechazado'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        validEstados
      });
    }

    const result = await pool.query(
      `UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/solicitudes - Crear nueva solicitud
app.post('/api/solicitudes', async (req, res) => {
  try {
    const { candidato_id, analista_id, usuario_id, cargo_postulado, unidad, ubicacion, observaciones } = req.body;

    // Validaciones básicas
    if (!candidato_id || !analista_id || !cargo_postulado) {
      return res.status(400).json({
        error: 'Campos obligatorios: candidato_id, analista_id, cargo_postulado'
      });
    }

    const result = await pool.query(
      `INSERT INTO solicitudes (candidato_id, analista_id, usuario_id, cargo_postulado, unidad, ubicacion, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [candidato_id, analista_id, usuario_id || analista_id, cargo_postulado, unidad, ubicacion, observaciones]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINTS USUARIOS
// ============================================

// GET /api/usuarios - Listar usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/usuarios - Crear usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, rol) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, correo, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EMAIL ENDPOINTS (Resend)
// ============================================

// POST /api/email/send - Send generic email
app.post('/api/email/send', async (req, res) => {
  try {
    await loadServices();
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Campos obligatorios: to, subject, html' });
    }

    const result = await emailService.sendEmail({ to, subject, html, text });
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error en endpoint de email:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/email/candidate-confirmation - Send candidate welcome email
app.post('/api/email/candidate-confirmation', async (req, res) => {
  try {
    await loadServices();
    const { candidate } = req.body;

    if (!candidate || !candidate.email) {
      return res.status(400).json({ error: 'Datos de candidato requeridos (email obligatorio)' });
    }

    const result = await emailService.sendCandidateConfirmation(candidate);
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error enviando confirmación de candidato:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/email/solicitud-notification - Notify analista of new solicitud
app.post('/api/email/solicitud-notification', async (req, res) => {
  try {
    await loadServices();
    const { solicitud, analista, candidato } = req.body;

    if (!solicitud || !analista || !candidato) {
      return res.status(400).json({ error: 'Datos requeridos: solicitud, analista, candidato' });
    }

    const result = await emailService.sendSolicitudNotification(solicitud, analista, candidato);
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error enviando notificación de solicitud:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/email/status-update - Send status change notification
app.post('/api/email/status-update', async (req, res) => {
  try {
    await loadServices();
    const { solicitud, oldStatus, newStatus, candidato, analista } = req.body;

    if (!solicitud || !oldStatus || !newStatus || !candidato || !analista) {
      return res.status(400).json({ error: 'Datos requeridos: solicitud, oldStatus, newStatus, candidato, analista' });
    }

    const result = await emailService.sendStatusUpdateEmail(solicitud, oldStatus, newStatus, candidato, analista);
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error enviando actualización de estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/email/evaluation-scheduled - Send evaluation scheduled confirmation
app.post('/api/email/evaluation-scheduled', async (req, res) => {
  try {
    await loadServices();
    const { solicitud, eventDetails, candidato, analista } = req.body;

    if (!solicitud || !eventDetails || !candidato || !analista) {
      return res.status(400).json({ error: 'Datos requeridos: solicitud, eventDetails, candidato, analista' });
    }

    const result = await emailService.sendEvaluationScheduledEmail(solicitud, eventDetails, candidato, analista);
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error enviando confirmación de evaluación programada:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GOOGLE CALENDAR ENDPOINTS
// ============================================

// POST /api/calendar/events - Create calendar event
app.post('/api/calendar/events', async (req, res) => {
  try {
    await loadServices();
    const { summary, description, start, end, attendees, location, calendarId } = req.body;

    if (!summary || !start || !end) {
      return res.status(400).json({ error: 'Campos obligatorios: summary, start, end' });
    }

    const result = await calendarService.createEvent({
      summary,
      description,
      start,
      end,
      attendees,
      location,
      calendarId,
    });

    if (result.success) {
      res.status(201).json({ success: true, event: result.event });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error creando evento de calendario:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/calendar/evaluation - Create evaluation event from solicitud data
app.post('/api/calendar/evaluation', async (req, res) => {
  try {
    await loadServices();
    const { solicitud, candidato, analista, evaluador, startDate, durationMinutes } = req.body;

    if (!solicitud || !candidato || !analista || !startDate) {
      return res.status(400).json({ error: 'Datos requeridos: solicitud, candidato, analista, startDate' });
    }

    const result = await calendarService.createEvaluationEvent(
      solicitud,
      candidato,
      analista,
      evaluador,
      new Date(startDate),
      durationMinutes
    );

    if (result.success) {
      res.status(201).json({ success: true, event: result.event });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error creando evento de evaluación:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/calendar/events - List upcoming events
app.get('/api/calendar/events', async (req, res) => {
  try {
    await loadServices();
    const { timeMin, timeMax, maxResults, calendarId } = req.query;

    const result = await calendarService.listEvents({
      timeMin: timeMin ? new Date(timeMin) : undefined,
      timeMax: timeMax ? new Date(timeMax) : undefined,
      maxResults: maxResults ? parseInt(maxResults) : undefined,
      calendarId,
    });

    if (result.success) {
      res.json({ success: true, events: result.events });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error listando eventos de calendario:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/calendar/events/:id - Get specific event
app.get('/api/calendar/events/:id', async (req, res) => {
  try {
    await loadServices();
    const { id } = req.params;
    const { calendarId } = req.query;

    const result = await calendarService.getEvent(id, calendarId);

    if (result.success) {
      res.json({ success: true, event: result.event });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error obteniendo evento de calendario:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/calendar/events/:id - Update event
app.put('/api/calendar/events/:id', async (req, res) => {
  try {
    await loadServices();
    const { id } = req.params;
    const { calendarId, ...updates } = req.body;

    const result = await calendarService.updateEvent(id, updates, calendarId);

    if (result.success) {
      res.json({ success: true, event: result.event });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error actualizando evento de calendario:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/calendar/events/:id - Delete event
app.delete('/api/calendar/events/:id', async (req, res) => {
  try {
    await loadServices();
    const { id } = req.params;
    const { calendarId } = req.query;

    const result = await calendarService.deleteEvent(id, calendarId);

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error eliminando evento de calendario:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GOOGLE DRIVE ENDPOINTS
// ============================================

// POST /api/drive/upload - Upload file to Drive
app.post('/api/drive/upload', upload.single('file'), async (req, res) => {
  try {
    await loadServices();
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { folderId } = req.body;

    const result = await driveService.uploadFile({
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      content: req.file.buffer,
      folderId,
    });

    if (result.success) {
      res.status(201).json({ success: true, file: result.file });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error subiendo archivo a Drive:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drive/candidate-cv - Upload candidate CV to Drive
app.post('/api/drive/candidate-cv', upload.single('cv'), async (req, res) => {
  try {
    await loadServices();
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo CV' });
    }

    const { candidato } = req.body;

    if (!candidato) {
      return res.status(400).json({ error: 'Datos de candidato requeridos' });
    }

    const candidatoData = typeof candidato === 'string' ? JSON.parse(candidato) : candidato;

    const result = await driveService.uploadCandidateCV(req.file, candidatoData);

    if (result.success) {
      // Update candidate record with Drive file ID
      if (result.file && result.file.id) {
        await pool.query(
          'UPDATE candidatos SET drive_cv_file_id = $1 WHERE id = $2',
          [result.file.id, candidatoData.id]
        );
      }
      res.status(201).json({ success: true, file: result.file });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error subiendo CV de candidato a Drive:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/drive/files/:id - Get file info/link
app.get('/api/drive/files/:id', async (req, res) => {
  try {
    await loadServices();
    const { id } = req.params;
    const { anyoneWithLink } = req.query;

    const result = await driveService.getFileLink(id, anyoneWithLink !== 'false');

    if (result.success) {
      res.json({ success: true, ...result });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error obteniendo enlace de archivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/drive/files/:id - Delete file
app.delete('/api/drive/files/:id', async (req, res) => {
  try {
    await loadServices();
    const { id } = req.params;

    const result = await driveService.deleteFile(id);

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error eliminando archivo de Drive:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drive/folders - Create folder
app.post('/api/drive/folders', async (req, res) => {
  try {
    await loadServices();
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nombre de carpeta requerido' });
    }

    const result = await driveService.createFolder(name, parentId);

    if (result.success) {
      res.status(201).json({ success: true, folder: result.folder });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error creando carpeta en Drive:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/drive/folders/:id/files - List files in folder
app.get('/api/drive/folders/:id/files', async (req, res) => {
  try {
    await loadServices();
    const { id } = req.params;
    const { maxResults } = req.query;

    const result = await driveService.listFiles(id, maxResults ? parseInt(maxResults) : undefined);

    if (result.success) {
      res.json({ success: true, files: result.files });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error listando archivos de carpeta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});