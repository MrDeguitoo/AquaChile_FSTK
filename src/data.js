export const candidatos = [
  {
    id: 1,
    nombre: "Juan Pérez González",
    correo: "juan.perez@email.com",
    cargo: "Operario de Planta",
    familiaCargo: "Producción",
    cv: "juan_perez_cv.pdf"
  },
  {
    id: 2,
    nombre: "María López Silva",
    correo: "maria.lopez@email.com",
    cargo: "Supervisor de Turno",
    familiaCargo: "Producción",
    cv: "maria_lopez_cv.pdf"
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez Méndez",
    correo: "carlos.rodriguez@email.com",
    cargo: "Analista de Calidad",
    familiaCargo: "Calidad",
    cv: "carlos_rodriguez_cv.pdf"
  }
];

export const solicitudes = [
  {
    id: 1,
    candidatoId: 1,
    analista: "Dra. Ana Vargas",
    ceco: "CECO Planta Norte",
    ubicacion: "Puerto Montt",
    fecha: "2026-09-15",
    estado: "Pendiente"
  },
  {
    id: 2,
    candidatoId: 2,
    analista: "Dr. Luis Fernández",
    ceco: "CECO Planta Sur",
    ubicacion: "Puerto Varas",
    fecha: "2026-09-16",
    estado: "En Proceso"
  },
  {
    id: 3,
    candidatoId: 3,
    analista: "Dra. Elena Morales",
    ceco: "CECO Oficina Central",
    ubicacion: "Santiago",
    fecha: "2026-09-17",
    estado: "Completado"
  }
];