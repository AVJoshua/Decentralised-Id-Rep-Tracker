import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  base: '/Decentralised-Id-Rep-Tracker-/',
  plugins: [
    // Node polyfills MUST come first — OPNet uses Buffer, crypto, stream, events
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'events', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['buffer', '@btc-vision/walletconnect'],
  },
  build: {
    target: 'es2022',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: '0.0.0.0',  // Expose to Windows host in WSL2
    port: 5173,
  },
})
