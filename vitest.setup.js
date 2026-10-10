import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Démonte les composants rendus pour que chaque test reparte d'une page vide
afterEach(() => {
  cleanup()
  // « réduire les animations » et le stockage de session reviennent à zéro
  // (absents dans les tests en environnement node)
  if (globalThis.window?.happyDOM) {
    window.happyDOM.settings.device.prefersReducedMotion = 'no-preference'
    window.sessionStorage.clear()
  }
})
