import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource/playfair-display/latin-400.css'
import '@fontsource/playfair-display/latin-400-italic.css'
import './styles/main.scss'
import { App } from './App.jsx'
import { MotionProvider } from './animations/MotionProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* le cadre des animations : « réduire les animations », moteur chargé après coup (§ 7.1) */}
    <MotionProvider>
      <App />
    </MotionProvider>
  </StrictMode>,
)
