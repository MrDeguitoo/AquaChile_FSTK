-- Script de Inicialización PostgreSQL - AquaChile MVP Psicolaboral
-- Archivo: server/schema.sql

DROP TABLE IF EXISTS evaluaciones CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS candidatos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Tabla de Usuarios (Crear PRIMERO para evitar errores de FK)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('analista', 'evaluador')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Candidatos
CREATE TABLE candidatos (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    familia_cargo VARCHAR(100) NOT NULL,
    cv_adjunto VARCHAR(255),
    cv_url VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Solicitudes
CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    candidato_id INT REFERENCES candidatos(id) ON DELETE CASCADE,
    analista_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    cargo_postulado VARCHAR(100),
    unidad VARCHAR(100),
    ubicacion VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Rechazado', 'Finalizada')),
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    observaciones TEXT
);

-- 4. Tabla de Evaluaciones Psicolaborales
CREATE TABLE evaluaciones (
    id SERIAL PRIMARY KEY,
    solicitud_id INT REFERENCES solicitudes(id) ON DELETE CASCADE,
    evaluador_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    resultado VARCHAR(50) CHECK (resultado IN ('Recomendado', 'Recomendado con Observaciones', 'No Recomendado')),
    informe_url VARCHAR(255),
    observaciones TEXT,
    fecha_evaluacion DATE DEFAULT CURRENT_DATE
);

-- Insertar Datos de Prueba Iniciales
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Analista de Reclutamiento', 'analista@aquachile.cl', '123456', 'analista'),
('Psicólogo Evaluador', 'psicologo@aquachile.cl', '123456', 'evaluador');

INSERT INTO candidatos (rut, nombre, correo, email, familia_cargo) VALUES
('15.420.180-5', 'Roberto Gómez', 'roberto.gomez@correo.cl', 'roberto.gomez@correo.cl', 'Operaciones'),
('18.230.450-K', 'Camila Silva', 'camila.silva@correo.cl', 'camila.silva@correo.cl', 'Procesamiento');

INSERT INTO solicitudes (candidato_id, analista_id, usuario_id, cargo_postulado, estado) VALUES
(1, 1, 1, 'Jefe de Centro de Cultivo', 'En Proceso'),
(2, 1, 1, 'Supervisora de Calidad Planta', 'Pendiente');