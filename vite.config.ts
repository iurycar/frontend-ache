import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ...existing code...
export default defineConfig(({ mode }) => {
  const backendHost = '127.0.0.1'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: `http://${backendHost}:5000`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})