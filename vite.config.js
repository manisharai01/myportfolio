import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Fontsource declares variable fonts with format('woff2-variations'). WebKit builds that
 * don't recognise that hint skip the font entirely (verified in Playwright WebKit), so iOS
 * could fall back to system fonts. Plain format('woff2') loads everywhere, and the file is
 * still variable, so the axes keep working.
 */
const portableVariableFonts = {
  name: 'portable-variable-fonts',
  enforce: 'pre',
  transform(code, id) {
    if (id.includes('@fontsource-variable') && /\.css($|\?)/.test(id)) {
      return code.replace(/format\(\s*['"]woff2-variations['"]\s*\)/g, "format('woff2')")
    }
  },
}

export default defineConfig({
  plugins: [portableVariableFonts, react()],
  base: './',
  server: { port: 5173, open: true },
})
