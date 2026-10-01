// src/data.js
// Datos simulados para el sistema de evaluación psicolaboral de AquaChile

// Array de candidatos
export const candidatos = [
  {
    id: 1,
    nombre: "Ana González",
    correo: "ana.gonzalez@email.com",
    cargo: "Analista de Producción",
    familiaCargo: "Producción",
    cv: "ana_gonzalez_cv.pdf" // nombre del archivo adjunto (simulado)
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    correo: "carlos.rodriguez@email.com",
    cargo: "Supervisor de Mantención",
    familiaCargo: "Mantención",
    cv: "carlos_rodriguez_cv.docx"
  },
  {
    id: 3,
    nombre: "María López",
    correo: "maria.lopez@email.com",
    cargo: "Asistente de Recursos Humanos",
    familiaCargo: "Recursos Humanos",
    cv: "maria_lopez_cv.pdf"
  }
];

// Array de solicitudes de evaluación
export const solicitudes = [
  {
    id: 1,
    candidatoId: 1, // Ana González
    analista: "Dr. Luis Martínez",
    ceco: "PROD001",
    ubicacion: "Planta Principal",
    fecha: "2026-09-01",
    estado: "Pendiente"
  },
  {
    id: 2,
    candidatoId: 2, // Carlos Rodríguez
    analista: "Dra. Patricia Gómez",
    ceco: "MANT002",
    ubicacion: "Planta Sur",
    fecha: "2026-09-10",
    estado: "En Proceso"
  },
  {
    id: 3,
    candidatoId: 3, // María López
    analista: "Dr. Luis Martínez",
    ceco: "RRHH003",
    ubicacion: "Oficina Central",
    fecha: "2026-09-15",
    estado: "Finalizada"
  }
];