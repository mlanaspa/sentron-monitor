import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga variables locales (.env)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Prioridad: Variable del sistema (Render) > Variable archivo .env > undefined
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY)
    },
    server: {
      host: true, 
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})