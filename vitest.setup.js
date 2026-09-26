import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Démonte les composants rendus pour que chaque test reparte d'une page vide
afterEach(() => {
  cleanup()
})
