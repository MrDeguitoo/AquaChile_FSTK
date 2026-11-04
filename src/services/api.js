const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    let detalle = '';
    try {
      detalle = (await res.json()).error ?? '';
    } catch {
      // la respuesta de error no era JSON
    }
    throw new Error(detalle || `Error ${res.status} al llamar a ${path}`);
  }
  return res.json();
}

// Traduce las columnas de la base a los nombres que usa el front
export function normalizarCandidato(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.email ?? row.correo,
    cargo: row.cargo,
    familiaCargo: row.familia_cargo ?? row.familiaCargo,
    cvAdjunto: row.cv_url ?? row.cv_adjunto ?? null,
    estado: row.estado ?? 'Nuevo',
  };
}

export async function getCandidatos() {
  const filas = await request('/candidatos');
  return filas.map(normalizarCandidato);
}

export async function crearCandidato(c) {
  const body = new FormData();
  body.append('nombre', c.nombre);
  body.append('email', c.correo);
  body.append('cargo', c.cargo);
  body.append('familia_cargo', c.familiaCargo);
  if (c.cvFile) body.append('cv', c.cvFile);

  // No se define Content-Type: el navegador lo arma solo para FormData
  const fila = await request('/candidatos', { method: 'POST', body });
  return normalizarCandidato(fila);
}