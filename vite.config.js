import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/league-akari-web/',
  server: {
    port: 3000,
    proxy: {
      // 代理腾讯 API 解决 CORS 问题
      '/api/cn': {
        target: 'https://apps.game.qq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cn/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Referer', 'https://lol.qq.com/')
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
          })
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
