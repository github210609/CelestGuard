import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: "3000"
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/base/variables" as *;
          @use "@/styles/base/mixins" as *;
        `,
        api: "modern",
        sassOptions: {
          outputStyle: 'expanded',
          sourceMap: true,
          charset: false
        }
      }
    },
    devSourcemap: true
  }
})
