import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-and-build-content-scripts',
      closeBundle() {
        // Ensure content directory exists
        mkdirSync(resolve(__dirname, 'dist/content'), { recursive: true })

        // Copy injected.js directly
        copyFileSync(
          resolve(__dirname, 'src/content/injected.js'),
          resolve(__dirname, 'dist/content/injected.js')
        )
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, 'src/content/contentScript.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Content scripts need specific naming
          if (chunkInfo.name === 'contentScript') {
            return 'content/contentScript.js'
          }
          // Other entries (popup, etc)
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    // Use commonjs/iife for content scripts for better compatibility
    target: 'es2015',
    minify: 'terser',
  },
})
