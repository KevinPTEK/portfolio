import { describe, expect, it } from 'vitest'
import { easeInOutQuad, easeInOutQuint, easeOutQuad } from './easing.js'

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

// Quadratique, plus douce que la quintique (le brouillard de l'intro, § 7.4)
describe('easeInOutQuad', () => {
  it.each([
    [0, 0],
    [0.25, 0.125],
    // de part et d'autre du milieu, comme pour la quintique
    [0.45, 0.405],
    [0.5, 0.5],
    [0.55, 0.595],
    [0.75, 0.875],
    [1, 1],
  ])('à %s du temps : %s du trajet', (t, expected) => {
    expect(easeInOutQuad(t)).toBeCloseTo(expected, 10)
  })
})

// La courbe du vol de l'avatar (§ 7.9) : rapide au départ, elle freine à
// l'arrivée — l'avatar quitte tôt le portrait qui défile (choix de Kevin)
describe('easeOutQuad', () => {
  it.each([
    [0, 0],
    [0.25, 0.4375],
    [0.5, 0.75],
    [0.75, 0.9375],
    [1, 1],
  ])('à %s du temps : %s du trajet', (t, expected) => {
    expect(easeOutQuad(t)).toBeCloseTo(expected, 10)
  })
})
