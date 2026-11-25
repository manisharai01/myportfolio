import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Fills {{commits}} / {{repos}} in index.html's meta tags from the bundled git stats. */
const gitStatsInHtml = {
  name: 'git-stats-in-html',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const s = JSON.parse(readFileSync(new URL('./src/data/signal.json', import.meta.url), 'utf8'))
      return html
        .replaceAll('{{commits}}', `${(Math.floor(s.commits / 100) * 100).toLocaleString('en-IN')}+`)
        .replaceAll('{{repos}}', String(s.reposWork + s.reposPersonal))
    },
  },
}

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
  plugins: [portableVariableFonts, gitStatsInHtml, react()],
  base: './',
  server: { port: 5173, open: true },
})
