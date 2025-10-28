import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'das-front.local',
      'das-back.local',
      'http://127.0.0.1:8082',
      'http://localhost:8082'
      //'http://192.168.0.18:8082',
      //'http://192.168.0.18'
    ],
    host: true,
    port: 3000,
    proxy: {
      "/api/catalogo": {
        target: "https://backenddonaciones.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      "/solicitudes-sin-responder": {
        target: "http://localhost:8082",
        //target: "http://192.168.0.18:8082",
       // target: "http://das-front.local",

        changeOrigin: true,
        secure: false,
        timeout: 30000, // Agrega timeout
        // Agrega logs para debug
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Agrega también el otro endpoint
      "/solicitudes": {
        target: "http://localhost:8082",
       // target: "http://das-back.local",
        changeOrigin: true,
        secure: false,
        timeout: 30000,
      },
    },
  },
})