import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    // Configurar React 19 con automatic JSX runtime
    deps: {
      inline: ['react', 'react-dom', 'react-router-dom'],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.js',
        'src/main.jsx',
        'src/App.jsx',
        '*.config.js',
      ],
    },
  },
});