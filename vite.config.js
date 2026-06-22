import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Automatically derive base from the GitHub repo name so assets load correctly
// on GitHub Pages regardless of what the repo is named.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : '/',
  server: { port: 5173, open: true }
})
