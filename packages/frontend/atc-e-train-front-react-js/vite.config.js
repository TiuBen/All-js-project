// vite.config.js - 开发服务器代理 /api 到后端 e-train 微服务（3206）
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3206',
        changeOrigin: true,
      },
    },
  },
});
