export const CARGOS_DISPONIBLES = [
  'Operador de Planta',
  'Operador de Centro de Cultivo',
  'Técnico de Mantenimiento',
  'Técnico de Calidad',
  'Supervisor de Turno',
  'Jefe de Producción',
  'Analista de RRHH',
  'Analista de Finanzas',
  'Analista de Logística',
  'Psicólogo Organizacional',
  'Ingeniero de Procesos',
  'Ingeniero de Mantenimiento',
  'Ingeniero de Calidad',
  'Administrativo',
  'Conductor',
  'Bodeguero',
  'Guardia de Seguridad',
  'Enfermero/a Ocupacional',
  'Prevencionista de Riesgos',
];

// Mapeo de cargo -> familia(s)
// Si un cargo tiene múltiples familias, se habilitará el selector con esas opciones
export const CARGO_FAMILIA_MAP = {
  'Operador de Planta': ['Operaciones / Producción'],
  'Operador de Centro de Cultivo': ['Operaciones / Producción'],
  'Técnico de Mantenimiento': ['Mantenimiento & Logística'],
  'Técnico de Calidad': ['Calidad & Medio Ambiente'],
  'Supervisor de Turno': ['Operaciones / Producción'],
  'Jefe de Producción': ['Operaciones / Producción'],
  'Analista de RRHH': ['Administración & RRHH'],
  'Analista de Finanzas': ['Administración & RRHH'],
  'Analista de Logística': ['Mantenimiento & Logística', 'Operaciones / Producción'],
  'Psicólogo Organizacional': ['Administración & RRHH'],
  'Ingeniero de Procesos': ['Operaciones / Producción', 'Calidad & Medio Ambiente'],
  'Ingeniero de Mantenimiento': ['Mantenimiento & Logística'],
  'Ingeniero de Calidad': ['Calidad & Medio Ambiente'],
  'Administrativo': ['Administración & RRHH'],
  'Conductor': ['Mantenimiento & Logística'],
  'Bodeguero': ['Mantenimiento & Logística'],
  'Guardia de Seguridad': ['Administración & RRHH'],
  'Enfermero/a Ocupacional': ['Administración & RRHH', 'Calidad & Medio Ambiente'],
  'Prevencionista de Riesgos': ['Calidad & Medio Ambiente', 'Administración & RRHH'],
};

export const FAMILIAS_CARGO = [
  'Operaciones / Producción',
  'Mantenimiento & Logística',
  'Calidad & Medio Ambiente',
  'Administración & RRHH',
];

/**
 * Obtiene la(s) familia(s) para un cargo dado
 * @param {string} cargo - El cargo seleccionado
 * @returns {string[]} - Array de familias (1 o más)
 */
export function getFamiliaForCargo(cargo) {
  return CARGO_FAMILIA_MAP[cargo] || [];
}

/**
 * Obtiene la familia principal (la primera) para un cargo
 * @param {string} cargo - El cargo seleccionado
 * @returns {string} - La familia principal
 */
export function getPrimaryFamiliaForCargo(cargo) {
  const familias = getFamiliaForCargo(cargo);
  return familias[0] || '';
}

/**
 * Verifica si un cargo tiene múltiples familias posibles
 * @param {string} cargo - El cargo seleccionado
 * @returns {boolean}
 */
export function cargoHasMultipleFamilias(cargo) {
  const familias = getFamiliaForCargo(cargo);
  return familias.length > 1;
}