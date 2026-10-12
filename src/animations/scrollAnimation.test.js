import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { scrollAnimation } from './scrollAnimation.js'

// de faux requestAnimationFrame et performance : une image toutes les 16 ms
describe('scrollAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const run = (options) => {
    const positions = []
    const animation = scrollAnimation(100, 900, {
      duration: 1,
      ease: (t) => t * t,
      onUpdate: (y) => positions.push(y),
      ...options,
    })
    return { animation, positions }
  }

  it('suit la courbe : à mi-temps, le quart du trajet (t²)', () => {
    const { positions } = run()
    vi.advanceTimersByTime(500)
    // t ≈ 0,5 → 100 + 800 × 0,25 = 300 (à une image près)
    expect(Math.abs(positions.at(-1) - 300)).toBeLessThan(15)
  })

  it('arrive exactement à la cible, à la durée donnée, puis s’arrête', async () => {
    // 0,41 s : la dernière image (416 ms) dépasse la durée — sans plafond,
    // la page irait au-delà de la cible
    const { animation, positions } = run({ duration: 0.41 })
    const done = vi.fn()
    animation.then(done)
    vi.advanceTimersByTime(399)
    expect(positions.at(-1)).toBeLessThan(900)
    vi.advanceTimersByTime(100)
    expect(positions.at(-1)).toBe(900)
    const count = positions.length
    vi.advanceTimersByTime(500)
    expect(positions).toHaveLength(count)
    await Promise.resolve()
    expect(done).toHaveBeenCalled()
  })

  it('stop() : plus aucune position ensuite, et pas de fin annoncée', async () => {
    const { animation, positions } = run()
    const done = vi.fn()
    animation.then(done)
    vi.advanceTimersByTime(200)
    animation.stop()
    const count = positions.length
    vi.advanceTimersByTime(2000)
    expect(positions).toHaveLength(count)
    await Promise.resolve()
    expect(done).not.toHaveBeenCalled()
  })
})
