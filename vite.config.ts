import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content-Security-Policy for the built site. The app is fully static, so this
// is defense-in-depth: even if a hero-data string or an imported share code
// somehow smuggled markup past React's escaping, the browser would refuse to
// run injected scripts or reach untrusted origins.
//
//   script-src 'self'      — only our own bundle; no inline/eval (the SPA
//                            restore shim lives in public/spa-restore.js).
//   style-src  'unsafe-inline' — motion/animation libraries set inline styles.
//   img-src / connect-src  — self + the floofpire CDN that serves framed hero
//                            icons and boss art (fetched/inlined by html-to-image).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://raw.githubusercontent.com",
  "connect-src 'self' data: https://raw.githubusercontent.com",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

// Injects the CSP as a <meta> tag at build time only. The dev server relies on
// inline scripts (HMR client, React Refresh), so applying the policy there would
// break `npm run dev`.
function cspPlugin(): Plugin {
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/AFKArenaCompanionsHub/',
  plugins: [react(), tailwindcss(), cspPlugin()],
})
