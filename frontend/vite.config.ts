import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/players': 'http://localhost:8080',
      '/matches': 'http://localhost:8080',
      '/match_player_stats': 'http://localhost:8080',
    },
  },
})
