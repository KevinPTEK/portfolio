import { describe, expect, it } from 'vitest'
import { pad } from './pad.js'

describe('pad', () => {
  it.each([
    [1, '01'],
    [9, '09'],
    [12, '12'],
    [120, '120'],
  ])('écrit %i sur deux chiffres au moins : « %s »', (number, text) => {
    expect(pad(number)).toBe(text)
  })
})
