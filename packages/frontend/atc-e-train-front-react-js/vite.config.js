// vite.config.js - 开发服务器代理 /api 到后端 e-train 微服务（3206）
// target 用 127.0.0.1 而不是 localhost：Node 17+ 会把 localhost 先解析成 IPv6(::1)，
// 后端若只监听 IPv4 就会出现 ECONNREFUSED ::1:3206，写死 IPv4 彻底规避
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3206',
        changeOrigin: true,
      },
    },
  },
});
