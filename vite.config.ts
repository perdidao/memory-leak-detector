import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, 'src/content/contentScript.ts'),
        injected: resolve(__dirname, 'src/content/injected.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'contentScript') {
            return 'content/[name].js'
          } else if (chunkInfo.name === 'injected') {
            return 'content/[name].js'
          }
          return 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
