-- Migración 001: Agregar columnas para integraciones (Resend, Google Calendar, Google Drive)
-- Fecha: 2026-11-20

-- Agregar columna para Google Drive file ID en candidatos
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS drive_cv_file_id VARCHAR(255);

-- Agregar columnas para Google Calendar y Google Drive en solicitudes
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255);
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS drive_folder_id VARCHAR(255);

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_candidatos_drive_cv_file_id ON candidatos(drive_cv_file_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_calendar_event_id ON solicitudes(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_drive_folder_id ON solicitudes(drive_folder_id);