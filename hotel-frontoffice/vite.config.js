import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // === Build Configuration ===
  build: {
    // Output directory where Vercel will serve files from
    outDir: 'dist',
    
    // Generate source maps in production for debugging
    sourcemap: true,
    
    // Performance hints - warn if chunks are too large
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for optimal bundling
    rollupOptions: {
      output: {
        // Ensure consistent asset hashing for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  
  // === Server Configuration (for local development) ===
  server: {
    // Enable HMR (Hot Module Replacement) for faster development
    hmr: true,
    // Port for dev server
    port: 5173
  }
})
