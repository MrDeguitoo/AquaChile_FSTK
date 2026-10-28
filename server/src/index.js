import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Pool de conexiones PostgreSQL
const pool = new Pool({
  user: 'aquachile_user',
  host: 'localhost',
  database: 'aquachile_psicolaboral',
  password: 'aquachile_password',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

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
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINTS CANDIDATOS
// ============================================

// GET /api/candidatos - Listar todos los candidatos
app.get('/api/candidatos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidatos ORDER BY fecha_registro DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener candidatos:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/candidatos - Crear nuevo candidato
app.post('/api/candidatos', upload.single('cv'), async (req, res) => {
  try {
    const { nombre, correo, cargo, familia_cargo } = req.body;
    const cv_adjunto = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO candidatos (nombre, correo, cargo, familia_cargo, cv_adjunto)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, correo, cargo, familia_cargo, cv_adjunto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear candidato:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINTS SOLICITUDES
// ============================================

// GET /api/solicitudes - Listar todas las solicitudes
app.get('/api/solicitudes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.nombre as candidato_nombre, c.correo as candidato_correo
      FROM solicitudes s
      LEFT JOIN candidatos c ON s.candidato_id = c.id
      ORDER BY s.fecha_solicitud DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/solicitudes/:id - Actualizar estado de solicitud
app.put('/api/solicitudes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const validEstados = ['Pendiente', 'En Proceso', 'Completado', 'Finalizada'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Estados válidos: Pendiente, En Proceso, Completado, Finalizada' });
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
    const { candidato_id, analista_id, unidad, ubicacion, observaciones } = req.body;

    const result = await pool.query(
      `INSERT INTO solicitudes (candidato_id, analista_id, unidad, ubicacion, observaciones)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [candidato_id, analista_id, unidad, ubicacion, observaciones]
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