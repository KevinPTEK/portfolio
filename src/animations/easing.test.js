import { describe, expect, it } from 'vitest'
import { easeInOutQuint } from './easing.js'

// La courbe du défilement (charte : « courbe quintique ») : lente au départ,
// rapide au milieu, lente à l'arrivée — symétrique autour de la moitié
describe('easeInOutQuint', () => {
  it.each([
    [0, 0],
    [0.25, 0.015625],
    // de part et d'autre du milieu : la bascule entre les deux formules est
    // bien à 0,5 (elles y valent toutes deux 0,5)
    [0.45, 0.295245],
    [0.5, 0.5],
    [0.55, 0.704755],
    [0.75, 0.984375],
    [1, 1],
  ])('à %s du temps : %s du trajet', (t, expected) => {
    expect(easeInOutQuint(t)).toBeCloseTo(expected, 10)
  })
})
