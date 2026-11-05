import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Hacer React disponible globalmente para JSX runtime automático
global.React = React;

// Limpiar después de cada test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock global de fetch
global.fetch = vi.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock de ResizeObserver (necesario para algunos componentes)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));