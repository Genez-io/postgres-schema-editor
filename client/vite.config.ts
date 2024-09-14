import { defineConfig } from 'vite';
import dns from 'dns';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

dns.setDefaultResultOrder('verbatim');
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
    commonjsOptions: {
      esmExternals: true,
    },
  },
  plugins: [
    react({
      include: '**/*.{jsx,tsx}',
    }),
  ],
});
