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
      allowedHosts: ['photo.wc504.io.vn'],
      proxy: {
        '/v1': {
          target: env.VITE_API_ENDPOINT ?? 'https://photo.wc504.io.vn/be/api',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      allowedHosts: ['photo.wc504.io.vn'],
    },
  }
})
