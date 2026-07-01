import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy all /auth, /employees, /departments etc. to the Spring Boot backend
      '/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/users': { target: 'http://localhost:8080', changeOrigin: true },
      '/departments': { target: 'http://localhost:8080', changeOrigin: true },
      '/employees': { target: 'http://localhost:8080', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8080', changeOrigin: true },
      '/analytics': { target: 'http://localhost:8080', changeOrigin: true },
      '/reports': { target: 'http://localhost:8080', changeOrigin: true },
      '/tasks': { target: 'http://localhost:8080', changeOrigin: true },
      '/approval-workflows': { target: 'http://localhost:8080', changeOrigin: true },
      '/employee-documents': { target: 'http://localhost:8080', changeOrigin: true },
      '/employee-timelines': { target: 'http://localhost:8080', changeOrigin: true },
      '/workflow-templates': { target: 'http://localhost:8080', changeOrigin: true },
      '/escalations': { target: 'http://localhost:8080', changeOrigin: true },
      '/notifications': { target: 'http://localhost:8080', changeOrigin: true },
      '/audit-logs': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
