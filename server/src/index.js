import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});