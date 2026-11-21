import { useState } from 'react';

/**
 * Utilidades para manejo de RUT chileno
 * Formato: XX.XXX.XXX-Y (donde Y puede ser 0-9 o K/k)
 */

// Limpia el RUT dejando solo números y K/k
export function cleanRUT(rut) {
  if (!rut) return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

// Formatea el RUT con puntos y guión: 123456789 -> 12.345.678-9
export function formatRUT(rut) {
  const cleaned = cleanRUT(rut);
  if (!cleaned) return '';

  // Si tiene 1 solo carácter (solo dígito verificador), no formatear
  if (cleaned.length <= 1) return cleaned;

  const body = cleaned.slice(0, -1); // Parte numérica
  const dv = cleaned.slice(-1); // Dígito verificador

  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formattedBody}-${dv}`;
}

// Valida el dígito verificador usando el algoritmo oficial chileno
export function validateRUT(rut) {
  const cleaned = cleanRUT(rut);

  // Debe tener al menos 2 caracteres (1 dígito + 1 verificador)
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  // Calcular dígito verificador esperado
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDV = 11 - (sum % 11);
  let expectedDVChar;

  if (expectedDV === 11) {
    expectedDVChar = '0';
  } else if (expectedDV === 10) {
    expectedDVChar = 'K';
  } else {
    expectedDVChar = expectedDV.toString();
  }

  return dv === expectedDVChar;
}

// Valida formato completo (con o sin puntos/guión) y dígito verificador
export function isValidRUT(rut) {
  const cleaned = cleanRUT(rut);

  // Debe tener entre 8 y 9 caracteres (7-8 dígitos + 1 verificador)
  if (cleaned.length < 8 || cleaned.length > 9) return false;

  // Solo números y K en la última posición
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;

  // Validar dígito verificador
  return validateRUT(cleaned);
}

// Hook para manejo de RUT en formularios
export function useRUT(initialValue = '') {
  const [rut, setRut] = useState(initialValue);

  const handleRUTChange = (value) => {
    const cleaned = cleanRUT(value);
    const formatted = formatRUT(cleaned);
    setRut(formatted);
  };

  const getCleanRUT = () => cleanRUT(rut);

  const isValid = isValidRUT(rut);

  return { rut, setRut: handleRUTChange, getCleanRUT, isValid };
}