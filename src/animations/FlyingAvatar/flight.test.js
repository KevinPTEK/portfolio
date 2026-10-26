import { describe, expect, it } from 'vitest'
import { flightAt, flightDistance, flightSamples } from './flight.js'

// Les emplacements mesurés dans Chrome, en bureau (1 440 × 900)
const desktop = {
  from: { left: 40, top: 40, size: 104 },
  to: { left: 32, top: 32, size: 56 },
  distance: 405,
}
// mobile 320 × 568 : vers la barre du haut (28 px)
const mobile = {
  from: { left: 20, top: 32, size: 104 },
  to: { left: 20, top: 14, size: 28 },
  distance: 260,
}
// un très grand écran (2 160 px de haut) : le vol le plus long
const tall = { ...desktop, distance: flightDistance(2160) }

describe('flightDistance', () => {
  it.each([
    [900, 405],
    [1024, 460.8],
    // sous 578 px de haut, 45 % ferait moins de 260 px : le minimum
    [568, 260],
    [400, 260],
  ])('écran de %s px : %s px de défilement', (height, distance) => {
    expect(flightDistance(height)).toBeCloseTo(distance, 10)
  })
})

describe('flightAt', () => {
  it('en haut de la page : sur l’emplacement de l’accueil', () => {
    expect(flightAt(0, desktop)).toEqual({ x: 40, y: 40, size: 104 })
  })

  // la courbe part vite : au quart du défilement, déjà 44 % du vol
  it('au quart du vol : déjà bien en route vers la nav', () => {
    const { x, y, size } = flightAt(101.25, desktop)
    expect(x).toBeCloseTo(36.5, 10)
    expect(y).toBeCloseTo(-20.453125, 10)
    expect(size).toBeCloseTo(83, 10)
  })

  it('à mi-vol : aux trois quarts du chemin entre le départ (qui a défilé) et la nav', () => {
    const { x, y, size } = flightAt(202.5, desktop)
    expect(x).toBeCloseTo(34, 10)
    expect(y).toBeCloseTo(-16.625, 10)
    expect(size).toBeCloseTo(68, 10)
  })

  it.each([405, 1200])('à %s px et au-delà : posé dans la nav', (scrollY) => {
    expect(flightAt(scrollY, desktop)).toEqual({ x: 32, y: 32, size: 56 })
  })

  it('sur mobile : vers la barre du haut', () => {
    expect(flightAt(260, mobile)).toEqual({ x: 20, y: 14, size: 28 })
    const { y, size } = flightAt(130, mobile)
    expect(y).toBeCloseTo(-14, 10)
    expect(size).toBeCloseTo(47, 10)
  })
})

describe('flightSamples', () => {
  it('le vol en points réguliers, du départ (0) à l’arrivée (1)', () => {
    const samples = flightSamples(desktop, 4)
    expect(samples.map(({ offset }) => offset)).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(samples[0]).toEqual({ offset: 0, x: 40, y: 40, size: 104 })
    expect(samples[2]).toEqual({ offset: 0.5, ...flightAt(202.5, desktop) })
    expect(samples[4]).toEqual({ offset: 1, x: 32, y: 32, size: 56 })
  })

  // Le navigateur relie les points par des droites : entre deux points, il
  // s'écarte de la vraie courbe. À chaque pixel de défilement, l'écart reste
  // sous un demi-pixel (assez de points par défaut), jusqu'au plus long vol
  it.each([
    ['bureau', desktop],
    ['mobile', mobile],
    ['2 160 px de haut', tall],
  ])(
    '%s : les droites suivent la courbe à moins d’un demi-pixel',
    (_, geometry) => {
      const samples = flightSamples(geometry)
      let worst = 0
      for (let scrollY = 0; scrollY <= geometry.distance; scrollY++) {
        const progress = scrollY / geometry.distance
        const next = samples.findIndex(({ offset }) => offset >= progress)
        const after = samples[next]
        const before = samples[Math.max(0, next - 1)]
        const span = after.offset - before.offset
        const t = span === 0 ? 0 : (progress - before.offset) / span
        const exact = flightAt(scrollY, geometry)
        for (const key of ['x', 'y', 'size']) {
          const drawn = before[key] + (after[key] - before[key]) * t
          worst = Math.max(worst, Math.abs(drawn - exact[key]))
        }
      }
      expect(worst).toBeLessThan(0.5)
    },
  )
})
