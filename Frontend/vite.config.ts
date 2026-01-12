import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: process.env.GITHUB_PAGES === 'true' ? '/photo/' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      allowedHosts: ['meobeo-studio.azurewebsites.net'],
      proxy: {
        '/be/api': {
          target: 'https://meobeo-studio.azurewebsites.net/',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },

    preview: {
      allowedHosts: ['meobeo-studio.azurewebsites.net'],
    },
  }
})
