-- Esquema de base de datos para Sistema de Evaluación Psicolaboral AquaChile

-- Tabla de candidatos
CREATE TABLE IF NOT EXISTS candidatos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    cargo VARCHAR(255),
    familia_cargo VARCHAR(255),
    cv_adjunto VARCHAR(500),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    candidato_id INTEGER REFERENCES candidatos(id) ON DELETE SET NULL,
    analista_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    unidad VARCHAR(255),
    ubicacion VARCHAR(255),
    observaciones TEXT,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    rol VARCHAR(100) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_candidatos_correo ON candidatos(correo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_candidato_id ON solicitudes(candidato_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);

-- Datos iniciales de prueba
INSERT INTO usuarios (nombre, correo, rol) VALUES
    ('Juan Pérez', 'juan.perez@aquachile.cl', 'Analista'),
    ('María González', 'maria.gonzalez@aquachile.cl', 'Analista'),
    ('Carlos Rodríguez', 'carlos.rodriguez@aquachile.cl', 'Administrador')
ON CONFLICT (correo) DO NOTHING;