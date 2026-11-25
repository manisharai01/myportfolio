import React from 'react'
import ReactDOM from 'react-dom/client'
// Self-hosted variable fonts (no third-party font requests)
import '@fontsource-variable/anybody/standard.css' // wght + wdth
import '@fontsource-variable/hanken-grotesk/index.css'
import '@fontsource-variable/martian-mono/standard.css'
import '@fontsource-variable/fraunces/wght-italic.css'
import './styles/base.css'
import App from './App.jsx'
import { checkVariableFonts } from './lib/fontcheck'
import { syncSignal } from './lib/signal'

checkVariableFonts()
syncSignal() // newest git stats, fetched while the preloader runs

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
