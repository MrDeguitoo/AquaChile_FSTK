import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Hacer React disponible globalmente para JSX runtime automático
global.React = React;

// Mock de localStorage que realmente almacena datos
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: store,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Limpiar después de cada test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
});

// Mock global de fetch
global.fetch = vi.fn();

// Mock de ResizeObserver (necesario para algunos componentes)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));