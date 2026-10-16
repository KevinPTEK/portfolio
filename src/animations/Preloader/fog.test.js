import { describe, expect, it } from 'vitest'
import { createFog, createNoise, fogSize, smoothstep } from './fog.js'

// un hasard reproductible : le même brouillard à chaque test
function seeded(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}
const image = (width, height) => ({
  data: new Uint8ClampedArray(width * height * 4),
})
// une image déjà peinte, opaque partout : draw doit effacer lui-même (une image
// neuve est transparente — un draw qui n'écrit rien passait le test « levé »)
const painted = (width, height) => {
  const frame = image(width, height)
  frame.data.fill(255)
  return frame
}
const alphas = ({ data }) => data.filter((_, i) => i % 4 === 3)

describe('smoothstep', () => {
  it.each([
    [0, 1, -1, 0],
    [0, 1, 0.5, 0.5],
    [0, 1, 2, 1],
    [0.2, 0.4, 0.3, 0.5],
    [0.2, 0.4, 0.25, 0.15625],
  ])('entre %s et %s, à %s : %s', (a, b, value, expected) => {
    expect(smoothstep(a, b, value)).toBeCloseTo(expected, 10)
  })
})

describe('fogSize', () => {
  it.each([
    [1440, 900, { width: 240, height: 150 }],
    [375, 812, { width: 94, height: 203 }],
    [2560, 1440, { width: 240, height: 135 }],
  ])('écran %s × %s : canvas %o', (w, h, size) => {
    expect(fogSize(w, h)).toEqual(size)
  })
})

describe('createNoise', () => {
  it('reproductible avec le même hasard, entre 0 et 1', () => {
    const a = createNoise(seeded(7))
    const b = createNoise(seeded(7))
    for (let i = 0; i < 50; i++) {
      const [x, y] = [i * 0.37, i * 0.53]
      expect(a.noise(x, y)).toBe(b.noise(x, y))
      expect(a.fbm(x, y)).toBeGreaterThanOrEqual(0)
      expect(a.fbm(x, y)).toBeLessThanOrEqual(1)
    }
  })
})

describe('createFog', () => {
  const size = { width: 24, height: 15 }
  const fog = createFog({ ...size, noise: createNoise(seeded(3)) })

  it('avant l’ouverture (p = 0) : le voile sombre, partout opaque', () => {
    const frame = image(size.width, size.height)
    fog.draw(0.5, 0, frame)
    expect(alphas(frame).every((a) => a === 255)).toBe(true)
    // rouge entre le voile le plus sombre (58) et le plus clair (102)
    for (let i = 0; i < frame.data.length; i += 4) {
      expect(frame.data[i]).toBeGreaterThanOrEqual(58)
      expect(frame.data[i]).toBeLessThanOrEqual(102)
    }
  })

  it('levé (p = 1) : plus rien', () => {
    const frame = painted(size.width, size.height)
    fog.measure(1)
    fog.draw(4, 1, frame)
    expect(alphas(frame).every((a) => a === 0)).toBe(true)
  })

  it('à mi-lever : des trouées et de la brume', () => {
    const frame = painted(size.width, size.height)
    fog.measure(2)
    fog.draw(3, 0.6, frame)
    const values = alphas(frame)
    expect(values.some((a) => a === 0)).toBe(true)
    expect(values.some((a) => a > 0)).toBe(true)
  })
})
