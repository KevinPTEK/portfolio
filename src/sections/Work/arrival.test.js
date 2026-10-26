import { describe, expect, it } from 'vitest'
import { arrivalOf } from './arrival.js'

// L'arrivée d'un projet : 0 quand son repère touche le bas de l'écran, 1 en haut
describe('arrivalOf', () => {
  it.each([
    [1000, 1000, 0], // le repère au bas de l'écran : rien n'est arrivé
    [600, 1000, 0.4],
    [450, 900, 0.5], // une autre hauteur d'écran
    [0, 1000, 1], // le repère en haut : arrivé
    [1500, 1000, 0], // encore plus bas : 0, pas moins
    [-300, 1000, 1], // déjà passé : 1, pas plus
    [0, 0, 0], // un écran sans hauteur (cadre masqué) : 0, pas NaN (0 / 0)
  ])('repère à %s px d’un écran de %s px : %s', (top, height, expected) => {
    expect(arrivalOf(top, height)).toBeCloseTo(expected, 10)
  })
})
