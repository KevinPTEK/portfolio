import { describe, expect, it } from 'vitest'
import { REDUCED_MOTION } from '../hooks/useMediaQuery.js'
import { preferReducedMotion } from './motion.js'

// vitest.setup.js remet le réglage et le stockage à zéro après chaque test :
// sans cela, un test « réduire les animations » déteindrait sur les suivants.
// Ces tests se suivent dans l'ordre (le second vérifie la remise à zéro).
describe('preferReducedMotion et la remise à zéro entre deux tests', () => {
  it('simule « réduire les animations », et remplit le stockage de session', () => {
    preferReducedMotion()
    window.sessionStorage.setItem('essai', '1')
    expect(window.matchMedia(REDUCED_MOTION).matches).toBe(true)
  })

  it('… le temps d’un test seulement', () => {
    expect(window.matchMedia(REDUCED_MOTION).matches).toBe(false)
    expect(window.sessionStorage.getItem('essai')).toBe(null)
  })
})
