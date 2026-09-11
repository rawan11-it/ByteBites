import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  // Detect if running behind HTTPS (AI Studio Cloud Run reverse proxy)
  const isHttps = process.env.APP_URL?.startsWith('https') || process.env.HTTPS === 'true';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      // Robust HMR configuration for AI Studio reverse proxy and iframe environments
      hmr: {
        protocol: isHttps ? 'wss' : 'ws',
        clientPort: isHttps ? 443 : 3000,
        overlay: false,
      },
      watch: {
        usePolling: false,
        ignored: ['**/data/**', '**/.git/**', '**/dist/**'],
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    },
  };
});
