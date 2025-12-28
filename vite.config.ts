import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.REACT_APP_BASE_URL || 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.ENCRYPTION_KEY': JSON.stringify(env.ENCRYPTION_KEY),
        'process.env.REACT_APP_BASE_URL': JSON.stringify(env.REACT_APP_BASE_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      }
    };
});
