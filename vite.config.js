import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile({ useRecommendedBuildConfig: false })],
  build: {
    target: 'es2015',
    assetsInlineLimit: () => true,
    chunkSizeWarningLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    codeSplitting: false,
    assetsDir: '',
  },
})
