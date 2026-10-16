import { describe, expect, it } from 'vitest'
import { STROKES, ring, seal, stroke } from './seal.js'

describe('le sceau KR', () => {
  it('six traits, dans l’ordre du tracé, avec un souffle entre K et R', () => {
    expect(STROKES.map(({ delay }) => delay)).toEqual([
      0, 0.13, 0.26, 0.46, 0.59, 0.74,
    ])
    expect(STROKES.map(({ accent }) => Boolean(accent))).toEqual([
      false,
      false,
      false,
      true,
      true,
      true,
    ])
  })

  it('le cercle se dessine en 1,15 s, à partir de 0,1 s', () => {
    expect(ring.drawn.transition).toMatchObject({ duration: 1.15, delay: 0.1 })
  })

  it('chaque trait : 0,6 s, parti à 0,7 s + son départ (le cercle se referme encore)', () => {
    expect(stroke.drawn(0.46).transition).toMatchObject({
      duration: 0.6,
      delay: 1.16,
    })
  })

  it('il se dissout en 1,6 s : il inspire, grandit, s’efface', () => {
    expect(seal.dissolved.scale).toEqual([1, 1.035, 1.25])
    expect(seal.dissolved.opacity).toEqual([1, 1, 0])
    expect(seal.dissolved.transition.duration).toBe(1.6)
  })
})
