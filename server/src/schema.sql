-- Tabla de Evaluadores
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL -- 'analista', 'evaluador'
);

-- Tabla de Candidatos
CREATE TABLE IF NOT EXISTS candidatos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    familia_cargo VARCHAR(100) NOT NULL,
    cv_adjunto VARCHAR(255),
    fecha_registro DATE DEFAULT CURRENT_DATE
);

-- Tabla de Solicitudes de Evaluación
CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    candidato_id INT REFERENCES candidatos(id) ON DELETE CASCADE,
    analista_id INT REFERENCES usuarios(id),
    unidad VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(50) DEFAULT 'Pendiente', -- 'Pendiente', 'En Proceso', 'Completado'
    observaciones TEXT
);