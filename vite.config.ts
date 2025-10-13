import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: './src/test/setup.ts',
    environment: 'jsdom',
    deps: {
      inline: [
        '@mui/x-data-grid',
        '@mui/x-data-grid-pro',
        '@mui/x-data-grid-premium',
      ],
    },
  },
})