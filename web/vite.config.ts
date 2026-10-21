import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento local (npm run dev) o /api vai para a API publicada pelo compose
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
});
